'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Volume2,
  Sliders,
  Smile,
  Download,
  History,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Layers,
  Wand2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import VoiceSelectorDropdown from '@/components/VoiceSelectorDropdown';
import WaveformVisualizer from '@/components/WaveformVisualizer';
import EmotionDrawer from '@/components/EmotionDrawer';
import AudioHistoryDrawer from '@/components/AudioHistoryDrawer';
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal';
import { CURATED_VOICES, SCRIPT_PRESETS, ALL_EMOTION_TAGS } from '@/lib/constants';
import { VoiceModel, AudioFormat, GeneratedAudioItem } from '@/types';
import { downloadFormattedAudio, triggerDownload, audioBufferToWav, stripEmotionTags } from '@/lib/audioEngine';
import {
  loadAudioHistoryFromStorage,
  saveAudioToStorage,
  deleteAudioFromStorage,
  clearAllAudioFromStorage,
} from '@/lib/historyStorage';

export default function GenStudioPage() {
  const router = useRouter();

  // Script text state
  const [text, setText] = useState<string>(
    'Listen closely. [pause 0.5s] The decisions we make in this hour will define the trajectory of our entire industry. [aha] There is zero room for hesitation.'
  );

  // Selected Voice & Provider
  const [selectedVoice, setSelectedVoice] = useState<VoiceModel>(CURATED_VOICES[0]);
  const [selectedProvider, setSelectedProvider] = useState<string>('edge-neural');

  // Sliders: Speed (0.5x - 2.0x), Pitch (-50Hz to +50Hz), Stability (0-100%), Similarity (0-100%)
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [stability, setStability] = useState<number>(75);
  const [similarity, setSimilarity] = useState<number>(85);

  // Selected Download Format (MP3, WAV, FLAC, OGG, AAC)
  const [downloadFormat, setDownloadFormat] = useState<AudioFormat>('mp3');

  // Active audio URL & state
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);
  const [playNonce, setPlayNonce] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  // Drawers & Modals
  const [isEmotionDrawerOpen, setIsEmotionDrawerOpen] = useState<boolean>(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);

  // History vault state
  const [history, setHistory] = useState<GeneratedAudioItem[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load history from durable IndexedDB on client mount
  useEffect(() => {
    let isMounted = true;
    loadAudioHistoryFromStorage().then((items) => {
      if (isMounted) {
        setHistory(items);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      // Ctrl + ? -> Shortcuts modal
      if (isCmdOrCtrl && (e.key === '?' || e.key === '/')) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      }

      // Ctrl + 1 -> Switch to Studio (Gen)
      if (isCmdOrCtrl && e.key === '1') {
        e.preventDefault();
        router.push('/gen');
      }

      // Ctrl + 2 -> Switch to Help Directory
      if (isCmdOrCtrl && e.key === '2') {
        e.preventDefault();
        router.push('/help');
      }

      // Ctrl + Enter -> Trigger Generation
      if (isCmdOrCtrl && e.key === 'Enter') {
        e.preventDefault();
        handleGenerateSpeech();
      }

      // Ctrl + E -> Toggle Emotion Drawer
      if (isCmdOrCtrl && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsEmotionDrawerOpen((prev) => !prev);
      }

      // Ctrl + H -> Toggle History
      if (isCmdOrCtrl && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setIsHistoryDrawerOpen((prev) => !prev);
      }

      // Ctrl + D -> Download Audio (Prevent browser bookmark popup unconditionally)
      if (isCmdOrCtrl && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (currentAudioUrl) {
          handleDownload();
        }
      }

      // Esc -> Close any active dialogs, modals, and drawers
      if (e.key === 'Escape') {
        setIsEmotionDrawerOpen(false);
        setIsHistoryDrawerOpen(false);
        setIsShortcutsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, text, selectedVoice, speed, pitch, stability, similarity, downloadFormat, currentAudioUrl]);

  // Insert emotion tag at cursor position
  const handleInsertTag = (tagCode: string) => {
    if (!textareaRef.current) {
      setText((prev) => `${prev} ${tagCode}`);
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const updated = text.substring(0, start) + ` ${tagCode} ` + text.substring(end);
    setText(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagCode.length + 2, start + tagCode.length + 2);
    }, 50);
  };

  // Generate voice function
  const handleGenerateSpeech = async () => {
    if (!text.trim() || isGenerating) return;

    setIsGenerating(true);

    try {
      // Priority 1: Call Next.js synthesis API route
      const response = await fetch('/api/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: selectedVoice.edgeVoiceId || selectedVoice.id,
          rate: speed,
          pitch: pitch,
          format: downloadFormat,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        if (currentAudioUrl && currentAudioUrl.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(currentAudioUrl);
          } catch (_) {}
        }
        setCurrentAudioUrl(url);

        const newItem: GeneratedAudioItem = {
          id: Date.now().toString(),
          text,
          voice: selectedVoice,
          provider: selectedVoice.provider,
          format: downloadFormat,
          audioUrl: url,
          durationSeconds: Math.max(2, Math.round(text.split(/\s+/).length * 0.4)),
          timestamp: Date.now(),
          settings: { speed, pitch, stability, similarity },
        };
        await saveAudioToStorage(newItem, blob);
        setHistory((prev) => [newItem, ...prev.filter((i) => i.id !== newItem.id)].slice(0, 50));
        setIsGenerating(false);
        return;
      }
    } catch (apiErr) {
      console.warn('Backend API request encountered an error, activating client engine fallback', apiErr);
    }

    // Fallback: Browser Web Speech API Synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleaned = stripEmotionTags(text);
      const utter = new SpeechSynthesisUtterance(cleaned);
      utter.rate = speed;
      utter.pitch = pitch;

      // Try matching voice
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(
        (v) => v.lang.toLowerCase() === selectedVoice.locale.toLowerCase() || v.name.includes(selectedVoice.name)
      );
      if (match) utter.voice = match;

      utter.onend = () => {
        setIsGenerating(false);
      };
      utter.onerror = () => {
        setIsGenerating(false);
      };

      window.speechSynthesis.speak(utter);

      // Create an audible preview representation
      setIsGenerating(false);
    } else {
      setIsGenerating(false);
      alert('Speech synthesis unavailable in this browser environment.');
    }
  };

  // Download audio in selected format with authentic PCM/format transcoding
  const handleDownload = () => {
    if (!currentAudioUrl) return;
    downloadFormattedAudio(currentAudioUrl, downloadFormat, `thirteenlabs-${Date.now()}`);
  };

  // Immediate Stop for all playing audio and speech synthesis
  const handleStopAllAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Metrics
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const estimatedSeconds = Math.max(1, Math.round((wordCount / 140) * 60 * (1 / speed)));

  return (
    <div className="flex min-h-screen flex-col bg-studio-canvas text-studio-obsidian antialiased">
      {/* Top Navigation */}
      <Navigation onOpenShortcuts={() => setIsShortcutsModalOpen(true)} />

      {/* Main Studio Floor */}
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6">
        {/* Workspace Sub-Header: Presets & Vault Triggers */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {/* Secondary Prompt Chips (Pills): 32px height, #FFFFFF, 1px #E4E4E7 */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[11px] font-mono uppercase tracking-wider text-studio-muted">
              Prompt Presets:
            </span>
            {SCRIPT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setText(preset.text);
                  const matched = CURATED_VOICES.find(
                    (v) => v.id === preset.suggestedVoiceId || v.edgeVoiceId === preset.suggestedVoiceId
                  );
                  if (matched) setSelectedVoice(matched);
                }}
                className="rounded-full border border-studio-border bg-studio-white px-3 py-1 text-xs font-normal text-studio-subtle shadow-studio-tight transition-all duration-100 ease-studio-squash hover:-translate-y-0.5 hover:border-studio-borderHover hover:bg-studio-hover hover:text-studio-obsidian hover:shadow-studio-chip active:scale-[0.98]"
              >
                {preset.title}
              </button>
            ))}
          </div>

          {/* Action Pills: Emotion Drawer & Audio History */}
          <div className="flex items-center space-x-2">
            {/* 1,000+ Emotion Ingestion Trigger */}
            <button
              onClick={() => setIsEmotionDrawerOpen(true)}
              className="flex items-center space-x-1.5 rounded-full border border-studio-border bg-studio-white px-3 py-1 text-xs text-studio-muted shadow-studio-tight transition-all hover:border-studio-borderActive hover:bg-studio-hover hover:text-studio-obsidian active:scale-[0.98]"
              title="Browse 1,000+ emotions (Ctrl + E)"
            >
              <Smile className="h-3.5 w-3.5 stroke-[1.5]" />
              <span>1,000+ Emotions</span>
            </button>

            {/* Audio History Drawer Trigger */}
            <button
              onClick={() => setIsHistoryDrawerOpen(true)}
              className="flex items-center space-x-1.5 rounded-full border border-studio-border bg-studio-white px-3 py-1 text-xs text-studio-muted shadow-studio-tight transition-all hover:border-studio-borderActive hover:bg-studio-hover hover:text-studio-obsidian active:scale-[0.98]"
              title="Open history vault (Ctrl + H)"
            >
              <History className="h-3.5 w-3.5 stroke-[1.5]" />
              <span>Vault ({history.length})</span>
            </button>
          </div>
        </div>

        {/* Studio Workspace Grid */}
        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Script Editor & Primary Floor (8 cols) */}
          <div className="flex flex-col rounded-xl border border-studio-border bg-studio-white p-5 shadow-studio-tight lg:col-span-8">
            {/* Editor Top Toolbar */}
            <div className="mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-studio-borderSoft pb-3">
              {/* Voice Selector in Editor: Wider, Taller & High Prominence */}
              <div className="w-full sm:max-w-md">
                <VoiceSelectorDropdown
                  selectedVoice={selectedVoice}
                  onSelectVoice={setSelectedVoice}
                  selectedProvider={selectedProvider}
                  onSelectProvider={setSelectedProvider}
                />
              </div>

              {/* Utility Tools: Clear, Copy, Word Count */}
              <div className="flex items-center space-x-3 text-xs text-studio-muted self-end sm:self-center">
                <span className="font-mono text-[11px]">
                  {wordCount} words • {charCount} chars • ~{estimatedSeconds}s
                </span>

                <div className="h-3 w-[1px] bg-studio-border" />

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(text);
                    setCopiedScript(true);
                    setTimeout(() => setCopiedScript(false), 1500);
                  }}
                  className="flex items-center space-x-1 hover:text-studio-obsidian transition-colors"
                  title="Copy script text"
                >
                  {copiedScript ? (
                    <Check className="h-3.5 w-3.5 stroke-[1.5] text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 stroke-[1.5]" />
                  )}
                  <span>{copiedScript ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => setText('')}
                  className="flex items-center space-x-1 hover:text-red-600 transition-colors"
                  title="Clear editor"
                >
                  <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
                </button>
              </div>
            </div>

            {/* Quick 1-Click Emotion Injector Chips */}
            <div className="mb-3 flex flex-wrap items-center gap-1.5 border-b border-studio-borderSoft pb-3">
              <span className="text-[10px] font-mono uppercase text-studio-muted">
                Quick Tags:
              </span>
              {[
                { tag: '[aha]', label: 'Aha!' },
                { tag: '[laugh]', label: 'Laugh' },
                { tag: '[whisper]', label: 'Whisper' },
                { tag: '[cough]', label: 'Cough' },
                { tag: '[gasp]', label: 'Gasp' },
                { tag: '[sigh]', label: 'Sigh' },
                { tag: '[pause 0.5s]', label: 'Pause 0.5s' },
                { tag: '[shout]', label: 'Shout' },
                { tag: '[sad]', label: 'Sad' },
              ].map((chip) => (
                <button
                  key={chip.tag}
                  onClick={() => handleInsertTag(chip.tag)}
                  className="rounded-md border border-studio-border bg-studio-porcelain px-2 py-0.5 font-mono text-[11px] text-studio-obsidian transition-all hover:border-studio-borderHover hover:bg-studio-hover active:scale-95"
                >
                  {chip.tag}
                </button>
              ))}
              <button
                onClick={() => setIsEmotionDrawerOpen(true)}
                className="font-mono text-[11px] text-studio-muted hover:text-studio-obsidian underline underline-offset-2 ml-1"
              >
                +1,000 more...
              </button>
            </div>

            {/* Central Typography Canvas (Pure White Floor) */}
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text or paste a script. Type [whisper], [laugh], [cough], or [pause 0.5s] to inject acoustic modulations..."
                className="h-full min-h-[280px] w-full resize-none bg-studio-white font-sans text-sm leading-relaxed text-studio-obsidian placeholder-studio-muted outline-none focus:ring-0"
                style={{ caretColor: '#09090B' }}
              />
            </div>

            {/* Generation Bar & Trigger */}
            <div className="mt-4 flex items-center justify-between border-t border-studio-borderSoft pt-4">
              <div className="flex items-center space-x-2 text-[11px] text-studio-muted">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>60+ free providers active • Zero API costs</span>
              </div>

              {/* Primary Generation Button: 36px capsule, #09090B, scale(0.97) squash */}
              <button
                onClick={handleGenerateSpeech}
                disabled={isGenerating || !text.trim()}
                className="flex items-center space-x-2 rounded-full border border-studio-obsidian bg-studio-obsidian px-5 py-2 text-xs font-medium text-studio-white shadow-studio-btn transition-all duration-100 ease-studio-squash hover:-translate-y-0.5 hover:bg-studio-obsidianHover hover:shadow-studio-hover active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none"
                title="Generate voice (Ctrl + Enter)"
              >
                <Sparkles className={`h-3.5 w-3.5 stroke-[2] ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Synthesizing...' : 'Generate Voice (Ctrl + Enter)'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Acoustic Parameters & Tuning (4 cols) */}
          <div className="flex flex-col space-y-4 lg:col-span-4">
            {/* Acoustic Sliders Box */}
            <div className="rounded-xl border border-studio-border bg-studio-white p-5 shadow-studio-tight">
              <div className="mb-4 flex items-center justify-between border-b border-studio-borderSoft pb-3">
                <div className="flex items-center space-x-2">
                  <Sliders className="h-4 w-4 stroke-[1.5] text-studio-obsidian" />
                  <h3 className="font-sans text-xs font-semibold tracking-tight text-studio-obsidian">
                    Acoustic Voice Tuning
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setSpeed(1.0);
                    setPitch(1.0);
                    setStability(75);
                    setSimilarity(85);
                  }}
                  className="text-[10px] text-studio-muted hover:text-studio-obsidian"
                  title="Reset to defaults"
                >
                  Reset
                </button>
              </div>

              {/* Sliders Container: 3px track in #E4E4E7, solid puck in #09090B */}
              <div className="space-y-4">
                {/* Speech Rate / Speed */}
                <div>
                  <div className="flex justify-between text-xs font-normal">
                    <span className="text-studio-muted">Speech Speed</span>
                    <span className="font-mono text-studio-obsidian">{speed.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.05"
                    value={speed}
                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                    className="mt-1.5 h-[3px] w-full cursor-pointer appearance-none rounded-full bg-studio-border accent-studio-obsidian"
                  />
                  <div className="flex justify-between text-[10px] text-studio-muted mt-0.5">
                    <span>0.5x Slow</span>
                    <span>1.0x Normal</span>
                    <span>2.0x Fast</span>
                  </div>
                </div>

                {/* Pitch Shift */}
                <div>
                  <div className="flex justify-between text-xs font-normal">
                    <span className="text-studio-muted">Pitch Modulation</span>
                    <span className="font-mono text-studio-obsidian">
                      {pitch === 1.0 ? 'Natural' : pitch > 1.0 ? `+${Math.round((pitch - 1) * 100)}%` : `-${Math.round((1 - pitch) * 100)}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.7"
                    max="1.3"
                    step="0.02"
                    value={pitch}
                    onChange={(e) => setPitch(parseFloat(e.target.value))}
                    className="mt-1.5 h-[3px] w-full cursor-pointer appearance-none rounded-full bg-studio-border accent-studio-obsidian"
                  />
                  <div className="flex justify-between text-[10px] text-studio-muted mt-0.5">
                    <span>Deep Baritone</span>
                    <span>High Soprano</span>
                  </div>
                </div>

                {/* Stability */}
                <div>
                  <div className="flex justify-between text-xs font-normal">
                    <span className="text-studio-muted">Acoustic Stability</span>
                    <span className="font-mono text-studio-obsidian">{stability}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={stability}
                    onChange={(e) => setStability(parseInt(e.target.value))}
                    className="mt-1.5 h-[3px] w-full cursor-pointer appearance-none rounded-full bg-studio-border accent-studio-obsidian"
                  />
                  <div className="flex justify-between text-[10px] text-studio-muted mt-0.5">
                    <span>Expressive & Dynamic</span>
                    <span>Rock Solid</span>
                  </div>
                </div>

                {/* Similarity & Clarity */}
                <div>
                  <div className="flex justify-between text-xs font-normal">
                    <span className="text-studio-muted">Clarity & Formant Lock</span>
                    <span className="font-mono text-studio-obsidian">{similarity}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={similarity}
                    onChange={(e) => setSimilarity(parseInt(e.target.value))}
                    className="mt-1.5 h-[3px] w-full cursor-pointer appearance-none rounded-full bg-studio-border accent-studio-obsidian"
                  />
                </div>
              </div>
            </div>

            {/* Active Voice Info Card */}
            <div className="rounded-xl border border-studio-border bg-studio-porcelain p-4 shadow-studio-tight">
              <span className="text-[10px] font-mono uppercase tracking-wider text-studio-muted">
                Selected Voice Profile
              </span>
              <h4 className="mt-1 text-xs font-semibold text-studio-obsidian">
                {selectedVoice.name}
              </h4>
              <p className="mt-1 text-[11px] text-studio-muted">
                {selectedVoice.tag}
              </p>
              <div className="mt-2.5 flex items-center justify-between border-t border-studio-borderSoft pt-2 text-[10px] text-studio-muted">
                <span>Locale: {selectedVoice.locale}</span>
                <span className="rounded bg-studio-white border border-studio-border px-1.5 py-0.5 font-mono text-studio-obsidian">
                  {selectedVoice.quality}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Audio Wave Deck */}
        <div className="mt-6">
          <WaveformVisualizer
            audioUrl={currentAudioUrl}
            playNonce={playNonce}
            selectedFormat={downloadFormat}
            onChangeFormat={setDownloadFormat}
            onDownload={handleDownload}
            isLoading={isGenerating}
            onStopAll={handleStopAllAudio}
          />
        </div>
      </main>

      {/* Slide-over Drawers & Modals */}
      <EmotionDrawer
        isOpen={isEmotionDrawerOpen}
        onClose={() => setIsEmotionDrawerOpen(false)}
        onInsertTag={handleInsertTag}
      />

      <AudioHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        history={history}
        onPlayItem={(item) => {
          if (item.audioUrl === currentAudioUrl) {
            setPlayNonce((prev) => prev + 1);
          } else {
            setCurrentAudioUrl(item.audioUrl);
          }
        }}
        onRestoreText={(restored) => setText(restored)}
        onClearHistory={async () => {
          await clearAllAudioFromStorage();
          setHistory([]);
        }}
        onDeleteItem={async (id) => {
          await deleteAudioFromStorage(id);
          setHistory((prev) => prev.filter((item) => item.id !== id));
        }}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
