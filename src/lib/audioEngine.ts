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
    .replace(/\[(?:aha|laugh|giggle|snicker|cackle)[^\]]*\]/gi, ' haha ')
    .replace(/\[(?:cough|throat-clear|gasp|sigh|yawn)[^\]]*\]/gi, ' ... ')
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
