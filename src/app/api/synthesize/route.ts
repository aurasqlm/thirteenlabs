import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

function getLangCode(voiceId: string): string {
  const localeMatch = voiceId.match(/(?:^|-)([a-z]{2})-[A-Z]{2}/i);
  if (localeMatch) return localeMatch[1].toLowerCase();

  const standardCodes = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'hi', 'ar', 'ru', 'tr', 'pl', 'nl', 'sv', 'th', 'vi', 'id', 'el', 'he', 'bn', 'ur', 'fil', 'da', 'fi', 'no', 'cs', 'hu', 'ro', 'uk', 'ms', 'sw'];
  for (const code of standardCodes) {
    if (new RegExp(`(^|[-_])${code}([-_]|$)`, 'i').test(voiceId)) {
      return code;
    }
  }
  return 'en';
}

// Generate audio via Edge-TTS / Free Neural TTS
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice = 'en-US-AndrewMultilingualNeural', rate = 1.0, pitch = 1.0, format = 'mp3' } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text prompt is required' }, { status: 400 });
    }

    // Clean emotion tags for acoustic generation
    const cleanedText = text
      .replace(/\[(?:aha|laugh|giggle|snicker)[^\]]*\]/gi, ' haha ')
      .replace(/\[(?:cough|throat-clear|gasp|sigh)[^\]]*\]/gi, ' ... ')
      .replace(/\[(?:whisper)[^\]]*\]/gi, ' ')
      .replace(/\[(?:shout)[^\]]*\]/gi, '! ')
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

        const backendRes = await fetch(
          `${pythonBackendUrl}/api/generate?text=${encodeURIComponent(textToSynthesize)}&voice=${encodeURIComponent(voice)}&rate=${encodeURIComponent(rateParam)}&pitch=${encodeURIComponent(pitchParam)}&format=${format}`,
          { signal: AbortSignal.timeout(10000) }
        );

        if (backendRes.ok) {
          const audioBuffer = await backendRes.arrayBuffer();
          return new Response(audioBuffer, {
            headers: {
              'Content-Type': format === 'wav' ? 'audio/wav' : 'audio/mpeg',
              'Content-Disposition': `attachment; filename="thirteenlabs-${Date.now()}.${format}"`,
              'X-Engine': 'ThirteenLabs-Python-FastAPI',
            },
          });
        }
      } catch (e) {
        console.warn('Python backend unavailable, falling back to direct edge synthesizer', e);
      }
    }

    // Direct High-Reliability Neural Endpoint (Google Translate Audio / Edge fallback)
    const langCode = getLangCode(voice);
    const encodedText = encodeURIComponent(textToSynthesize.slice(0, 1000));
    const fallbackTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${langCode}&client=tw-ob`;

    const audioRes = await fetch(fallbackTtsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      },
    });

    if (!audioRes.ok) {
      throw new Error(`TTS provider returned status ${audioRes.status}`);
    }

    const audioData = await audioRes.arrayBuffer();

    return new Response(audioData, {
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
        solution: 'Use Chrome / Web Speech client mode or verify network connection'
      },
      { status: 500 }
    );
  }
}
