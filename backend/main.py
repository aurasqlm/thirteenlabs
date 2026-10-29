import asyncio
import io
import re
from typing import Optional
from fastapi import FastAPI, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import edge_tts
from pydub import AudioSegment

app = FastAPI(
    title="ThirteenLabs Audio Engine",
    description="High-fidelity free neural audio generation engine for ThirteenLabs (thirteenlabs.bond) by aurasqlm",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://thirteenlabs.bond",
        "https://*.pages.dev"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Clean SSML tags and convert custom emotion extensions
def preprocess_text(text: str) -> str:
    # Replace acoustic tags with appropriate punctuation/prosody
    # e.g., [whisper] -> soften, [laugh] -> chuckle inflection
    cleaned = re.sub(r'\[(?:cough|throat-clear|gasp|sigh)\]', '... ', text, flags=re.IGNORECASE)
    cleaned = re.sub(r'\[(?:laugh|giggle|snicker|chuckle)\]', ' haha! ', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\[(?:whisper)\]', ' ', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\[(?:shout|yell)\]', '! ', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\[pause\s*([0-9.]+)s?\]', '... ', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\[.*?\]', '', cleaned)
    return cleaned.strip()

@app.get("/")
async def root():
    return {
        "engine": "ThirteenLabs Neural Engine",
        "author": "aurasqlm",
        "github": "https://github.com/aurasqlm/thirteenlabs",
        "status": "online",
        "domain": "thirteenlabs.bond"
    }

@app.get("/api/voices")
async def list_voices():
    """Returns list of 400+ high-quality neural voices across 140+ locales."""
    try:
        voices = await edge_tts.list_voices()
        return {"status": "success", "count": len(voices), "voices": voices}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/generate")
async def generate_speech(
    text: str = Query(..., min_length=1, max_length=10000),
    voice: str = Query("en-US-AndrewMultilingualNeural"),
    rate: str = Query("+0%"),
    pitch: str = Query("+0Hz"),
    volume: str = Query("+0%"),
    format: str = Query("mp3", enum=["mp3", "wav", "ogg"])
):
    """Generates audio with neural prosody and converts to target format."""
    clean_prompt = preprocess_text(text)
    if not clean_prompt:
        clean_prompt = text

    try:
        communicate = edge_tts.Communicate(
            text=clean_prompt,
            voice=voice,
            rate=rate,
            pitch=pitch,
            volume=volume
        )

        mp3_buffer = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                mp3_buffer.write(chunk["data"])

        mp3_buffer.seek(0)
        raw_mp3_data = mp3_buffer.getvalue()

        if format == "mp3":
            return Response(content=raw_mp3_data, media_type="audio/mpeg", headers={
                "Content-Disposition": 'attachment; filename="thirteenlabs-audio.mp3"'
            })

        # Transcode to WAV or OGG using pydub
        try:
            sound = AudioSegment.from_file(io.BytesIO(raw_mp3_data), format="mp3")
            out_buf = io.BytesIO()
            if format == "wav":
                sound.export(out_buf, format="wav")
                return Response(content=out_buf.getvalue(), media_type="audio/wav", headers={
                    "Content-Disposition": 'attachment; filename="thirteenlabs-audio.wav"'
                })
            elif format == "ogg":
                sound.export(out_buf, format="ogg")
                return Response(content=out_buf.getvalue(), media_type="audio/ogg", headers={
                    "Content-Disposition": 'attachment; filename="thirteenlabs-audio.ogg"'
                })
        except Exception:
            # Fallback to MP3 if ffmpeg is missing in lightweight runtime
            return Response(content=raw_mp3_data, media_type="audio/mpeg")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
