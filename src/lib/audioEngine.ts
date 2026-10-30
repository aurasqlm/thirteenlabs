import { AudioFormat } from '@/types';

// Convert Web Audio AudioBuffer to WAV format directly in-browser (0ms latency, zero server load)
export function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  function writeString(str: string) {
    for (let i = 0; i < str.length; i++) {
      out.setUint8(pos++, str.charCodeAt(i));
    }
  }

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }

  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  // RIFF identifier
  writeString('RIFF');
  setUint32(length - 8);
  writeString('WAVE');

  // fmt sub-chunk
  writeString('fmt ');
  setUint32(16); // subchunk1size (16 for PCM)
  setUint16(1);  // audio format (1 is PCM)
  setUint16(numOfChan);
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan); // byte rate
  setUint16(numOfChan * 2); // block align
  setUint16(16); // bits per sample

  // data sub-chunk
  writeString('data');
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (offset < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}

// Clean emotion tags from text for standard speech synthesis
export function stripEmotionTags(text: string): string {
  return text
    .replace(/\[(?:aha|haha|laugh|giggle|snicker|cackle)[^\]]*\]/gi, ' haha ')
    .replace(/\[(?:cry|crying|sob|sobbing|weep)[^\]]*\]/gi, ' ... ')
    .replace(/\[(?:cough|throat-clear|gasp|sigh|yawn|sneeze)[^\]]*\]/gi, ' ... ')
    .replace(/\[(?:whisper)[^\]]*\]/gi, ' ')
    .replace(/\[(?:shout)[^\]]*\]/gi, '! ')
    .replace(/\[pause\s*([0-9.]+)s?\]/gi, ' ... ')
    .replace(/\[.*?\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Trigger browser download
export function triggerDownload(url: string, filename: string) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export const SFX_ASSETS: Record<string, string> = {
  haha: '/sfx/laugh.mp3',
  laugh: '/sfx/laugh.mp3',
  chuckle: '/sfx/laugh.mp3',
  giggle: '/sfx/laugh.mp3',
  snicker: '/sfx/laugh.mp3',
  cackle: '/sfx/laugh.mp3',
  cry: '/sfx/cry.mp3',
  crying: '/sfx/cry.mp3',
  sob: '/sfx/cry.mp3',
  sobbing: '/sfx/cry.mp3',
  weep: '/sfx/cry.mp3',
  cough: '/sfx/cough.mp3',
  'throat-clear': '/sfx/throat_clear.mp3',
  throat_clear: '/sfx/throat_clear.mp3',
  ahem: '/sfx/throat_clear.mp3',
  snort: '/sfx/cough.mp3',
  wheeze: '/sfx/gasp.mp3',
  sigh: '/sfx/sigh.mp3',
  gasp: '/sfx/gasp.mp3',
  yawn: '/sfx/yawn.mp3',
  sneeze: '/sfx/sneeze.mp3',
};

export interface TextSegment {
  type: 'speech' | 'sfx' | 'pause';
  content: string;
  emotion?: 'normal' | 'shout' | 'sad' | 'angry' | 'nervous';
  pauseMs?: number;
}

export function parsePromptSegments(text: string): TextSegment[] {
  const tagPattern = /\[([a-zA-Z0-9_.:\- ]+)\]/g;
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let currentEmotion: 'normal' | 'shout' | 'sad' | 'angry' | 'nervous' = 'normal';

  let match: RegExpExecArray | null;
  while ((match = tagPattern.exec(text)) !== null) {
    const textBefore = text.substring(lastIndex, match.index).trim();
    if (textBefore) {
      segments.push({ type: 'speech', content: textBefore, emotion: currentEmotion });
    }
    const tag = match[1].toLowerCase().trim();
    lastIndex = match.index + match[0].length;

    if (tag.includes('pause')) {
      const numMatch = tag.match(/([0-9.]+)\s*s?/);
      const ms = numMatch ? Math.round(parseFloat(numMatch[1]) * 1000) : 500;
      segments.push({ type: 'pause', content: '', pauseMs: ms });
      continue;
    }

    let matchedSfx: string | null = null;
    for (const [k, v] of Object.entries(SFX_ASSETS)) {
      if (tag.includes(k)) {
        matchedSfx = v;
        break;
      }
    }
    if (matchedSfx) {
      segments.push({ type: 'sfx', content: matchedSfx });
      if (tag.includes('cry') || tag.includes('sob') || tag.includes('weep')) {
        currentEmotion = 'sad';
      }
      continue;
    }

    if (tag.includes('shout') || tag.includes('yell') || tag.includes('scream')) {
      currentEmotion = 'shout';
    } else if (tag.includes('sad') || tag.includes('cry') || tag.includes('crying') || tag.includes('sob') || tag.includes('melancholy')) {
      currentEmotion = 'sad';
    } else if (tag.includes('angry') || tag.includes('furious')) {
      currentEmotion = 'angry';
    } else if (tag.includes('nervous') || tag.includes('tremble')) {
      currentEmotion = 'nervous';
    } else if (tag.includes('normal') || tag.includes('reset') || tag.includes('whisper')) {
      currentEmotion = 'normal';
    }
  }

  const remaining = text.substring(lastIndex).trim();
  if (remaining) {
    segments.push({ type: 'speech', content: remaining, emotion: currentEmotion });
  }

  return segments.length > 0 ? segments : [{ type: 'speech', content: text, emotion: 'normal' }];
}

// In-browser Web Audio synthesis engine with real SFX and acoustic filter DSP
export async function synthesizeWithWebAudioDSP(
  text: string,
  voiceLocale: string = 'en',
  speed: number = 1.0,
  pitch: number = 1.0
): Promise<Blob> {
  const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtxClass) {
    throw new Error('Web Audio API not supported');
  }
  const audioCtx = new AudioCtxClass();
  const segments = parsePromptSegments(text);
  const audioBuffers: AudioBuffer[] = [];

  const langCode = voiceLocale.split('-')[0].toLowerCase() || 'en';

  for (const seg of segments) {
    if (seg.type === 'sfx') {
      try {
        const sfxRes = await fetch(seg.content);
        if (sfxRes.ok) {
          const sfxBuf = await sfxRes.arrayBuffer();
          const decoded = await audioCtx.decodeAudioData(sfxBuf);
          audioBuffers.push(decoded);
        }
      } catch (e) {
        console.warn('Could not load SFX in browser', seg.content, e);
      }
    } else if (seg.type === 'pause') {
      const pauseDuration = (seg.pauseMs || 500) / 1000;
      const silentBuffer = audioCtx.createBuffer(1, Math.round(audioCtx.sampleRate * pauseDuration), audioCtx.sampleRate);
      audioBuffers.push(silentBuffer);
    } else if (seg.type === 'speech' && seg.content) {
      try {
        const encodedText = encodeURIComponent(seg.content);
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${langCode}&client=tw-ob`;
        const res = await fetch(ttsUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });
        if (res.ok) {
          const rawBuf = await res.arrayBuffer();
          let decoded = await audioCtx.decodeAudioData(rawBuf);

          // Apply clean natural prosody - ZERO static or harsh dish antenna filter
          if (seg.emotion === 'sad') {
            const offlineCtx = new OfflineAudioContext(
              decoded.numberOfChannels,
              decoded.length,
              decoded.sampleRate
            );
            const source = offlineCtx.createBufferSource();
            source.buffer = decoded;

            const lowpass = offlineCtx.createBiquadFilter();
            lowpass.type = 'lowpass';
            lowpass.frequency.value = 3800;

            const gain = offlineCtx.createGain();
            gain.gain.value = 0.8;

            source.connect(lowpass);
            lowpass.connect(gain);
            gain.connect(offlineCtx.destination);
            source.start(0);

            decoded = await offlineCtx.startRendering();
          } else if (seg.emotion === 'shout') {
            const offlineCtx = new OfflineAudioContext(
              decoded.numberOfChannels,
              decoded.length,
              decoded.sampleRate
            );
            const source = offlineCtx.createBufferSource();
            source.buffer = decoded;

            const gain = offlineCtx.createGain();
            gain.gain.value = 1.35;

            source.connect(gain);
            gain.connect(offlineCtx.destination);
            source.start(0);

            decoded = await offlineCtx.startRendering();
          }

          audioBuffers.push(decoded);
        }
      } catch (ttsErr) {
        console.warn('Speech chunk failed in browser engine', ttsErr);
      }
    }
  }

  if (audioBuffers.length === 0) {
    throw new Error('No audio buffers could be generated');
  }

  // Concatenate all AudioBuffers into one master buffer
  const sampleRate = audioBuffers[0].sampleRate;
  const numChannels = Math.max(...audioBuffers.map((b) => b.numberOfChannels));
  const totalLength = audioBuffers.reduce((sum, b) => sum + b.length, 0);

  const masterBuffer = audioCtx.createBuffer(numChannels, totalLength, sampleRate);
  for (let ch = 0; ch < numChannels; ch++) {
    const channelData = masterBuffer.getChannelData(ch);
    let offset = 0;
    for (const b of audioBuffers) {
      const srcChannel = ch < b.numberOfChannels ? b.getChannelData(ch) : b.getChannelData(0);
      channelData.set(srcChannel, offset);
      offset += b.length;
    }
  }

  return audioBufferToWav(masterBuffer);
}

// Convert and download audio with genuine container formatting (e.g. PCM WAV)
export async function downloadFormattedAudio(audioUrl: string, format: AudioFormat, baseFilename: string) {
  if (format === 'wav') {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        const audioCtx = new AudioCtxClass();
        const response = await fetch(audioUrl);
        const arrayBuf = await response.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuf);
        const wavBlob = audioBufferToWav(audioBuffer);
        const wavUrl = URL.createObjectURL(wavBlob);
        triggerDownload(wavUrl, `${baseFilename}.wav`);
        setTimeout(() => URL.revokeObjectURL(wavUrl), 10000);
        return;
      }
    } catch (e) {
      console.warn('In-browser WAV PCM transcoding fallback', e);
    }
  }

  // Standard download
  triggerDownload(audioUrl, `${baseFilename}.${format}`);
}
