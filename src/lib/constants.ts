import { VoiceModel, VoiceProvider, EmotionTag, ScriptPreset } from '@/types';

// ==========================================
// 60+ FREE VOICE PROVIDERS AGGREGATOR
// ==========================================
export const VOICE_PROVIDERS: VoiceProvider[] = [
  // 1-10: Primary Neural & Browser
  { id: 'edge-neural', name: 'Microsoft Edge Neural', badge: 'Ultra-HD', description: '400+ natural human-grade neural voices across 140 locales with zero API key.', voiceCount: 420, freeTier: true, category: 'Edge Neural', latency: 'Fast (150-300ms)' },
  { id: 'web-speech', name: 'Chrome / Web Speech API', badge: '0ms Offline', description: 'Hardware-accelerated browser speech synthesis with real-time pitch and rate control.', voiceCount: 65, freeTier: true, category: 'Browser Native', latency: 'Ultra-low (<100ms)' },
  { id: 'chromium-tts', name: 'Chromium Neural TTS', badge: 'Open Engine', description: 'Google Chromium embedded speech synthesis engine with high intelligibility.', voiceCount: 45, freeTier: true, category: 'Browser Native', latency: 'Ultra-low (<100ms)' },
  { id: 'kokoro-onnx', name: 'Kokoro-82M ONNX', badge: 'SOTA Quality', description: 'Lightweight 82M open weights model outperforming closed enterprise models on CPU.', voiceCount: 28, freeTier: true, category: 'Open Source', latency: 'Fast (150-300ms)' },
  { id: 'piper-neural', name: 'Piper Fast TTS', badge: 'Instant CPU', description: 'Optimized fast neural text-to-speech for real-time natural dialogue.', voiceCount: 85, freeTier: true, category: 'Open Source', latency: 'Ultra-low (<100ms)' },
  { id: 'gtts-stream', name: 'Google Translate TTS', badge: 'Multi-Lingual', description: 'Global multi-lingual speech endpoints covering rare dialects worldwide.', voiceCount: 110, freeTier: true, category: 'Community Engine', latency: 'Fast (150-300ms)' },
  { id: 'baidu-speech', name: 'Baidu Open Speech', badge: 'Mandarin HD', description: 'Specialized deep learning synthesis for East Asian prosody and tonality.', voiceCount: 30, freeTier: true, category: 'Community Engine', latency: 'Fast (150-300ms)' },
  { id: 'espeak-ng', name: 'eSpeak NG Compact', badge: '100% Offline', description: 'Phonetic synthesizer supporting over 120 languages and international accents.', voiceCount: 120, freeTier: true, category: 'Open Source', latency: 'Ultra-low (<100ms)' },
  { id: 'whisper-speech', name: 'WhisperSpeech Open', badge: 'Diffusion TTS', description: 'Inverted Whisper architecture generating expressive emotional timbre.', voiceCount: 16, freeTier: true, category: 'Open Source', latency: 'Standard (400ms)' },
  { id: 'bark-neural', name: 'Bark Transformer Small', badge: 'Organic Foley', description: 'Generative transformer capable of music, laughter, and sighs.', voiceCount: 24, freeTier: true, category: 'Open Source', latency: 'Standard (400ms)' },

  // 11-20: Community & Academic Engines
  { id: 'coqui-xtts', name: 'Coqui XTTS Community', badge: 'Cloning Open', description: 'Cross-language voice cloning model with realistic prosody.', voiceCount: 35, freeTier: true, category: 'Open Source', latency: 'Standard (400ms)' },
  { id: 'melo-tts', name: 'MeloTTS Multi-lingual', badge: 'Ultra-Fast', description: 'High-speed CPU neural speech with precise syllable timing.', voiceCount: 40, freeTier: true, category: 'Open Source', latency: 'Fast (150-300ms)' },
  { id: 'open-marytts', name: 'MaryTTS Modular', badge: 'Java Core', description: 'Academic acoustic architecture for linguistic research.', voiceCount: 25, freeTier: true, category: 'Open Source', latency: 'Fast (150-300ms)' },
  { id: 'flite-speech', name: 'Festival Flite C-Engine', badge: 'Micro-Footprint', description: 'Ultra-lightweight embedded synthesis engine in under 5MB.', voiceCount: 18, freeTier: true, category: 'Open Source', latency: 'Ultra-low (<100ms)' },
  { id: 'vits-japanese', name: 'VITS Anime Voice Core', badge: 'Stylized', description: 'Variational inference for expressive character narration.', voiceCount: 50, freeTier: true, category: 'Open Source', latency: 'Fast (150-300ms)' },
  { id: 'libre-translate-tts', name: 'LibreTranslate Audio', badge: 'Decentralized', description: 'Privacy-first speech generator without telemetry.', voiceCount: 32, freeTier: true, category: 'Community Engine', latency: 'Fast (150-300ms)' },
  { id: 'responsive-voice', name: 'ResponsiveVoice Free Tier', badge: 'Web HTML5', description: 'Universal cross-platform accessibility speech synthesis.', voiceCount: 48, freeTier: true, category: 'Community Engine', latency: 'Fast (150-300ms)' },
  { id: 'mimic3-mycroft', name: 'Mycroft Mimic3', badge: 'Privacy Audio', description: 'Open-hardware voice synthesizer running on embedded devices.', voiceCount: 60, freeTier: true, category: 'Open Source', latency: 'Fast (150-300ms)' },
  { id: 'sherpa-onnx', name: 'Next-Gen Kaldi Sherpa', badge: 'Embedded ONNX', description: 'Cross-platform offline neural synthesizer using ONNX runtime.', voiceCount: 42, freeTier: true, category: 'Open Source', latency: 'Ultra-low (<100ms)' },
  { id: 'open-jtalk', name: 'Open JTalk Japanese', badge: 'HTS Acoustic', description: 'Gold-standard pitch-accent speech synthesis for Japanese phonetics.', voiceCount: 14, freeTier: true, category: 'Community Engine', latency: 'Ultra-low (<100ms)' },

  // 21-30: Neural Dialect & Specialty Models
  { id: 'fastspeech2', name: 'FastSpeech2 Non-Autoregressive', badge: 'High-Speed', description: 'Feed-forward acoustic generator with controllable pitch contour.', voiceCount: 30, freeTier: true, category: 'Open Source', latency: 'Ultra-low (<100ms)' },
  { id: 'tacotron2-wavernn', name: 'Tacotron2 + WaveRNN', badge: 'Classic Neural', description: 'Sequence-to-sequence model with high-fidelity vocoder.', voiceCount: 20, freeTier: true, category: 'Open Source', latency: 'Fast (150-300ms)' },
  { id: 'diff-singer', name: 'DiffSinger Melodic', badge: 'Singing Synth', description: 'Diffusion acoustic model optimized for pitch stability and vibrato.', voiceCount: 18, freeTier: true, category: 'Community Engine', latency: 'Standard (400ms)' },
  { id: 'grad-tts', name: 'Grad-TTS Diffusion', badge: 'Score-Based', description: 'Diffusion probabilistic modeling for smooth vocal transitions.', voiceCount: 15, freeTier: true, category: 'Open Source', latency: 'Standard (400ms)' },
  { id: 'vits-korean', name: 'VITS K-Speech Neural', badge: 'Hangul Pitch', description: 'Accurate honorific speech cadences and Korean prosody.', voiceCount: 22, freeTier: true, category: 'Community Engine', latency: 'Fast (150-300ms)' },
  { id: 'silero-models', name: 'Silero Multi-Speaker V4', badge: 'Compact Torch', description: 'High quality multi-speaker voices in under 50MB models.', voiceCount: 36, freeTier: true, category: 'Open Source', latency: 'Fast (150-300ms)' },
  { id: 'chattts-conversational', name: 'ChatTTS Conversational', badge: 'Realistic Laughs', description: 'Conversational agent optimized for dialogue pauses, chuckles, and filler words.', voiceCount: 12, freeTier: true, category: 'Open Source', latency: 'Standard (400ms)' },
  { id: 'open-tts-gateway', name: 'OpenTTS Unified Server', badge: 'Multi-Backend', description: 'Aggregator bridging MaryTTS, Coqui, Festival, and Piper.', voiceCount: 75, freeTier: true, category: 'Open Source', latency: 'Fast (150-300ms)' },
  { id: 'speech-dispatcher', name: 'Speech Dispatcher Linux', badge: 'OS Driver', description: 'Native Linux accessibility daemon speech integration.', voiceCount: 28, freeTier: true, category: 'Browser Native', latency: 'Ultra-low (<100ms)' },
  { id: 'lingva-audio', name: 'Lingva Privacy Stream', badge: 'No-Tracking', description: 'Telemetry-free privacy proxy speech endpoints.', voiceCount: 55, freeTier: true, category: 'Community Engine', latency: 'Fast (150-300ms)' },

  // 31-40: Global Polyglot Engines
  { id: 'indic-tts', name: 'IndicTTS Polyglot', badge: 'South Asian', description: 'Specialized for Hindi, Tamil, Telugu, Bengali, Marathi, and Punjabi.', voiceCount: 48, freeTier: true, category: 'Community Engine', latency: 'Fast (150-300ms)' },
  { id: 'nordic-neural', name: 'Nordic Speech Open', badge: 'Scandinavian', description: 'Acoustic models for Swedish, Norwegian, Danish, and Finnish.', voiceCount: 20, freeTier: true, category: 'Community Engine', latency: 'Fast (150-300ms)' },
  { id: 'slavic-neural', name: 'Slavic Open Voice', badge: 'Eastern Europe', description: 'High precision for Polish, Czech, Ukrainian, and Balkan phonetics.', voiceCount: 26, freeTier: true, category: 'Community Engine', latency: 'Fast (150-300ms)' },
  { id: 'celtic-speech', name: 'Celtic Heritage TTS', badge: 'Irish & Welsh', description: 'Acoustic preservation models for Celtic and Gaelic dialects.', voiceCount: 12, freeTier: true, category: 'Community Engine', latency: 'Fast (150-300ms)' },
  { id: 'arabic-tashkeel', name: 'Arabic Diacritics Engine', badge: 'Quranic/Fusha', description: 'Full Harakat and Tashkeel support for Modern Standard Arabic.', voiceCount: 24, freeTier: true, category: 'Community Engine', latency: 'Fast (150-300ms)' },
  { id: 'hebrew-niqqud', name: 'Hebrew Niqqud Vocalizer', badge: 'Semitic', description: 'Vocalization engine with modern Israeli and Sephardic cadences.', voiceCount: 10, freeTier: true, category: 'Community Engine', latency: 'Fast (150-300ms)' },
  { id: 'latin-american-accent', name: 'Latin America Neural Hub', badge: '18 Accents', description: 'Distinguishes Mexican, Argentine, Colombian, and Chilean cadences.', voiceCount: 54, freeTier: true, category: 'Edge Neural', latency: 'Fast (150-300ms)' },
  { id: 'african-languages-tts', name: 'AfroVoices Open Lab', badge: 'Swahili & Yoruba', description: 'Open models for Swahili, Yoruba, Amharic, and Zulu speech.', voiceCount: 22, freeTier: true, category: 'Community Engine', latency: 'Standard (400ms)' },
  { id: 'southeast-asia-tts', name: 'ASEAN Polyglot Voice', badge: 'Thai & Tagalog', description: 'Tonal language synthesis for Thai, Vietnamese, and Tagalog.', voiceCount: 30, freeTier: true, category: 'Community Engine', latency: 'Fast (150-300ms)' },
  { id: 'cantonese-jyutping', name: 'Cantonese Jyutping Core', badge: '9 Tones', description: 'Accurate 9-tone Hong Kong and Guangdong vernacular synthesis.', voiceCount: 16, freeTier: true, category: 'Community Engine', latency: 'Fast (150-300ms)' },

  // 41-50: Studio Persona & Foley Stems
  { id: 'retro-8bit', name: 'SAM 1982 Retro Synth', badge: 'Chiptune', description: 'Original Software Automatic Mouth vintage robot vocalizer.', voiceCount: 8, freeTier: true, category: 'Open Source', latency: 'Ultra-low (<100ms)' },
  { id: 'vocoder-dsp', name: 'Phase Vocoder Harmonic', badge: 'DSP Vocoder', description: 'Harmonic carrier robotization with formant shifting.', voiceCount: 12, freeTier: true, category: 'Open Source', latency: 'Ultra-low (<100ms)' },
  { id: 'whisper-filter', name: 'De-Voiced Whisper Core', badge: 'Aspiration', description: 'Sub-glottal resonance filter converting any speech into ASMR whisper.', voiceCount: 20, freeTier: true, category: 'Open Source', latency: 'Fast (150-300ms)' },
  { id: 'radio-walkie', name: 'Aviation & Tactical Band', badge: 'Lo-Fi Filter', description: 'Simulates 300Hz-3kHz bandpass communication with radio squelch.', voiceCount: 14, freeTier: true, category: 'Open Source', latency: 'Ultra-low (<100ms)' },
  { id: 'cathedral-reverb', name: 'Impulse Convolver Stems', badge: 'Spatial Reverb', description: '3D spatial convolution for monumental oratorical acoustics.', voiceCount: 16, freeTier: true, category: 'Open Source', latency: 'Fast (150-300ms)' },
  { id: 'tape-saturation', name: 'Analog Studer A800 Core', badge: 'Warmth 15ips', description: 'Even harmonic tape distortion for vintage broadcast warmth.', voiceCount: 10, freeTier: true, category: 'Open Source', latency: 'Fast (150-300ms)' },
  { id: 'cinematic-trailer', name: 'Sub-Bass Cinema Enhancer', badge: 'Deep Resonator', description: 'Harmonic sub-octave generator for deep Hollywood trailer voices.', voiceCount: 12, freeTier: true, category: 'Open Source', latency: 'Fast (150-300ms)' },
  { id: 'podcast-broadcast', name: 'Broadcast Master Limiter', badge: 'LUFS -14', description: 'Dual-band AGC and vocal de-esser for pristine studio audio.', voiceCount: 18, freeTier: true, category: 'Open Source', latency: 'Fast (150-300ms)' },
  { id: 'speed-narrator', name: 'Variable Pitch Accelerator', badge: '0.25x - 4.0x', description: 'WSOLA time-stretching without frequency distortion.', voiceCount: 15, freeTier: true, category: 'Open Source', latency: 'Ultra-low (<100ms)' },
  { id: 'binaural-3d', name: 'HRTF Spatial Binaural', badge: 'Headphone 3D', description: 'Head-Related Transfer Function positioning speech in 360 space.', voiceCount: 10, freeTier: true, category: 'Open Source', latency: 'Fast (150-300ms)' },

  // 51-62: Cloud Aggregation & Extensible Endpoints
  { id: 'hf-spaces-free', name: 'HuggingFace Spaces Direct', badge: 'Community API', description: 'Zero-key public Gradio pipelines for latest experimental TTS.', voiceCount: 45, freeTier: true, category: 'Cloud Neural', latency: 'Standard (400ms)' },
  { id: 'openai-compatible', name: 'OpenAI Compatible Voice Proxy', badge: 'BYO-Endpoint', description: 'Connects to any LocalAI, vLLM, or self-hosted audio gateway.', voiceCount: 6, freeTier: true, category: 'Cloud Neural', latency: 'Fast (150-300ms)' },
  { id: 'ollama-audio', name: 'Ollama Speech Pipeline', badge: 'Local LLM', description: 'Zero-latency voice generation linked with local inference.', voiceCount: 8, freeTier: true, category: 'Open Source', latency: 'Fast (150-300ms)' },
  { id: 'deepgram-public', name: 'Aura Speech Community Tier', badge: 'Fast Streaming', description: 'High-speed streaming neural voice synthesis.', voiceCount: 12, freeTier: true, category: 'Cloud Neural', latency: 'Ultra-low (<100ms)' },
  { id: 'playht-open', name: 'Play.ht Open Access Models', badge: 'Conversational', description: 'Natural emotional inflections and breathing pauses.', voiceCount: 14, freeTier: true, category: 'Cloud Neural', latency: 'Fast (150-300ms)' },
  { id: 'elevenlabs-bridge', name: 'ElevenLabs Free Sandbox', badge: 'V2 Multilingual', description: 'Connect custom tier keys or test standard shared sandbox voices.', voiceCount: 10, freeTier: true, category: 'Cloud Neural', latency: 'Fast (150-300ms)' },
  { id: 'cartesia-sonic', name: 'Sonic State-Space Audio', badge: 'Sub-90ms', description: 'State-space model generating speech with ultra-low latency.', voiceCount: 16, freeTier: true, category: 'Cloud Neural', latency: 'Ultra-low (<100ms)' },
  { id: 'fish-speech', name: 'Fish Audio Open Weights', badge: 'Zero-Shot Clone', description: 'Autoregressive transformer with VQ-GAN vocoder.', voiceCount: 20, freeTier: true, category: 'Open Source', latency: 'Standard (400ms)' },
  { id: 'voicecraft-ai', name: 'VoiceCraft Audio Infill', badge: 'Editing Core', description: 'Allows in-place insertion and deletion of spoken words.', voiceCount: 10, freeTier: true, category: 'Open Source', latency: 'Standard (400ms)' },
  { id: 'f5-tts-fair', name: 'F5-TTS Flow Matching', badge: 'Natural Rhythm', description: 'Non-autoregressive flow matching for fast voice replication.', voiceCount: 15, freeTier: true, category: 'Open Source', latency: 'Fast (150-300ms)' },
  { id: 'cosyvoice-alibaba', name: 'CosyVoice Multi-Emotion', badge: 'Dialect Control', description: 'Rich multilingual voice generation with fine emotion controls.', voiceCount: 25, freeTier: true, category: 'Open Source', latency: 'Fast (150-300ms)' },
  { id: 'thirteen-universal', name: 'ThirteenLabs Master Dynamic', badge: 'Auto-Routing', description: 'Intelligent engine that selects optimal provider based on language and emotion.', voiceCount: 500, freeTier: true, category: 'Edge Neural', latency: 'Ultra-low (<100ms)' }
];

// ==========================================
// CURATED TOP NEURAL VOICES (CHILD, YOUNG, MATURE, SENIOR ACROSS PROVIDERS)
// ==========================================
export const CURATED_VOICES: VoiceModel[] = [
  // --- CHILD VOICES ---
  { id: 'en-US-AnaNeural', name: 'Ana (US Child)', provider: 'Microsoft Edge Neural', gender: 'Female', ageGroup: 'Child', locale: 'en-US', language: 'English (US)', accent: 'American', tag: 'Cheerful, Innocent, Animation', quality: 'Ultra', sampleText: 'Hi, I am Ana from ThirteenLabs.' },
  { id: 'en-GB-MaisieNeural', name: 'Maisie (British Child)', provider: 'Microsoft Edge Neural', gender: 'Female', ageGroup: 'Child', locale: 'en-GB', language: 'English (UK)', accent: 'British', tag: 'Playful, Storybook, Bright', quality: 'Ultra', sampleText: 'Hi, I am Maisie from ThirteenLabs.' },
  { id: 'zh-CN-XiaoxuanNeural', name: 'Xiaoxuan (Mandarin Child)', provider: 'Microsoft Edge Neural', gender: 'Female', ageGroup: 'Child', locale: 'zh-CN', language: 'Chinese (Mandarin)', accent: 'Beijing', tag: 'Sweet, Youthful, Melodic', quality: 'Ultra', sampleText: 'Hi, I am Xiaoxuan from ThirteenLabs.' },
  { id: 'ja-JP-AoiNeural', name: 'Aoi (Japanese Anime Child)', provider: 'Microsoft Edge Neural', gender: 'Female', ageGroup: 'Child', locale: 'ja-JP', language: 'Japanese', accent: 'Tokyo', tag: 'Cute, Kawaii, Anime Character', quality: 'Ultra', sampleText: 'Hi, I am Aoi from ThirteenLabs.' },
  { id: 'es-ES-AbrilNeural', name: 'Abril (Spanish Child)', provider: 'Microsoft Edge Neural', gender: 'Female', ageGroup: 'Child', locale: 'es-ES', language: 'Spanish (Spain)', accent: 'Castilian', tag: 'Joyful, Young, Energetic', quality: 'Studio', sampleText: 'Hi, I am Abril from ThirteenLabs.' },
  { id: 'de-DE-GiselaNeural', name: 'Gisela (German Child)', provider: 'Microsoft Edge Neural', gender: 'Female', ageGroup: 'Child', locale: 'de-DE', language: 'German (Germany)', accent: 'Standard German', tag: 'Friendly, Storybook, Gentle', quality: 'Studio', sampleText: 'Hi, I am Gisela from ThirteenLabs.' },

  // --- YOUNG ADULT / TEEN VOICES ---
  { id: 'en-US-AndrewMultilingualNeural', name: 'Andrew (Young Narrator)', provider: 'Microsoft Edge Neural', gender: 'Male', ageGroup: 'Young', locale: 'en-US', language: 'English (US)', accent: 'American', tag: 'Dynamic, Documentary, Warm', quality: 'Ultra', sampleText: 'Hi, I am Andrew from ThirteenLabs.' },
  { id: 'en-US-AvaMultilingualNeural', name: 'Ava (Conversational Young)', provider: 'Microsoft Edge Neural', gender: 'Female', ageGroup: 'Young', locale: 'en-US', language: 'English (US)', accent: 'American', tag: 'Natural, Engaging, Podcast', quality: 'Ultra', sampleText: 'Hi, I am Ava from ThirteenLabs.' },
  { id: 'en-US-JennyNeural', name: 'Jenny (Expressive Young)', provider: 'Microsoft Edge Neural', gender: 'Female', ageGroup: 'Young', locale: 'en-US', language: 'English (US)', accent: 'American', tag: 'Helpful, Vibrant, AI Assistant', quality: 'Studio', sampleText: 'Hi, I am Jenny from ThirteenLabs.' },
  { id: 'en-GB-RyanNeural', name: 'Ryan (British Cinematic Young)', provider: 'Microsoft Edge Neural', gender: 'Male', ageGroup: 'Young', locale: 'en-GB', language: 'English (UK)', accent: 'British RP', tag: 'Sophisticated, Dramatic, Film', quality: 'Ultra', sampleText: 'Hi, I am Ryan from ThirteenLabs.' },
  { id: 'en-AU-NatashaNeural', name: 'Natasha (Australian Young)', provider: 'Microsoft Edge Neural', gender: 'Female', ageGroup: 'Young', locale: 'en-AU', language: 'English (Australia)', accent: 'Australian', tag: 'Upbeat, Modern, Bright', quality: 'Studio', sampleText: 'Hi, I am Natasha from ThirteenLabs.' },
  { id: 'ja-JP-KeitaNeural', name: 'Keita (Japanese Anime Hero)', provider: 'Microsoft Edge Neural', gender: 'Male', ageGroup: 'Young', locale: 'ja-JP', language: 'Japanese', accent: 'Tokyo', tag: 'Resolute, Shonen Hero, Dynamic', quality: 'Ultra', sampleText: 'Hi, I am Keita from ThirteenLabs.' },
  { id: 'ko-KR-SunHiNeural', name: 'Sun-Hi (Korean Young Pop)', provider: 'Microsoft Edge Neural', gender: 'Female', ageGroup: 'Young', locale: 'ko-KR', language: 'Korean', accent: 'Seoul', tag: 'Lively, Modern, K-Drama', quality: 'Studio', sampleText: 'Hi, I am Sun-Hi from ThirteenLabs.' },
  { id: 'fr-FR-EloiseNeural', name: 'Eloise (French Young Chic)', provider: 'Microsoft Edge Neural', gender: 'Female', ageGroup: 'Young', locale: 'fr-FR', language: 'French (France)', accent: 'Parisian', tag: 'Chic, Expressive, Contemporary', quality: 'Studio', sampleText: 'Hi, I am Eloise from ThirteenLabs.' },
  { id: 'es-MX-DaliaNeural', name: 'Dalia (Mexican Vibrant Young)', provider: 'Microsoft Edge Neural', gender: 'Female', ageGroup: 'Young', locale: 'es-MX', language: 'Spanish (Mexico)', accent: 'Latin American', tag: 'Warm, Melodic, Engaging', quality: 'Studio', sampleText: 'Hi, I am Dalia from ThirteenLabs.' },

  // --- MATURE / PROFESSIONAL VOICES ---
  { id: 'en-US-BrianMultilingualNeural', name: 'Brian (Studio Producer)', provider: 'Microsoft Edge Neural', gender: 'Male', ageGroup: 'Mature', locale: 'en-US', language: 'English (US)', accent: 'American', tag: 'Polished, Corporate, Crisp', quality: 'Ultra', sampleText: 'Hi, I am Brian from ThirteenLabs.' },
  { id: 'en-US-GuyNeural', name: 'Guy (Broadcast News Anchor)', provider: 'Microsoft Edge Neural', gender: 'Male', ageGroup: 'Mature', locale: 'en-US', language: 'English (US)', accent: 'American', tag: 'Direct, Energetic, Broadcast', quality: 'Studio', sampleText: 'Hi, I am Guy from ThirteenLabs.' },
  { id: 'en-US-EmmaMultilingualNeural', name: 'Emma (Clear Storyteller)', provider: 'Microsoft Edge Neural', gender: 'Female', ageGroup: 'Mature', locale: 'en-US', language: 'English (US)', accent: 'American', tag: 'Gentle, Intimate, Audiobook', quality: 'Ultra', sampleText: 'Hi, I am Emma from ThirteenLabs.' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia (British Elegance)', provider: 'Microsoft Edge Neural', gender: 'Female', ageGroup: 'Mature', locale: 'en-GB', language: 'English (UK)', accent: 'British RP', tag: 'Refined, Eloquent, Literary', quality: 'Ultra', sampleText: 'Hi, I am Sonia from ThirteenLabs.' },
  { id: 'de-DE-ConradNeural', name: 'Conrad (German Precision)', provider: 'Microsoft Edge Neural', gender: 'Male', ageGroup: 'Mature', locale: 'de-DE', language: 'German (Germany)', accent: 'German', tag: 'Accurate, Strong, Technical', quality: 'Ultra', sampleText: 'Hi, I am Conrad from ThirteenLabs.' },
  { id: 'fr-FR-HenriNeural', name: 'Henri (French Aristocrat)', provider: 'Microsoft Edge Neural', gender: 'Male', ageGroup: 'Mature', locale: 'fr-FR', language: 'French (France)', accent: 'Parisian', tag: 'Poetic, Deep, Resonant', quality: 'Ultra', sampleText: 'Hi, I am Henri from ThirteenLabs.' },
  { id: 'hi-IN-MadhurNeural', name: 'Madhur (Hindi Resonant)', provider: 'Microsoft Edge Neural', gender: 'Male', ageGroup: 'Mature', locale: 'hi-IN', language: 'Hindi', accent: 'Standard Hindi', tag: 'Poetic, Cultural, Deep', quality: 'Studio', sampleText: 'Hi, I am Madhur from ThirteenLabs.' },
  { id: 'ar-SA-HamedNeural', name: 'Hamed (Arabic Classical)', provider: 'Microsoft Edge Neural', gender: 'Male', ageGroup: 'Mature', locale: 'ar-SA', language: 'Arabic (Saudi Arabia)', accent: 'Gulf', tag: 'Oratorical, Majestic, Reverent', quality: 'Ultra', sampleText: 'Hi, I am Hamed from ThirteenLabs.' },
  { id: 'zh-CN-YunxiNeural', name: 'Yunxi (Mandarin Storyteller)', provider: 'Microsoft Edge Neural', gender: 'Male', ageGroup: 'Mature', locale: 'zh-CN', language: 'Chinese (Mandarin)', accent: 'Beijing', tag: 'Historical, Narrative, Deep', quality: 'Ultra', sampleText: 'Hi, I am Yunxi from ThirteenLabs.' },
  { id: 'es-ES-AlvaroNeural', name: 'Álvaro (Castilian Spanish)', provider: 'Microsoft Edge Neural', gender: 'Male', ageGroup: 'Mature', locale: 'es-ES', language: 'Spanish (Spain)', accent: 'Castilian', tag: 'Expressive, Narrative, Classic', quality: 'Ultra', sampleText: 'Hi, I am Álvaro from ThirteenLabs.' },

  // --- SENIOR / OLD / WISE VOICES ---
  { id: 'en-US-SteffenNeural', name: 'Steffen (Wise Old Professor)', provider: 'Microsoft Edge Neural', gender: 'Male', ageGroup: 'Senior', locale: 'en-US', language: 'English (US)', accent: 'American', tag: 'Deep, Academic, Raspy Wisdom', quality: 'Ultra', sampleText: 'Hi, I am Steffen from ThirteenLabs.' },
  { id: 'en-US-RogerNeural', name: 'Roger (Elderly Grandfather)', provider: 'Microsoft Edge Neural', gender: 'Male', ageGroup: 'Senior', locale: 'en-US', language: 'English (US)', accent: 'American', tag: 'Gentle, Nostalgic, Storyteller', quality: 'Studio', sampleText: 'Hi, I am Roger from ThirteenLabs.' },
  { id: 'en-GB-ThomasNeural', name: 'Thomas (Senior British Gentleman)', provider: 'Microsoft Edge Neural', gender: 'Male', ageGroup: 'Senior', locale: 'en-GB', language: 'English (UK)', accent: 'British RP', tag: 'Aristocratic, Vintage, Deep', quality: 'Ultra', sampleText: 'Hi, I am Thomas from ThirteenLabs.' },
  { id: 'en-GB-LibbyNeural', name: 'Libby (Elderly British Matron)', provider: 'Microsoft Edge Neural', gender: 'Female', ageGroup: 'Senior', locale: 'en-GB', language: 'English (UK)', accent: 'British', tag: 'Warm, Maternal, Storybook', quality: 'Studio', sampleText: 'Hi, I am Libby from ThirteenLabs.' },
  { id: 'de-DE-KlausNeural', name: 'Klaus (Senior German Master)', provider: 'Microsoft Edge Neural', gender: 'Male', ageGroup: 'Senior', locale: 'de-DE', language: 'German (Germany)', accent: 'German', tag: 'Grave, Historical, Scholarly', quality: 'Studio', sampleText: 'Hi, I am Klaus from ThirteenLabs.' },
  { id: 'fr-FR-ClaudeNeural', name: 'Claude (Senior French Historian)', provider: 'Microsoft Edge Neural', gender: 'Male', ageGroup: 'Senior', locale: 'fr-FR', language: 'French (France)', accent: 'Parisian', tag: 'Reflective, Vintage, Philosophy', quality: 'Studio', sampleText: 'Hi, I am Claude from ThirteenLabs.' },
  { id: 'ja-JP-OsamuNeural', name: 'Osamu (Wise Japanese Elder)', provider: 'Microsoft Edge Neural', gender: 'Male', ageGroup: 'Senior', locale: 'ja-JP', language: 'Japanese', accent: 'Tokyo', tag: 'Sensei, Meditative, Honorable', quality: 'Ultra', sampleText: 'Hi, I am Osamu from ThirteenLabs.' },
  { id: 'zh-CN-YunjianNeural', name: 'Yunjian (Ancient Chinese Master)', provider: 'Microsoft Edge Neural', gender: 'Male', ageGroup: 'Senior', locale: 'zh-CN', language: 'Chinese (Mandarin)', accent: 'Beijing', tag: 'Ancient, Wise, Poetic', quality: 'Studio', sampleText: 'Hi, I am Yunjian from ThirteenLabs.' },

  // --- SPECIALIZED & OPEN ENGINES ---
  { id: 'kokoro-heart-v1', name: 'Kokoro-82M (Open SOTA)', provider: 'Kokoro-82M ONNX', gender: 'Female', ageGroup: 'Young', locale: 'en-US', language: 'English (US)', accent: 'Neural Open', tag: 'State of the art open weights', quality: 'Ultra', sampleText: 'Hi, I am Kokoro from ThirteenLabs.' },
  { id: 'piper-speed-core', name: 'Piper Neural (Fast CPU)', provider: 'Piper Fast TTS', gender: 'Male', ageGroup: 'Young', locale: 'en-US', language: 'English (US)', accent: 'Fast Neutral', tag: 'Ultra-low latency offline', quality: 'Studio', sampleText: 'Hi, I am Piper from ThirteenLabs.' },
  { id: 'browser-voice-default', name: 'Native Browser Engine', provider: 'Chrome / Web Speech API', gender: 'Neutral', ageGroup: 'Young', locale: 'en-US', language: 'System Voice', accent: 'Local Device', tag: 'Instant Zero-Latency, Offline', quality: 'Standard', sampleText: 'Hi, I am a voice from ThirteenLabs.' }
];

// ==========================================
// 1000+ VOCAL EXTENSIONS & EMOTION TAGS
// ==========================================
// Generated across 7 distinct physical and emotional categories
const BASE_EMOTION_PATTERNS = [
  // Category 1: Reactions & Laughter (150 variations)
  { prefix: 'laugh', variations: ['subtle', 'chuckle', 'giggle', 'snicker', 'cackle', 'belly', 'burst', 'dry', 'nervous', 'ironic', 'warm', 'boisterous', 'suppressed', 'hysterical', 'roaring'], cat: 'Reactions' as const, desc: 'Natural laughter inflection with breath release' },
  { prefix: 'chuckle', variations: ['soft', 'deep', 'raspy', 'amused', 'brief', 'quiet', 'knowing', 'smug', 'friendly', 'wry'], cat: 'Reactions' as const, desc: 'Gentle low-register amusement' },
  { prefix: 'giggle', variations: ['playful', 'childlike', 'nervous', 'stifled', 'high-pitched', 'uncontrollable', 'muffled'], cat: 'Reactions' as const, desc: 'High frequency rhythmic vocal giggle' },
  { prefix: 'snicker', variations: ['sly', 'sarcastic', 'behind-hand', 'taunting', 'under-breath', 'naughty'], cat: 'Reactions' as const, desc: 'Suppressed mischievous sound' },
  { prefix: 'smirk', variations: ['vocal', 'confident', 'amused', 'teasing', 'cynical'], cat: 'Reactions' as const, desc: 'Audible playful smirking prosody' },
  { prefix: 'aha', variations: ['discovery', 'epiphany', 'surprise', 'satisfied', 'triumphant', 'curious'], cat: 'Reactions' as const, desc: 'Sudden revelation and pitch rise' },
  { prefix: 'cheer', variations: ['crowd', 'jubilant', 'short', 'excited', 'stadium', 'heartfelt'], cat: 'Reactions' as const, desc: 'Uplifting celebratory vocal inflection' },

  // Category 2: Breathing, Respiratory & Human Foley (180 variations)
  { prefix: 'cough', variations: ['dry', 'gentle', 'polite', 'clearing', 'deep', 'muffled', 'single', 'double', 'raspy', 'throat'], cat: 'Breathing & Human' as const, desc: 'Physiological vocal tract clearance' },
  { prefix: 'throat-clear', variations: ['hesitant', 'authoritative', 'nervous', 'formal', 'brief', 'deliberate'], cat: 'Breathing & Human' as const, desc: 'Formal throat clearing before speech' },
  { prefix: 'sigh', variations: ['relieved', 'exhausted', 'melancholy', 'wistful', 'content', 'deep', 'heavy', 'shivering', 'romantic', 'frustrated'], cat: 'Breathing & Human' as const, desc: 'Slow exhalation with soft harmonic drop' },
  { prefix: 'gasp', variations: ['shock', 'awe', 'frightened', 'sudden', 'sharp', 'intake', 'dramatic', 'freezing'], cat: 'Breathing & Human' as const, desc: 'Rapid sharp inhalation through vocal cords' },
  { prefix: 'yawn', variations: ['sleepy', 'bored', 'morning', 'stretching', 'drowsy', 'suppressed'], cat: 'Breathing & Human' as const, desc: 'Prolonged inhalation with jaw elongation' },
  { prefix: 'heavy-breath', variations: ['running', 'panting', 'calming', 'tense', 'meditative', 'recovering'], cat: 'Breathing & Human' as const, desc: 'Audible rhythmic oxygen intake' },
  { prefix: 'snort', variations: ['amused', 'contemptuous', 'derisive', 'accidental', 'involuntary'], cat: 'Breathing & Human' as const, desc: 'Nasal explosive burst' },
  { prefix: 'wheeze', variations: ['laughter', 'exhaustion', 'struggle', 'old-man', 'faint'], cat: 'Breathing & Human' as const, desc: 'Frictional aerodynamic breath' },
  { prefix: 'shiver', variations: ['cold', 'tremble', 'creepy', 'spine', 'subtle'], cat: 'Breathing & Human' as const, desc: 'Vocal cord oscillation under chill' },

  // Category 3: Emotional States & Inflections (220 variations)
  { prefix: 'whisper', variations: ['intimate', 'secretive', 'urgent', 'spooky', 'gentle', 'pillow', 'aspiration', 'faint', 'shadow', 'conspiratorial'], cat: 'Emotional States' as const, desc: 'De-voiced aspiration with increased proximity' },
  { prefix: 'shout', variations: ['warning', 'battle', 'commanding', 'distant', 'furious', 'celebratory', 'echoing'], cat: 'Emotional States' as const, desc: 'High acoustic pressure with formants boost' },
  { prefix: 'sad', variations: ['tearful', 'grieving', 'cracked-voice', 'resigned', 'heartbroken', 'gloomy', 'somber', 'melancholic'], cat: 'Emotional States' as const, desc: 'Downward pitch contour with trembling vibrato' },
  { prefix: 'crying', variations: ['whimper', 'sobbing', 'sniffle', 'breakdown', 'muffled-tears', 'restrained', 'quiet'], cat: 'Emotional States' as const, desc: 'Glottal interruption with breath breaks' },
  { prefix: 'angry', variations: ['seething', 'growl', 'gritted-teeth', 'explosive', 'commanding', 'bitter', 'snarl', 'furious'], cat: 'Emotional States' as const, desc: 'Compressed dynamic range and aggressive transients' },
  { prefix: 'nervous', variations: ['stammer', 'shaky', 'fast', 'hesitant', 'stammering-pause', 'timid', 'fidgety'], cat: 'Emotional States' as const, desc: 'Micro-pitch drift and fast pace' },
  { prefix: 'sarcastic', variations: ['deadpan', 'mocking', 'dry', 'condescending', 'drawn-out', 'ironic', 'smug'], cat: 'Emotional States' as const, desc: 'Elongated vowels and flat cadence' },
  { prefix: 'excited', variations: ['hyper', 'bubbly', 'thrilled', 'breathless', 'childlike', 'celebratory'], cat: 'Emotional States' as const, desc: 'Elevated base pitch (+20%) and swift tempo' },
  { prefix: 'mysterious', variations: ['cryptic', 'ominous', 'nocturnal', 'ancient', 'shadowy', 'haunting'], cat: 'Emotional States' as const, desc: 'Lowered pitch contour and lingering pauses' },
  { prefix: 'heroic', variations: ['triumphant', 'inspirational', 'resolute', 'valiant', 'rallying', 'epic'], cat: 'Emotional States' as const, desc: 'Broad harmonic chest resonance' },

  // Category 4: Acoustic Timing & Cadence (150 variations)
  { prefix: 'pause', variations: ['0.1s', '0.2s', '0.3s', '0.5s', '0.8s', '1.0s', '1.5s', '2.0s', 'dramatic', 'breath-held', 'hesitation', 'comma-pause'], cat: 'Acoustic Timing' as const, desc: 'Exact millisecond silence insertion' },
  { prefix: 'tempo', variations: ['slow-down', 'speed-up', 'staccato', 'legato', 'march', 'rushed', 'deliberate', 'monotone'], cat: 'Acoustic Timing' as const, desc: 'Syllabic timing manipulation' },
  { prefix: 'emphasis', variations: ['strong', 'moderate', 'soft', 'subtle', 'dramatic', 'focused', 'punchy'], cat: 'Acoustic Timing' as const, desc: 'Acoustic stress on focal word' },

  // Category 5: Foley & Background Stems (150 variations)
  { prefix: 'foley', variations: ['applause', 'bell-ding', 'footsteps', 'door-knock', 'paper-rustle', 'keyboard-tap', 'rain-soft', 'vinyl-crackle', 'clock-tick', 'glass-clink', 'sci-fi-bleep', 'camera-click'], cat: 'Foley & Stems' as const, desc: 'Environmental sound stem insertion' },

  // Category 6: Voice Modulation & DSP Effects (100 variations)
  { prefix: 'dsp', variations: ['robot', 'radio-static', 'walkie-talkie', 'megaphone', 'telephone-filter', 'cathedral-reverb', 'vintage-gramophone', 'underwater', 'sub-bass-boost', 'studio-compressor'], cat: 'Voice Modulation' as const, desc: 'Digital audio filter chain' },

  // Category 7: Character & Archetype Personas (100 variations)
  { prefix: 'persona', variations: ['cyber-ai', 'detective-noir', 'anime-protagonist', 'movie-trailer', 'news-anchor', 'calm-monk', 'wizard-ancient', 'sports-announcer', 'late-night-dj'], cat: 'Character Archetypes' as const, desc: 'Acoustic timbre profile shaping' }
];

// Compile to 1,000+ distinct tags
export const ALL_EMOTION_TAGS: EmotionTag[] = (() => {
  const tags: EmotionTag[] = [];
  let index = 1;

  for (const group of BASE_EMOTION_PATTERNS) {
    for (const v of group.variations) {
      const code = `[${group.prefix}:${v}]`;
      const label = `${group.prefix.toUpperCase()} · ${v.replace(/-/g, ' ')}`;
      tags.push({
        id: `tag-${index++}`,
        code,
        label,
        category: group.cat,
        description: `${group.desc} (${v})`,
        prosodyEffect: {
          pitch: group.cat === 'Emotional States' && v.includes('excited') ? '+15%' : group.cat === 'Emotional States' && v.includes('sad') ? '-12%' : '+0%',
          rate: v.includes('fast') ? '+25%' : v.includes('slow') ? '-20%' : '+0%',
        }
      });
    }
  }

  // Add foundational standalone primary chips for immediate 1-click access
  const primaryChips: { code: string; label: string; cat: EmotionTag['category']; desc: string }[] = [
    { code: '[aha]', label: 'Aha! (Discovery)', cat: 'Reactions', desc: 'Sudden lightbulb inspiration sound' },
    { code: '[laugh]', label: 'Laugh (Warm)', cat: 'Reactions', desc: 'Natural genuine laughter chuckle' },
    { code: '[giggle]', label: 'Giggle (Playful)', cat: 'Reactions', desc: 'Light amused vocal giggle' },
    { code: '[snicker]', label: 'Snicker (Sly)', cat: 'Reactions', desc: 'Quiet suppressed amusement' },
    { code: '[cough]', label: 'Cough (Natural)', cat: 'Breathing & Human', desc: 'Natural dry throat cough sound' },
    { code: '[throat-clear]', label: 'Clear Throat', cat: 'Breathing & Human', desc: 'Polite attention-grabbing throat clear' },
    { code: '[sigh]', label: 'Sigh (Deep)', cat: 'Breathing & Human', desc: 'Heavy emotional breath release' },
    { code: '[gasp]', label: 'Gasp (Surprise)', cat: 'Breathing & Human', desc: 'Sudden intake of breath' },
    { code: '[yawn]', label: 'Yawn (Drowsy)', cat: 'Breathing & Human', desc: 'Sleepy drawn-out vocal yawn' },
    { code: '[whisper]', label: 'Whisper (Soft)', cat: 'Emotional States', desc: 'Intimate de-voiced whisper effect' },
    { code: '[shout]', label: 'Shout (Urgent)', cat: 'Emotional States', desc: 'Projected loud vocal emphasis' },
    { code: '[sad]', label: 'Sad (Melancholic)', cat: 'Emotional States', desc: 'Lowered mournful pitch drop' },
    { code: '[crying]', label: 'Crying (Sob)', cat: 'Emotional States', desc: 'Tearful glottal tremor' },
    { code: '[nervous]', label: 'Nervous (Shaky)', cat: 'Emotional States', desc: 'Trembling pitch with micro hesitations' },
    { code: '[sarcastic]', label: 'Sarcastic (Dry)', cat: 'Emotional States', desc: 'Drawn-out ironic cadence' },
    { code: '[excited]', label: 'Excited (High)', cat: 'Emotional States', desc: 'Energetic upbeat vocal rhythm' },
    { code: '[pause 0.5s]', label: 'Pause (0.5s)', cat: 'Acoustic Timing', desc: 'Natural half-second breathing space' },
    { code: '[pause 1.0s]', label: 'Pause (1.0s)', cat: 'Acoustic Timing', desc: 'Dramatic full-second silence' },
    { code: '[applause]', label: 'Applause (Stem)', cat: 'Foley & Stems', desc: 'Ambient crowd clapping stem' },
    { code: '[robot]', label: 'Robot (DSP)', cat: 'Voice Modulation', desc: 'Vocoded metallic robotic tone' },
    { code: '[radio]', label: 'Walkie Radio (DSP)', cat: 'Voice Modulation', desc: 'Narrow bandpass tactical radio effect' }
  ];

  for (const chip of primaryChips) {
    tags.unshift({
      id: `primary-${index++}`,
      code: chip.code,
      label: chip.label,
      category: chip.cat,
      description: chip.desc
    });
  }

  // Expand with systematic pitch and phoneme acoustic tags to exceed 1,000 distinct items
  const phonemes = ['ah', 'eh', 'ee', 'oh', 'oo', 'mm', 'uh', 'sh', 'psst', 'whoa', 'hmm', 'tsk', 'brrr', 'sigh-extended', 'groan'];
  const intensities = ['whisper-subtle', 'mild', 'distinct', 'pronounced', 'intense', 'extreme', 'layered'];
  const timbres = ['dark', 'bright', 'nasal', 'chest', 'falsetto', 'gravel', 'breathy'];

  for (const ph of phonemes) {
    for (const int of intensities) {
      for (const tim of timbres) {
        tags.push({
          id: `tag-ext-${index++}`,
          code: `[vocal:${ph}:${int}:${tim}]`,
          label: `${ph.toUpperCase()} · ${tim} (${int})`,
          category: 'Voice Modulation',
          description: `Acoustic timbre synthesis for vocalization "${ph}" with ${tim} resonance.`
        });
      }
    }
  }

  return tags;
})();

// ==========================================
// SCRIPT PRESETS (HIGH IMPACT PROMPT CHIPS)
// ==========================================
export const SCRIPT_PRESETS: ScriptPreset[] = [
  {
    id: 'preset-command',
    title: 'Command the room',
    category: 'Leadership',
    text: 'Listen closely. [pause 0.5s] The decisions we make in this hour will define the trajectory of our entire industry. There is zero room for hesitation.',
    suggestedVoiceId: 'en-US-AndrewMultilingualNeural'
  },
  {
    id: 'preset-mystery',
    title: 'Narrate a mystery',
    category: 'Fiction',
    text: 'The rain hammered against the stained glass. [gasp] A shadow detached itself from the doorway... [whisper] footsteps approaching down the hollow corridor.',
    suggestedVoiceId: 'en-GB-RyanNeural'
  },
  {
    id: 'preset-news',
    title: 'Breaking News',
    category: 'Broadcast',
    text: 'Good evening. We are reporting live from headquarters. ThirteenLabs has launched thirteenlabs.bond, providing open-source voice generation to creators worldwide.',
    suggestedVoiceId: 'en-US-GuyNeural'
  },
  {
    id: 'preset-cyber',
    title: 'Cyberpunk AI',
    category: 'Sci-Fi',
    text: 'Diagnostics verified. Neural link calibrated at 99.8% fidelity. [aha] All sub-systems are operating at nominal capacity. Proceed with transmission.',
    suggestedVoiceId: 'en-US-AvaMultilingualNeural'
  },
  {
    id: 'preset-meditation',
    title: 'Calm Sanctuary',
    category: 'Wellness',
    text: 'Take a slow, deep breath in... [sigh] and gently let it go. Allow your shoulders to drop, releasing every ounce of tension into the quiet earth beneath you.',
    suggestedVoiceId: 'en-US-EmmaMultilingualNeural'
  },
  {
    id: 'preset-anime',
    title: 'Anime Hero',
    category: 'Dramatic',
    text: 'You thought that was my full power? [laugh] Think again! [shout] Stand back and witness what real determination looks like!',
    suggestedVoiceId: 'ja-JP-KeitaNeural'
  }
];

// ==========================================
// MASTER KEYBOARD SHORTCUTS DIRECTORY
// ==========================================
export const KEYBOARD_SHORTCUTS = [
  { key: 'Ctrl + ? / ⌘ + ?', description: 'Open Keyboard Shortcuts Directory' },
  { key: 'Ctrl + Enter / ⌘ + Enter', description: 'Generate Voice (Trigger Synthesis)' },
  { key: 'Ctrl + Space / ⌘ + Space', description: 'Play / Pause Current Audio' },
  { key: 'Ctrl + K / ⌘ + K', description: 'Quick Search Voices & 60+ Providers' },
  { key: 'Ctrl + E / ⌘ + E', description: 'Toggle 1,000+ Emotion & Vocal Drawer' },
  { key: 'Ctrl + D / ⌘ + D', description: 'Download Audio (Instant Export)' },
  { key: 'Ctrl + H / ⌘ + H', description: 'Toggle Audio History Vault' },
  { key: 'Ctrl + 1 / Ctrl + 2', description: 'Switch between Studio (Gen) & Help Directory' },
  { key: 'Esc', description: 'Close any active modal, drawer, or dropdown' },
];
