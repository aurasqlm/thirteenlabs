import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function getLangCode(voiceId: string): string {
  const localeMatch = voiceId.match(/(?:^|-)([a-z]{2})-[A-Z]{2}/i);
  if (localeMatch) return localeMatch[1].toLowerCase();

  const standardCodes = [
    'en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'hi',
    'ar', 'ru', 'tr', 'pl', 'nl', 'sv', 'th', 'vi', 'id', 'el',
    'he', 'bn', 'ur', 'fil', 'da', 'fi', 'no', 'cs', 'hu', 'ro',
    'uk', 'ms', 'sw'
  ];
  for (const code of standardCodes) {
    if (new RegExp(`(^|[-_])${code}([-_]|$)`, 'i').test(voiceId)) {
      return code;
    }
  }
  return 'en';
}

function splitTextIntoChunks(text: string, maxLen = 170): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+|\S+/g) || [text];
  const chunks: string[] = [];
  let current = '';

  for (const s of sentences) {
    if ((current + ' ' + s).trim().length <= maxLen) {
      current = (current + ' ' + s).trim();
    } else {
      if (current) chunks.push(current);
      if (s.length > maxLen) {
        for (let i = 0; i < s.length; i += maxLen) {
          chunks.push(s.slice(i, i + maxLen));
        }
        current = '';
      } else {
        current = s;
      }
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [text];
}

// Generate audio via Edge-TTS / Free Neural TTS
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      text,
      voice = 'en-US-AndrewMultilingualNeural',
      rate = 1.0,
      pitch = 1.0,
      format = 'mp3',
      stability = 75,
      similarity = 85,
    } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text prompt is required' }, { status: 400 });
    }

    // Clean emotion tags for acoustic generation while respecting punctuation
    const cleanedText = text
      .replace(/\[(?:cough|throat-clear|gasp|sigh|yawn|snort|wheeze)[^\]]*\]/gi, ' ... ')
      .replace(/\[(?:laugh|giggle|snicker|chuckle|cackle|smirk)[^\]]*\]/gi, ' haha! ')
      .replace(/\[(?:whisper)[^\]]*\]/gi, ' ')
      .replace(/\[(?:shout|yell|cheer)[^\]]*\]/gi, '! ')
      .replace(/\[pause\s*([0-9.]+)s?\]/gi, ' ... ')
      .replace(/\[.*?\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const textToSynthesize = cleanedText || text;

    // Check if external Python FastAPI backend is provided
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL;
    if (pythonBackendUrl) {
      try {
        const rateParam = rate >= 1.0 ? `+${Math.round((rate - 1.0) * 100)}%` : `-${Math.round((1.0 - rate) * 100)}%`;
        const pitchParam = pitch >= 1.0 ? `+${Math.round((pitch - 1.0) * 50)}Hz` : `-${Math.round((1.0 - pitch) * 50)}Hz`;

        const backendRes = await fetch(`${pythonBackendUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textToSynthesize,
            voice,
            rate: rateParam,
            pitch: pitchParam,
            volume: '+0%',
            format,
            stability,
            similarity,
          }),
          signal: AbortSignal.timeout(60000), // 60s timeout for long generations
        });

        if (backendRes.ok) {
          const audioBuffer = await backendRes.arrayBuffer();
          const contentType =
            format === 'wav' ? 'audio/wav' :
            format === 'flac' ? 'audio/flac' :
            format === 'ogg' ? 'audio/ogg' :
            format === 'aac' ? 'audio/aac' : 'audio/mpeg';

          return new Response(audioBuffer, {
            headers: {
              'Content-Type': contentType,
              'Content-Disposition': `attachment; filename="thirteenlabs-${Date.now()}.${format}"`,
              'X-Engine': 'ThirteenLabs-Python-FastAPI',
            },
          });
        }
      } catch (e) {
        console.warn('Python backend unavailable, falling back to direct edge synthesizer', e);
      }
    }

    // Direct High-Reliability Neural Endpoint with Concurrent Sentence Chunking (<170 chars per chunk)
    const langCode = getLangCode(voice);
    const textChunks = splitTextIntoChunks(textToSynthesize, 170);

    const chunkBuffers: ArrayBuffer[] = await Promise.all(
      textChunks.map(async (chunk) => {
        const encodedText = encodeURIComponent(chunk);
        const fallbackTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${langCode}&client=tw-ob`;

        const audioRes = await fetch(fallbackTtsUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Referer: 'https://translate.google.com/',
          },
        });

        if (!audioRes.ok) {
          throw new Error(`TTS provider returned status ${audioRes.status}`);
        }

        return audioRes.arrayBuffer();
      })
    );

    // Concatenate all MP3 frame buffers
    const totalByteLength = chunkBuffers.reduce((acc, b) => acc + b.byteLength, 0);
    const combinedBuffer = new Uint8Array(totalByteLength);
    let offset = 0;
    for (const buf of chunkBuffers) {
      combinedBuffer.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }

    return new Response(combinedBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="thirteenlabs-${Date.now()}.mp3"`,
        'X-Engine': 'ThirteenLabs-Edge-Neural',
        'X-Author': 'aurasqlm',
        'X-Repo': 'https://github.com/aurasqlm/thirteenlabs',
      },
    });
  } catch (err: any) {
    console.error('Synthesis error:', err);
    return NextResponse.json(
      {
        error: 'Audio generation failed',
        details: err?.message || 'Unknown error',
        solution: 'Use Chrome / Web Speech client mode or verify network connection',
      },
      { status: 500 }
    );
  }
}
