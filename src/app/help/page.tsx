'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal';
import { VOICE_PROVIDERS, ALL_EMOTION_TAGS, KEYBOARD_SHORTCUTS } from '@/lib/constants';
import {
  HelpCircle,
  Sparkles,
  Command,
  Layers,
  Radio,
  Download,
  GitBranch,
  Search,
  CheckCircle2,
  FileCode,
  Shield,
  Zap,
} from 'lucide-react';

export default function HelpDirectoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'emotions' | 'providers' | 'shortcuts' | 'audio'>('emotions');
  const [searchQuery, setSearchQuery] = useState('');
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Global keyboard shortcuts on Help page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && (e.key === '?' || e.key === '/')) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      }
      if (isCmdOrCtrl && e.key === '1') {
        e.preventDefault();
        router.push('/gen');
      }
      if (isCmdOrCtrl && e.key === '2') {
        e.preventDefault();
        router.push('/help');
      }
      if (e.key === 'Escape') {
        setIsShortcutsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  // Filter emotions in help directory
  const filteredTags = ALL_EMOTION_TAGS.filter(
    (tag) =>
      tag.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter providers in help directory
  const filteredProviders = VOICE_PROVIDERS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col bg-studio-canvas text-studio-obsidian antialiased">
      <Navigation onOpenShortcuts={() => setIsShortcutsModalOpen(true)} />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6">
        {/* Header Hero Section */}
        <div className="mb-8 border-b border-studio-border pb-6">
          <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-studio-muted">
            <span>ThirteenLabs Documentation</span>
            <span>•</span>
            <span className="text-studio-obsidian">by aurasqlm</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-studio-obsidian sm:text-3xl">
            Help Directory & Voice Architecture
          </h1>
          <p className="mt-2 text-sm text-studio-muted max-w-3xl">
            Master the 1,000+ emotion injection tags, explore our catalog of 60+ free zero-API-key voice engines, and understand lossless audio exports and vocal extensions.
          </p>

          {/* Navigation Tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { id: 'emotions', label: '1,000+ Emotions & Tags', icon: Sparkles },
              { id: 'providers', label: '60+ Free Providers', icon: Radio },
              { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Command },
              { id: 'audio', label: 'Audio Formats & DSP', icon: Download },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'border-studio-obsidian bg-studio-obsidian text-studio-white shadow-studio-btn'
                      : 'border-studio-border bg-studio-white text-studio-muted hover:border-studio-borderHover hover:bg-studio-hover hover:text-studio-obsidian'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 stroke-[1.5]" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: 1,000+ Vocal Extensions Catalog */}
        {activeTab === 'emotions' && (
          <div className="space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-base font-semibold text-studio-obsidian">
                  Vocal Extensions & Emotion Syntax
                </h2>
                <p className="text-xs text-studio-muted">
                  Insert these acoustic tags anywhere in your text to trigger natural human laughter, crying, coughing, and pauses.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-studio-muted stroke-[1.5]" />
                <input
                  type="text"
                  placeholder="Search 1,000+ tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-studio-border bg-studio-white py-1.5 pl-8 pr-3 text-xs text-studio-obsidian placeholder-studio-muted outline-none focus:border-studio-borderActive"
                />
              </div>
            </div>

            {/* Syntax Explanation Card */}
            <div className="rounded-xl border border-studio-border bg-studio-white p-5 shadow-studio-tight">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-studio-muted">
                How Emotion Ingestion Works
              </h3>
              <p className="mt-1 text-xs text-studio-subtle leading-relaxed">
                ThirteenLabs parses bracketed tags like <code className="rounded bg-studio-canvas px-1.5 py-0.5 font-mono text-[11px] text-studio-obsidian font-semibold">[aha]</code>, <code className="rounded bg-studio-canvas px-1.5 py-0.5 font-mono text-[11px] text-studio-obsidian font-semibold">[haha]</code>, <code className="rounded bg-studio-canvas px-1.5 py-0.5 font-mono text-[11px] text-studio-obsidian font-semibold">[cry]</code>, or <code className="rounded bg-studio-canvas px-1.5 py-0.5 font-mono text-[11px] text-studio-obsidian font-semibold">[pause 0.5s]</code> and translates them into SSML prosody modulations or time-aligned acoustic stems in the audio stream.
              </p>
            </div>

            {/* Table of Tags */}
            <div className="rounded-xl border border-studio-border bg-studio-white overflow-hidden shadow-studio-tight">
              <div className="max-h-[600px] overflow-y-auto divide-y divide-studio-borderSoft">
                {filteredTags.slice(0, 100).map((tag) => (
                  <div key={tag.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-studio-hover transition-colors text-xs">
                    <div className="flex items-center space-x-3">
                      <code className="rounded border border-studio-border bg-studio-porcelain px-2 py-0.5 font-mono text-xs font-semibold text-studio-obsidian">
                        {tag.code}
                      </code>
                      <span className="font-medium text-studio-obsidian">{tag.label}</span>
                    </div>
                    <div className="mt-1 sm:mt-0 flex items-center space-x-4 text-studio-muted">
                      <span className="text-[11px]">{tag.description}</span>
                      <span className="rounded-full border border-studio-border bg-studio-white px-2 py-0.5 text-[10px] font-mono">
                        {tag.category}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-studio-border bg-studio-porcelain p-3 text-center text-xs text-studio-muted">
                Showing {Math.min(100, filteredTags.length)} of {filteredTags.length} cataloged acoustic extensions.
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 60+ Free Providers Master Catalog */}
        {activeTab === 'providers' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-studio-obsidian">
                60+ Free Speech Providers Aggregator
              </h2>
              <p className="text-xs text-studio-muted">
                ThirteenLabs eliminates corporate paywalls by routing requests through free neural providers, browser APIs, and open-source models with zero API keys.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProviders.map((provider) => (
                <div
                  key={provider.id}
                  className="flex flex-col justify-between rounded-xl border border-studio-border bg-studio-white p-4 shadow-studio-tight transition-all hover:border-studio-borderHover hover:shadow-studio-hover"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded border border-studio-border bg-studio-porcelain px-2 py-0.5 font-mono text-[10px] font-semibold text-studio-obsidian">
                        {provider.badge}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-600 font-medium">
                        100% Free
                      </span>
                    </div>
                    <h3 className="mt-2 text-xs font-semibold text-studio-obsidian">
                      {provider.name}
                    </h3>
                    <p className="mt-1 text-[11px] text-studio-muted leading-relaxed">
                      {provider.description}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-studio-borderSoft pt-2 text-[10px] text-studio-muted font-mono">
                    <span>{provider.voiceCount}+ voices</span>
                    <span>{provider.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Master Keyboard Shortcuts Cheat Sheet */}
        {activeTab === 'shortcuts' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-studio-obsidian">
                Master Keyboard Shortcuts
              </h2>
              <p className="text-xs text-studio-muted">
                Every control in ThirteenLabs is bound to physical hardware shortcuts for rapid workflow.
              </p>
            </div>

            <div className="rounded-xl border border-studio-border bg-studio-white p-6 shadow-studio-tight">
              <div className="divide-y divide-studio-borderSoft">
                {KEYBOARD_SHORTCUTS.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3 text-xs">
                    <span className="text-studio-subtle font-medium">{item.description}</span>
                    <kbd className="rounded border border-studio-border bg-studio-porcelain px-2.5 py-1 font-mono text-xs font-semibold text-studio-obsidian shadow-sm">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Audio Formats & DSP Guide */}
        {activeTab === 'audio' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-semibold text-studio-obsidian">
                Lossless Audio Formats & Export Pipelines
              </h2>
              <p className="text-xs text-studio-muted">
                Choose the exact container and bit-depth appropriate for your production workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { format: 'WAV', title: 'Lossless 48kHz PCM', desc: 'Uncompressed broadcast master audio. Perfect for DaVinci Resolve, Premiere Pro, and DAW mixing.', bestFor: 'Video editing & game design' },
                { format: 'MP3', title: 'MPEG-3 320kbps', desc: 'Universally compatible compressed audio. Lightweight with minimal perceptual quality loss.', bestFor: 'Websites & mobile applications' },
                { format: 'FLAC', title: 'Free Lossless Audio Codec', desc: 'Lossless compression preserving 100% audio data in roughly half the file size of WAV.', bestFor: 'Archival & studio production' },
                { format: 'OGG', title: 'Ogg Vorbis Open Container', desc: 'Royalty-free open-source audio streaming standard with high efficiency.', bestFor: 'Web gaming engines & Linux' },
                { format: 'AAC', title: 'Advanced Audio Coding', desc: 'Optimized high-efficiency compression standard favored across Apple hardware and streaming platforms.', bestFor: 'Podcasting & Apple ecosystem' },
              ].map((fmt) => (
                <div key={fmt.format} className="rounded-xl border border-studio-border bg-studio-white p-5 shadow-studio-tight">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-studio-obsidian">{fmt.format}</span>
                    <span className="rounded bg-studio-porcelain border border-studio-border px-1.5 py-0.5 text-[9px] font-mono text-studio-muted">
                      {fmt.bestFor}
                    </span>
                  </div>
                  <h3 className="mt-2 text-xs font-semibold text-studio-obsidian">{fmt.title}</h3>
                  <p className="mt-1 text-[11px] text-studio-muted leading-relaxed">{fmt.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      <Footer />
    </div>
  );
}
