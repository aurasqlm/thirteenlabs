'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Play, Square, Radio, Sparkles, Filter, X } from 'lucide-react';
import { VoiceModel } from '@/types';
import { CURATED_VOICES, VOICE_PROVIDERS } from '@/lib/constants';

interface VoiceSelectorDropdownProps {
  selectedVoice: VoiceModel;
  onSelectVoice: (voice: VoiceModel) => void;
  selectedProvider: string;
  onSelectProvider: (providerId: string) => void;
}

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
  const [selectedProviderFilter, setSelectedProviderFilter] = useState<string>('All');
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Filter voices across Age, Gender, Provider, and Search
  const filteredVoices = CURATED_VOICES.filter((voice) => {
    const matchesSearch =
      voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.provider.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAge = selectedAge === 'All' || voice.ageGroup === selectedAge;
    const matchesGender = selectedGender === 'All' || voice.gender === selectedGender;
    const matchesProvider = selectedProviderFilter === 'All' || voice.provider === selectedProviderFilter;

    return matchesSearch && matchesAge && matchesGender && matchesProvider;
  });

  // Preview voice sample saying: "Hi, I am [Name] from ThirteenLabs."
  const handlePreviewVoice = (e: React.MouseEvent, voice: VoiceModel) => {
    e.stopPropagation();

    if (typeof window === 'undefined') return;

    if (previewingVoiceId === voice.id) {
      // Stop preview
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPreviewingVoiceId(null);
      return;
    }

    setPreviewingVoiceId(voice.id);

    const previewSentence = `Hi, I am ${voice.name.split(' ')[0]} from ThirteenLabs.`;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(previewSentence);
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
      setTimeout(() => setPreviewingVoiceId(null), 2000);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block w-full text-left">
      {/* Trigger Button: Bigger, Wider, Taller with High Visibility & Prominence */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
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

        {/* 14px monochrome chevron with exact 180deg rotation */}
        <div className="flex items-center space-x-2 shrink-0 pl-2">
          <span className="hidden sm:inline-block rounded-full border border-studio-border bg-studio-porcelain px-2 py-0.5 text-[10px] font-mono text-studio-muted">
            Change Voice
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
          className="fixed inset-x-4 top-20 z-50 mx-auto max-w-6xl rounded-2xl border border-studio-border bg-studio-white shadow-studio-menu sm:inset-x-8"
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
                  placeholder="Search 400+ voices by name, age, accent, language..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-studio-border bg-studio-white py-2 pl-9 pr-3 text-xs text-studio-obsidian placeholder-studio-muted outline-none transition-colors focus:border-studio-borderActive focus:ring-1 focus:ring-studio-borderActive"
                />
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="self-end md:self-auto flex h-8 w-8 items-center justify-center rounded-lg border border-studio-border bg-studio-white text-studio-muted hover:bg-studio-hover hover:text-studio-obsidian transition-colors"
              >
                <X className="h-4 w-4 stroke-[1.5]" />
              </button>
            </div>

            {/* Filter Pills Bar: Age Group, Gender */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-studio-borderSoft">
              {/* Age Filters: Child, Young, Mature, Senior */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[11px] font-mono uppercase text-studio-muted mr-1">
                  Age:
                </span>
                {(['All', 'Child', 'Young', 'Mature', 'Senior'] as const).map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() => setSelectedAge(age)}
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
                    onClick={() => setSelectedGender(gender)}
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

          {/* 4-COLUMN VOICES GRID (ROW WITH 4 VOICES PER ROW) */}
          <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-5">
            {filteredVoices.length === 0 ? (
              <div className="py-16 text-center text-xs text-studio-muted">
                No voices found matching your criteria. Try adjusting your filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredVoices.map((voice) => {
                  const isSelected = selectedVoice.id === voice.id;
                  const isPlaying = previewingVoiceId === voice.id;

                  return (
                    <div
                      key={voice.id}
                      onClick={() => {
                        onSelectVoice(voice);
                        setIsOpen(false); // Selecting a voice automatically closes the dropdown
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
                          className={`flex items-center space-x-1 rounded-full px-2 py-1 text-[10px] font-medium transition-all ${
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
            )}
          </div>

          {/* Footer Bar */}
          <div className="border-t border-studio-border bg-studio-porcelain px-5 py-3 rounded-b-2xl text-[11px] text-studio-muted flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>
              Showing {filteredVoices.length} voices in 4-column studio grid • Click any card to select
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
