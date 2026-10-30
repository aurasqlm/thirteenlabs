import asyncio
import io
import json
import os
import re
from typing import Optional, Set
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import edge_tts
from pydub import AudioSegment

app = FastAPI(
    title="ThirteenLabs Audio Engine",
    description="High-fidelity free neural audio generation engine for ThirteenLabs (thirteenlabs.bond) by aurasqlm",
    version="1.0.0"
)

# CORS setup supporting all origins, custom domains, and Cloudflare Pages
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Clean SSML tags and convert custom emotion extensions with attribute support
def preprocess_text(text: str) -> str:
    cleaned = re.sub(r'\[(?:cough|throat-clear|gasp|sigh|yawn|snort|wheeze)[^\]]*\]', ' ... ', text, flags=re.IGNORECASE)
    cleaned = re.sub(r'\[(?:laugh|giggle|snicker|chuckle|cackle|smirk)[^\]]*\]', ' haha! ', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\[(?:whisper)[^\]]*\]', ' ', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\[(?:shout|yell|cheer)[^\]]*\]', '! ', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\[pause\s*([0-9.]+)s?\]', ' ... ', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\[.*?\]', '', cleaned)
    return cleaned.strip()

# Valid Edge voices cache
VALID_EDGE_VOICES: Set[str] = set()

FALLBACK_VOICES = {
    "en-US": {"Female": "en-US-JennyNeural", "Male": "en-US-GuyNeural", "Default": "en-US-AndrewMultilingualNeural"},
    "en-GB": {"Female": "en-GB-SoniaNeural", "Male": "en-GB-RyanNeural", "Default": "en-GB-RyanNeural"},
    "es-ES": {"Female": "es-ES-ElviraNeural", "Male": "es-ES-AlvaroNeural", "Default": "es-ES-AlvaroNeural"},
    "fr-FR": {"Female": "fr-FR-DeniseNeural", "Male": "fr-FR-HenriNeural", "Default": "fr-FR-HenriNeural"},
    "de-DE": {"Female": "de-DE-KatjaNeural", "Male": "de-DE-ConradNeural", "Default": "de-DE-ConradNeural"},
    "ja-JP": {"Female": "ja-JP-NanamiNeural", "Male": "ja-JP-KeitaNeural", "Default": "ja-JP-KeitaNeural"},
    "zh-CN": {"Female": "zh-CN-XiaoxuanNeural", "Male": "zh-CN-YunxiNeural", "Default": "zh-CN-YunxiNeural"},
    "ko-KR": {"Female": "ko-KR-SunHiNeural", "Male": "ko-KR-InJoonNeural", "Default": "ko-KR-SunHiNeural"},
    "hi-IN": {"Female": "hi-IN-SwaraNeural", "Male": "hi-IN-MadhurNeural", "Default": "hi-IN-MadhurNeural"},
    "ar-SA": {"Female": "ar-SA-ZariyahNeural", "Male": "ar-SA-HamedNeural", "Default": "ar-SA-HamedNeural"},
}

def adjust_pct(base_str: str, delta_int: int) -> str:
    try:
        val = int(base_str.replace('%', '').replace('+', ''))
    except Exception:
        val = 0
    total = max(-50, min(100, val + delta_int))
    return f"+{total}%" if total >= 0 else f"{total}%"

def adjust_hz(base_str: str, delta_int: int) -> str:
    try:
        val = int(base_str.replace('Hz', '').replace('+', ''))
    except Exception:
        val = 0
    total = max(-50, min(50, val + delta_int))
    return f"+{total}Hz" if total >= 0 else f"{total}Hz"

SFX_DIR = os.path.join(os.path.dirname(__file__), "sfx")
SFX_MAP = {
    'haha': 'laugh.mp3',
    'laugh': 'laugh.mp3',
    'chuckle': 'laugh.mp3',
    'giggle': 'laugh.mp3',
    'snicker': 'laugh.mp3',
    'cackle': 'laugh.mp3',
    'cough': 'cough.mp3',
    'throat-clear': 'throat_clear.mp3',
    'throat_clear': 'throat_clear.mp3',
    'ahem': 'throat_clear.mp3',
    'sigh': 'sigh.mp3',
    'gasp': 'gasp.mp3',
    'yawn': 'yawn.mp3',
    'sneeze': 'sneeze.mp3',
}

def format_whisper_text(text: str) -> str:
    return text.strip()

def parse_emotion_segments(raw_text: str):
    tag_pattern = re.compile(r'\[([a-zA-Z0-9_.:\- ]+)\]')
    parts = tag_pattern.split(raw_text)

    segments = []
    current_emotion = 'normal'
    pending_pause = 0

    for i in range(len(parts)):
        part = parts[i]
        if i % 2 == 1:
            tag = part.strip().lower()

            # Check for authentic human vocal SFX tags
            matched_sfx = None
            for sfx_key, sfx_file in SFX_MAP.items():
                if sfx_key in tag:
                    matched_sfx = sfx_file
                    break

            if matched_sfx:
                segments.append({
                    'type': 'sfx',
                    'sfx_file': matched_sfx,
                    'pause_before_ms': pending_pause + 80
                })
                pending_pause = 80
            elif 'pause' in tag:
                match = re.search(r'([0-9.]+)\s*s?', tag)
                if match:
                    pending_pause += int(float(match.group(1)) * 1000)
                elif 'dramatic' in tag:
                    pending_pause += 1200
                else:
                    pending_pause += 500
            elif any(w in tag for w in ['whisper', 'soft', 'gentle', 'quiet', 'intimate']):
                current_emotion = 'whisper'
            elif any(w in tag for w in ['shout', 'yell', 'scream', 'cheer']):
                current_emotion = 'shout'
            elif any(w in tag for w in ['cry', 'crying', 'sob', 'sobbing', 'sad', 'grieving', 'melancholy', 'tearful']):
                current_emotion = 'sad'
            elif any(w in tag for w in ['angry', 'furious', 'seething', 'growl', 'snarl']):
                current_emotion = 'angry'
            elif any(w in tag for w in ['nervous', 'tremble', 'stammer', 'shaky']):
                current_emotion = 'nervous'
            elif any(w in tag for w in ['robot', 'dsp:robot']):
                current_emotion = 'robot'
            elif any(w in tag for w in ['radio', 'walkie', 'telephone']):
                current_emotion = 'radio'
            elif any(w in tag for w in ['slow', 'tempo:slow-down', 'deliberate']):
                current_emotion = 'slow'
            elif any(w in tag for w in ['fast', 'tempo:speed-up', 'rushed']):
                current_emotion = 'fast'
            elif any(w in tag for w in ['excited', 'bubbly', 'thrilled']):
                current_emotion = 'excited'
            elif any(w in tag for w in ['mysterious', 'cryptic', 'haunting']):
                current_emotion = 'mysterious'
        else:
            text = part.strip()
            if text:
                segments.append({
                    'type': 'speech',
                    'text': text,
                    'emotion': current_emotion,
                    'pause_before_ms': pending_pause
                })
                pending_pause = 0

    if pending_pause > 0 and segments:
        segments[-1]['pause_after_ms'] = pending_pause

    return segments

async def ensure_valid_voices():
    global VALID_EDGE_VOICES
    if not VALID_EDGE_VOICES:
        # Load pre-bundled 322 authentic edge voices first for 0ms startup
        candidates = [
            os.path.join(os.path.dirname(__file__), "edgeVoices.json"),
            os.path.join(os.path.dirname(__file__), "..", "src", "lib", "edgeVoices.json"),
        ]
        json_path = next((p for p in candidates if os.path.exists(p)), None)
        if json_path:
            try:
                with open(json_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    VALID_EDGE_VOICES = {
                        v.get("shortName") or v.get("ShortName") or v["id"]
                        for v in data
                        if "shortName" in v or "ShortName" in v or "id" in v
                    }
            except Exception:
                pass

        if not VALID_EDGE_VOICES:
            try:
                voices = await edge_tts.list_voices()
                VALID_EDGE_VOICES = {v["ShortName"] for v in voices}
            except Exception:
                VALID_EDGE_VOICES = {
                    "en-US-AndrewMultilingualNeural", "en-US-AvaMultilingualNeural",
                    "en-US-BrianMultilingualNeural", "en-US-EmmaMultilingualNeural",
                    "en-US-JennyNeural", "en-US-GuyNeural", "en-GB-RyanNeural",
                    "en-GB-SoniaNeural", "es-ES-AlvaroNeural", "fr-FR-HenriNeural",
                    "de-DE-ConradNeural", "ja-JP-KeitaNeural", "zh-CN-YunxiNeural"
                }

def resolve_voice_id(requested_voice: str) -> str:
    """Safely maps any requested voice ID to a guaranteed valid Edge-TTS voice."""
    if requested_voice in VALID_EDGE_VOICES:
        return requested_voice

    # Check for direct ShortName match ignoring case
    for v in VALID_EDGE_VOICES:
        if v.lower() == requested_voice.lower():
            return v

    # Parse locale from string (e.g. voice-en-US-leo -> en-US or voice-pt-BR-...)
    locale_match = re.search(r'([a-z]{2}-[A-Z]{2})', requested_voice, re.IGNORECASE)
    if locale_match:
        locale = locale_match.group(1)
        parts = locale.split('-')
        norm_locale = f"{parts[0].lower()}-{parts[1].upper()}"
        is_female = "female" in requested_voice.lower() or "girl" in requested_voice.lower()

        # 1. Check explicit fallback table
        if norm_locale in FALLBACK_VOICES:
            gender = "Female" if is_female else "Male"
            return FALLBACK_VOICES[norm_locale].get(gender, FALLBACK_VOICES[norm_locale]["Default"])

        # 2. Dynamically match against all valid Edge voices for this exact locale
        matching = [v for v in VALID_EDGE_VOICES if v.lower().startswith(norm_locale.lower())]
        if matching:
            return matching[0]

        # 3. Match by primary language code prefix (e.g. "pt", "it", "ru", "tr")
        lang_code = parts[0].lower()
        matching_lang = [v for v in VALID_EDGE_VOICES if v.lower().startswith(f"{lang_code}-")]
        if matching_lang:
            return matching_lang[0]

    return "en-US-AndrewMultilingualNeural"

class GenerateRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=50000)
    voice: str = "en-US-AndrewMultilingualNeural"
    rate: str = "+0%"
    pitch: str = "+0Hz"
    volume: str = "+0%"
    format: str = "mp3"
    stability: Optional[int] = 75
    similarity: Optional[int] = 85

@app.on_event("startup")
async def on_startup():
    await ensure_valid_voices()

@app.get("/")
async def root():
    return {
        "engine": "ThirteenLabs Neural Engine",
        "author": "aurasqlm",
        "github": "https://github.com/aurasqlm/thirteenlabs",
        "status": "online",
        "domain": "thirteenlabs.bond",
        "cached_edge_voices": len(VALID_EDGE_VOICES)
    }

@app.get("/api/voices")
async def list_voices():
    """Returns list of all available high-quality neural voices."""
    try:
        voices = await edge_tts.list_voices()
        return {"status": "success", "count": len(voices), "voices": voices}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def synthesize_single_segment(text: str, voice: str, rate: str, pitch: str, volume: str) -> AudioSegment:
    comm = edge_tts.Communicate(text=text, voice=voice, rate=rate, pitch=pitch, volume=volume)
    buf = io.BytesIO()
    async for chunk in comm.stream():
        if chunk["type"] == "audio":
            buf.write(chunk["data"])
    buf.seek(0)
    return AudioSegment.from_file(buf, format="mp3")

async def process_speech_generation(req: GenerateRequest):
    await ensure_valid_voices()
    safe_voice = resolve_voice_id(req.voice)
    segments = parse_emotion_segments(req.text)

    if not segments:
        clean_text = preprocess_text(req.text) or req.text
        segments = [{"text": clean_text, "emotion": "normal", "pause_before_ms": 0}]

    try:
        # Fast path for single standard segment with no emotion modifications
        if len(segments) == 1 and segments[0]["emotion"] == "normal" and segments[0].get("pause_before_ms", 0) == 0:
            sound = await synthesize_single_segment(
                text=segments[0]["text"],
                voice=safe_voice,
                rate=req.rate,
                pitch=req.pitch,
                volume=req.volume
            )
        else:
            # Multi-segment acoustic & DSP emotion synthesis with authentic SFX integration
            master = AudioSegment.empty()
            for seg in segments:
                pause_before = seg.get("pause_before_ms", 0)
                if pause_before > 0:
                    master += AudioSegment.silent(duration=pause_before)
                elif len(master) > 0 and seg.get("emotion") == "whisper":
                    master += AudioSegment.silent(duration=200)

                # 1. Handle Authentic Human Vocal Sound Effects (cough, laugh, gasp, sigh, etc.)
                if seg.get("type") == "sfx":
                    sfx_filename = seg.get("sfx_file", "cough.mp3")
                    sfx_path = os.path.join(SFX_DIR, sfx_filename)
                    if os.path.exists(sfx_path):
                        try:
                            sfx_audio = AudioSegment.from_file(sfx_path, format="mp3")
                            master += sfx_audio
                        except Exception as e:
                            print(f"Error loading SFX {sfx_filename}: {e}")
                    if seg.get("pause_after_ms", 0) > 0:
                        master += AudioSegment.silent(duration=seg["pause_after_ms"])
                    continue

                # 2. Handle Speech Synthesis with Prosody and Acoustic DSP
                emo = seg.get("emotion", "normal")
                txt = seg.get("text", "")
                if not txt.strip():
                    continue

                rate = req.rate
                pitch = req.pitch
                vol = req.volume
                dsp = None

                if emo == "whisper":
                    # Soft intimate cadence without any dish antenna static or noise
                    txt = txt.strip()
                    rate = adjust_pct(req.rate, -10)
                    pitch = adjust_hz(req.pitch, -8)
                    vol = adjust_pct(req.volume, -20)
                    dsp = None
                elif emo == "shout":
                    txt = txt.upper() + ("!" if not txt.endswith("!") else "")
                    rate = adjust_pct(req.rate, 15)
                    pitch = adjust_hz(req.pitch, 28)
                    vol = adjust_pct(req.volume, 45)
                    dsp = "shout"
                elif emo == "sad":
                    # Heartfelt emotional sad / crying prosody
                    txt = "... " + txt + " ..."
                    rate = adjust_pct(req.rate, -22)
                    pitch = adjust_hz(req.pitch, -18)
                    vol = adjust_pct(req.volume, -20)
                    dsp = "sad"
                elif emo == "angry":
                    txt = txt + ("!" if not txt.endswith("!") else "")
                    rate = adjust_pct(req.rate, 12)
                    pitch = adjust_hz(req.pitch, -12)
                    vol = adjust_pct(req.volume, 30)
                elif emo == "nervous":
                    words = txt.split()
                    if words:
                        words[0] = f"{words[0][:2]}-{words[0]}..."
                    txt = " ".join(words)
                    rate = adjust_pct(req.rate, 20)
                    pitch = adjust_hz(req.pitch, 16)
                elif emo == "robot":
                    rate = adjust_pct(req.rate, -10)
                    pitch = adjust_hz(req.pitch, -6)
                    dsp = "robot"
                elif emo == "radio":
                    dsp = "radio"
                elif emo == "slow":
                    rate = adjust_pct(req.rate, -30)
                elif emo == "fast":
                    rate = adjust_pct(req.rate, 35)
                elif emo == "excited":
                    rate = adjust_pct(req.rate, 22)
                    pitch = adjust_hz(req.pitch, 24)
                    vol = adjust_pct(req.volume, 18)
                elif emo == "mysterious":
                    rate = adjust_pct(req.rate, -25)
                    pitch = adjust_hz(req.pitch, -16)
                    vol = adjust_pct(req.volume, -20)

                seg_audio = await synthesize_single_segment(
                    text=txt,
                    voice=safe_voice,
                    rate=rate,
                    pitch=pitch,
                    volume=vol
                )

                if dsp == "shout":
                    seg_audio = seg_audio + 2
                elif dsp == "sad":
                    seg_audio = seg_audio - 1

                master += seg_audio

                if seg.get("pause_after_ms", 0) > 0:
                    master += AudioSegment.silent(duration=seg["pause_after_ms"])

            sound = master

        # Transcode to requested format
        out_buf = io.BytesIO()
        if req.format == "wav":
            sound.export(out_buf, format="wav")
            return Response(content=out_buf.getvalue(), media_type="audio/wav", headers={
                "Content-Disposition": 'attachment; filename="thirteenlabs-audio.wav"'
            })
        elif req.format == "flac":
            sound.export(out_buf, format="flac")
            return Response(content=out_buf.getvalue(), media_type="audio/flac", headers={
                "Content-Disposition": 'attachment; filename="thirteenlabs-audio.flac"'
            })
        elif req.format == "ogg":
            sound.export(out_buf, format="ogg")
            return Response(content=out_buf.getvalue(), media_type="audio/ogg", headers={
                "Content-Disposition": 'attachment; filename="thirteenlabs-audio.ogg"'
            })
        elif req.format == "aac":
            sound.export(out_buf, format="adts")
            return Response(content=out_buf.getvalue(), media_type="audio/aac", headers={
                "Content-Disposition": 'attachment; filename="thirteenlabs-audio.aac"'
            })
        else:
            sound.export(out_buf, format="mp3")
            return Response(content=out_buf.getvalue(), media_type="audio/mpeg", headers={
                "Content-Disposition": 'attachment; filename="thirteenlabs-audio.mp3"'
            })

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@app.post("/api/generate")
async def generate_speech_post(req: GenerateRequest):
    """POST endpoint for generation with unlimited prompt length."""
    return await process_speech_generation(req)

@app.get("/api/generate")
async def generate_speech_get(
    text: str = Query(..., min_length=1, max_length=50000),
    voice: str = Query("en-US-AndrewMultilingualNeural"),
    rate: str = Query("+0%"),
    pitch: str = Query("+0Hz"),
    volume: str = Query("+0%"),
    format: str = Query("mp3"),
    stability: Optional[int] = Query(75),
    similarity: Optional[int] = Query(85)
):
    """GET wrapper for backward compatibility."""
    req = GenerateRequest(
        text=text,
        voice=voice,
        rate=rate,
        pitch=pitch,
        volume=volume,
        format=format,
        stability=stability,
        similarity=similarity
    )
    return await process_speech_generation(req)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
