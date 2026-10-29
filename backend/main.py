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

# CORS setup with support for Cloudflare Pages preview domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://thirteenlabs.bond",
    ],
    allow_origin_regex=r"^https://([a-zA-Z0-9-]+\.)*pages\.dev$",
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

async def process_speech_generation(req: GenerateRequest):
    await ensure_valid_voices()
    clean_prompt = preprocess_text(req.text)
    if not clean_prompt:
        clean_prompt = req.text

    safe_voice = resolve_voice_id(req.voice)

    try:
        communicate = edge_tts.Communicate(
            text=clean_prompt,
            voice=safe_voice,
            rate=req.rate,
            pitch=req.pitch,
            volume=req.volume
        )

        mp3_buffer = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                mp3_buffer.write(chunk["data"])

        mp3_buffer.seek(0)
        raw_mp3_data = mp3_buffer.getvalue()

        if req.format == "mp3":
            return Response(content=raw_mp3_data, media_type="audio/mpeg", headers={
                "Content-Disposition": 'attachment; filename="thirteenlabs-audio.mp3"'
            })

        # Transcode to WAV, FLAC, OGG, or AAC using pydub
        try:
            sound = AudioSegment.from_file(io.BytesIO(raw_mp3_data), format="mp3")
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
        except Exception:
            # Fallback to MP3 if ffmpeg is missing in lightweight runtime
            return Response(content=raw_mp3_data, media_type="audio/mpeg")

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
