# ThirteenLabs 🎙️
> **The High-Fidelity Open-Source Voice Generator & 60+ Free TTS Aggregator**  
> Live Platform: [https://thirteenlabs.bond](https://thirteenlabs.bond)  
> Author: [@aurasqlm](https://github.com/aurasqlm) • Open Source: [github.com/aurasqlm/thirteenlabs](https://github.com/aurasqlm/thirteenlabs)

---

## 🌟 Overview
**ThirteenLabs** is a modern, high-fidelity alternative to closed corporate voice generators like ElevenLabs. Designed with a clinical Swiss aesthetic and tactile physical damping, ThirteenLabs aggregates over **60+ free speech engines** (Microsoft Edge Neural, Chrome Web Speech, Kokoro-82M, Piper, Baidu, WhisperSpeech, Bark, and more) with **zero API keys** or subscription paywalls.

It features an acoustic emotion tag injector with **1,000+ vocal extensions** (e.g. `[aha]`, `[laugh]`, `[cough]`, `[whisper]`, `[gasp]`, `[pause 0.5s]`) and multi-format studio audio exports (**MP3, WAV 48kHz, FLAC, OGG, AAC**).

---

## ⚡ Key Features

- **Zero Corporate API Paywalls**: Instant synthesis using free high-quality neural providers without registration or API tokens.
- **60+ Free Voice Providers**: Aggregates Edge-TTS (400+ voices), Chromium Speech, Kokoro ONNX, Piper, gTTS, and academic acoustic models.
- **1,000+ Vocal Extensions**: Expressive tags for laughter, throat-clearing, sighs, gasps, crying, whispering, shouting, and millisecond-accurate pauses.
- **Tactile Boutique UI**:
  - Pure white `#FFFFFF` clinical editing floor with porcelain `#FAFAFA` and zinc `#F8F9FA` frames.
  - Surgical 1px borders in neutral zinc `#E4E4E7` and whisper-thin elevation `0 1px 2px rgba(0,0,0,0.03)`.
  - Bespoke dual-element magnetic cursor with linear spring tracking (damping 24, stiffness 260).
  - Physical button squashing with `cubic-bezier(0.16, 1, 0.3, 1)` easing.
  - 5px ultra-thin floating transparent scrollbar.
- **Multi-Format Lossless Downloader**: Export speech into **WAV (lossless 48kHz PCM)**, **MP3 (320kbps)**, **FLAC**, **OGG**, or **AAC**.
- **Master Keyboard Shortcuts**: Global directory accessible via `Ctrl + ?` or `Cmd + ?` with instant shortcuts (`Ctrl + Enter` to generate, `Ctrl + Space` play/pause, `Ctrl + E` emotion drawer, `Ctrl + D` download).
- **Multi-Page Architecture**:
  - `/gen` — The primary voice studio and acoustic tuning workbench.
  - `/help` — Complete documentation directory for emotions, 60+ providers, shortcuts, and audio engineering.
- **Cloudflare Ready**: Complete `wrangler.jsonc` configuration for edge deployment on Cloudflare Pages.
- **Python FastAPI Engine**: Standalone async microservice (`backend/main.py`) with Dockerfile for deployment on HuggingFace Spaces, Render, or self-hosted servers.

---

## 🚀 Quick Start (Local Development)

### 1. Next.js Edge Frontend
```bash
# Clone the repository
git clone https://github.com/aurasqlm/thirteenlabs.git
cd thirteenlabs

# Install dependencies
npm install

# Run the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

---

### 2. Standalone Python Backend (Optional)
If you wish to run the specialized Python FastAPI audio engine locally with FFmpeg:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```
The FastAPI server will be available at [http://localhost:8000](http://localhost:8000).

---

## ☁️ Cloudflare Wrangler Deployment

Deploy to Cloudflare Pages bound to `thirteenlabs.bond`:

```bash
# Authenticate with Cloudflare
npx wrangler login

# Build Next.js project
npm run build

# Deploy via Wrangler
npx wrangler pages deploy .next/standalone --project-name thirteenlabs
```

---

## ⌨️ Master Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + ?` / `⌘ + ?` | Open Keyboard Shortcuts Directory |
| `Ctrl + Enter` / `⌘ + Enter` | Generate Voice (Trigger Synthesis) |
| `Ctrl + Space` / `⌘ + Space` | Play / Pause Audio Playback |
| `Ctrl + E` / `⌘ + E` | Toggle 1,000+ Emotion Drawer |
| `Ctrl + D` / `⌘ + D` | Download Audio in Selected Format |
| `Ctrl + H` / `⌘ + H` | Toggle Audio History Vault |
| `Esc` | Close Active Modal or Drawer |

---

## 📄 License & Attribution
- **Author**: [aurasqlm](https://github.com/aurasqlm)
- **Domain**: [thirteenlabs.bond](https://thirteenlabs.bond)
- **License**: MIT Open Source License
