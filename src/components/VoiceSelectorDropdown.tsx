'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Search, Check, Play, Square, Radio, X } from 'lucide-react';
import { VoiceModel } from '@/types';
import { CURATED_VOICES } from '@/lib/constants';

interface VoiceSelectorDropdownProps {
  selectedVoice: VoiceModel;
  onSelectVoice: (voice: VoiceModel) => void;
  selectedProvider: string;
  onSelectProvider: (providerId: string) => void;
}

const INITIAL_BATCH_SIZE = 24; // 6 rows of 4 columns
const BATCH_INCREMENT = 24;

const PROVIDER_FILTERS = [
  { id: 'all', label: 'All Engines' },
  { id: 'edge-neural', label: 'Edge Neural' },
  { id: 'kokoro', label: 'Kokoro-82M' },
  { id: 'piper', label: 'Piper TTS' },
  { id: 'web-speech', label: 'Web Speech' },
];

export default function VoiceSelectorDropdown({
  selectedVoice,
  onSelectVoice,
  selectedProvider,
  onSelectProvider,
}: VoiceSelectorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAge, setSelectedAge] = useState<'All' | 'Child' | 'Young' | 'Mature' | 'Senior'>('All');
  const [selectedGender, setSelectedGender] = useState<'All' | 'Male' | 'Female'>('All');
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Dynamic virtualized scrolling batch count
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH_SIZE);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown and VANISH the scrolled ones (reset back to initial 24)
  const handleClose = useCallback(() => {
    setIsOpen(false);
    // Reset scrolled items so memory and DOM stay pristine
    setVisibleCount(INITIAL_BATCH_SIZE);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    // Stop any preview playback
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setPreviewingVoiceId(null);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClose]);

  // Global Ctrl + K / Esc listener for voice search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      if (isCmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Filter voices across Age, Gender, Engine Provider, and Search
  const filteredVoices = CURATED_VOICES.filter((voice) => {
    const matchesSearch =
      voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.locale.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.provider.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAge = selectedAge === 'All' || voice.ageGroup === selectedAge;
    const matchesGender = selectedGender === 'All' || voice.gender === selectedGender;
    const matchesProvider =
      !selectedProvider ||
      selectedProvider === 'all' ||
      (selectedProvider === 'edge-neural' && (voice.provider.toLowerCase().includes('edge') || voice.provider.toLowerCase().includes('neural'))) ||
      (selectedProvider === 'kokoro' && voice.provider.toLowerCase().includes('kokoro')) ||
      (selectedProvider === 'piper' && voice.provider.toLowerCase().includes('piper')) ||
      (selectedProvider === 'web-speech' && (voice.provider.toLowerCase().includes('web') || voice.provider.toLowerCase().includes('speech'))) ||
      voice.provider.toLowerCase().includes(selectedProvider.toLowerCase());

    return matchesSearch && matchesAge && matchesGender && matchesProvider;
  });

  // Infinite scroll handler: loads more when approaching bottom
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const reachedBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 160;

    if (reachedBottom && visibleCount < filteredVoices.length) {
      setVisibleCount((prev) => Math.min(prev + BATCH_INCREMENT, filteredVoices.length));
    }
  };

  // Preview voice sample using real neural audio with fallback
  const handlePreviewVoice = (e: React.MouseEvent, voice: VoiceModel) => {
    e.stopPropagation();

    if (typeof window === 'undefined') return;

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (previewingVoiceId === voice.id) {
      setPreviewingVoiceId(null);
      return;
    }

    setPreviewingVoiceId(voice.id);

    const previewSentence = `Hi, I am ${voice.name.split(' ')[0]} from ThirteenLabs.`;
    const voiceIdParam = encodeURIComponent(voice.edgeVoiceId || voice.id);
    const textParam = encodeURIComponent(previewSentence);

    // 1. Try real neural speech preview via local or proxy endpoint
    const previewUrl = `http://127.0.0.1:8000/api/generate?voice=${voiceIdParam}&text=${textParam}&format=mp3`;
    const audio = new Audio(previewUrl);
    previewAudioRef.current = audio;

    audio.onended = () => {
      setPreviewingVoiceId(null);
      previewAudioRef.current = null;
    };

    audio.onerror = () => {
      // 2. Fallback to browser Web Speech API
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(previewSentence);
        utterance.volume = 1.0;
        utterance.rate = 1.0;
        utterance.pitch = voice.ageGroup === 'Child' ? 1.25 : voice.ageGroup === 'Senior' ? 0.85 : 1.0;

        const availableVoices = window.speechSynthesis.getVoices();
        const matched = availableVoices.find(
          (v) =>
            v.lang.toLowerCase() === voice.locale.toLowerCase() ||
            v.name.toLowerCase().includes(voice.name.toLowerCase())
        );
        if (matched) utterance.voice = matched;

        utterance.onend = () => setPreviewingVoiceId(null);
        utterance.onerror = () => setPreviewingVoiceId(null);

        window.speechSynthesis.speak(utterance);
      } else {
        setPreviewingVoiceId(null);
      }
    };

    audio.play().catch(() => {
      audio.onerror?.(new Event('error'));
    });
  };

  const currentlyRenderedVoices = filteredVoices.slice(0, visibleCount);

  return (
    <div ref={containerRef} className="relative inline-block w-full text-left">
      {/* Trigger Button: Spacious, High-Contrast Clickable Area */}
      <button
        type="button"
        onClick={() => {
          if (isOpen) {
            handleClose();
          } else {
            setIsOpen(true);
          }
        }}
        className={`flex w-full items-center justify-between rounded-xl border bg-studio-white px-4 py-2.5 text-xs transition-all duration-150 shadow-studio-tight ${
          isOpen
            ? 'border-studio-borderActive ring-1 ring-studio-borderActive shadow-studio-btn'
            : 'border-studio-border hover:border-studio-borderHover hover:shadow-studio-btn'
        }`}
      >
        <div className="flex items-center space-x-3 truncate">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-studio-obsidian text-studio-white">
            <Radio className="h-3.5 w-3.5 stroke-[1.5]" />
          </div>
          <div className="flex flex-col text-left truncate">
            <div className="flex items-center space-x-1.5 truncate">
              <span className="font-semibold text-studio-obsidian truncate text-xs sm:text-sm">
                {selectedVoice.name}
              </span>
              {selectedVoice.ageGroup && (
                <span className="rounded bg-studio-canvas border border-studio-border px-1.5 py-0.5 text-[9px] font-mono text-studio-subtle">
                  {selectedVoice.ageGroup}
                </span>
              )}
            </div>
            <span className="text-[10px] text-studio-muted truncate">
              {selectedVoice.language} • {selectedVoice.provider}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 pl-2">
          <span className="hidden sm:inline-block rounded-full border border-studio-border bg-studio-porcelain px-2 py-0.5 text-[10px] font-mono text-studio-muted">
            1,200+ Voices
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-studio-muted transition-transform duration-200 ease-studio-squash ${
              isOpen ? 'rotate-180 text-studio-obsidian' : 'rotate-0'
            }`}
            style={{ strokeWidth: 1.5 }}
          />
        </div>
      </button>

      {/* Floating 4-Column Spacious Modal / Popover */}
      {isOpen && (
        <div
          className="fixed inset-x-4 top-16 z-50 mx-auto max-w-6xl rounded-2xl border border-studio-border bg-studio-white shadow-studio-menu sm:inset-x-8"
          style={{
            animation: 'dropdownSpring 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Header & Filter Controls */}
          <div className="border-b border-studio-border p-4 bg-studio-porcelain/60 rounded-t-2xl">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-studio-muted stroke-[1.5]" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search 1,200+ voices by name, country, age group, or style..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(INITIAL_BATCH_SIZE);
                  }}
                  className="w-full rounded-lg border border-studio-border bg-studio-white py-2 pl-9 pr-3 text-xs text-studio-obsidian placeholder-studio-muted outline-none transition-colors focus:border-studio-borderActive focus:ring-1 focus:ring-studio-borderActive"
                />
              </div>

              {/* Close Button: Vanishes the scrolled items & resets */}
              <button
                type="button"
                onClick={handleClose}
                className="self-end md:self-auto flex h-8 w-8 items-center justify-center rounded-lg border border-studio-border bg-studio-white text-studio-muted hover:bg-studio-hover hover:text-studio-obsidian transition-colors"
                title="Close and reset"
              >
                <X className="h-4 w-4 stroke-[1.5]" />
              </button>
            </div>

            {/* Filter Pills Bar: Age Group, Gender & Engine Provider */}
            <div className="mt-3 flex flex-col gap-2.5 pt-2 border-t border-studio-borderSoft">
              {/* Engine Provider Filter Row */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
                <span className="text-[11px] font-mono uppercase text-studio-muted mr-1 shrink-0">
                  Engine:
                </span>
                {PROVIDER_FILTERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectProvider(p.id);
                      setVisibleCount(INITIAL_BATCH_SIZE);
                    }}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors whitespace-nowrap ${
                      (selectedProvider === p.id || (!selectedProvider && p.id === 'all'))
                        ? 'bg-studio-obsidian text-studio-white shadow-studio-tight'
                        : 'border border-studio-border bg-studio-white text-studio-muted hover:bg-studio-hover hover:text-studio-obsidian'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Age & Gender Row */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Age Filters: Child, Young, Mature, Senior */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-mono uppercase text-studio-muted mr-1">
                    Age:
                  </span>
                  {(['All', 'Child', 'Young', 'Mature', 'Senior'] as const).map((age) => (
                    <button
                      key={age}
                      type="button"
                      onClick={() => {
                        setSelectedAge(age);
                        setVisibleCount(INITIAL_BATCH_SIZE);
                      }}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        selectedAge === age
                          ? 'bg-studio-obsidian text-studio-white shadow-studio-tight'
                          : 'border border-studio-border bg-studio-white text-studio-muted hover:bg-studio-hover hover:text-studio-obsidian'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>

                {/* Gender Filters */}
                <div className="flex items-center space-x-1.5">
                  <span className="text-[11px] font-mono uppercase text-studio-muted mr-1">
                    Gender:
                  </span>
                  {(['All', 'Female', 'Male'] as const).map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => {
                        setSelectedGender(gender);
                        setVisibleCount(INITIAL_BATCH_SIZE);
                      }}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        selectedGender === gender
                          ? 'bg-studio-obsidian text-studio-white shadow-studio-tight'
                          : 'border border-studio-border bg-studio-white text-studio-muted hover:bg-studio-hover hover:text-studio-obsidian'
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 4-COLUMN VOICES GRID WITH DYNAMIC SCROLL LOADING */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="max-h-[62vh] overflow-y-auto p-4 sm:p-5"
          >
            {currentlyRenderedVoices.length === 0 ? (
              <div className="py-16 text-center text-xs text-studio-muted">
                No voices found matching "{searchQuery}". Try clearing filters.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {currentlyRenderedVoices.map((voice) => {
                    const isSelected = selectedVoice.id === voice.id;
                    const isPlaying = previewingVoiceId === voice.id;

                    return (
                      <div
                        key={voice.id}
                        onClick={() => {
                          onSelectVoice(voice);
                          handleClose(); // Closes dropdown and vanishes scrolled items
                        }}
                        className={`group relative flex flex-col justify-between rounded-xl border p-3 text-xs transition-all duration-100 cursor-pointer ${
                          isSelected
                            ? 'border-studio-obsidian bg-studio-porcelain ring-1 ring-studio-obsidian shadow-studio-tight'
                            : 'border-studio-border bg-studio-white hover:border-studio-borderHover hover:bg-studio-hover hover:shadow-studio-tight'
                        }`}
                      >
                        {/* Card Top: Name & Badges */}
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-semibold text-studio-obsidian truncate text-xs leading-snug">
                              {voice.name}
                            </span>
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 text-studio-obsidian stroke-[2.5] shrink-0 mt-0.5" />
                            )}
                          </div>

                          {/* Badges: Age & Gender */}
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {voice.ageGroup && (
                              <span className="rounded bg-studio-canvas border border-studio-borderSoft px-1.5 py-0.5 text-[9px] font-mono text-studio-subtle">
                                {voice.ageGroup}
                              </span>
                            )}
                            <span className="rounded bg-studio-canvas border border-studio-borderSoft px-1.5 py-0.5 text-[9px] font-mono text-studio-muted">
                              {voice.gender}
                            </span>
                            <span className="rounded bg-studio-canvas border border-studio-borderSoft px-1.5 py-0.5 text-[9px] font-mono text-studio-muted">
                              {voice.language}
                            </span>
                          </div>

                          {/* Tag description */}
                          <p className="mt-2 text-[10px] text-studio-muted line-clamp-2">
                            {voice.tag}
                          </p>
                        </div>

                        {/* Card Bottom: Provider & Audio Preview Button */}
                        <div className="mt-3 flex items-center justify-between border-t border-studio-borderSoft pt-2">
                          <span className="text-[10px] font-mono text-studio-muted truncate max-w-[120px]">
                            {voice.provider.replace('Microsoft ', '')}
                          </span>

                          {/* Sleek Preview > Play Button */}
                          <button
                            type="button"
                            onClick={(e) => handlePreviewVoice(e, voice)}
                            title={`Preview: "Hi, I am ${voice.name.split(' ')[0]} from ThirteenLabs."`}
                            className={`flex items-center space-x-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                              isPlaying
                                ? 'bg-studio-obsidian text-studio-white'
                                : 'border border-studio-border bg-studio-white text-studio-muted hover:border-studio-obsidian hover:text-studio-obsidian'
                            }`}
                          >
                            {isPlaying ? (
                              <>
                                <Square className="h-2.5 w-2.5 fill-current" />
                                <span>Stop</span>
                              </>
                            ) : (
                              <>
                                <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                                <span>Preview</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Infinite Scroll Footer Prompt */}
                {visibleCount < filteredVoices.length && (
                  <div className="mt-4 text-center py-2 text-[11px] font-mono text-studio-muted">
                    Showing {visibleCount} of {filteredVoices.length} voices • Scroll down to load more...
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Bar */}
          <div className="border-t border-studio-border bg-studio-porcelain px-5 py-3 rounded-b-2xl text-[11px] text-studio-muted flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Loaded {Math.min(visibleCount, filteredVoices.length)} of {filteredVoices.length} voices in 4-column studio grid
            </span>
            <span className="font-mono text-studio-obsidian font-medium">
              Zero API Keys • Free Aggregator
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
