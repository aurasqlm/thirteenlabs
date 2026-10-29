'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Volume2, Globe, Radio } from 'lucide-react';
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
  const [selectedGender, setSelectedGender] = useState<'All' | 'Male' | 'Female'>('All');
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter voices based on search query, gender, and provider
  const filteredVoices = CURATED_VOICES.filter((voice) => {
    const matchesSearch =
      voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.tag.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = selectedGender === 'All' || voice.gender === selectedGender;
    return matchesSearch && matchesGender;
  });

  // Preview voice sample via speech synthesis
  const previewVoice = (e: React.MouseEvent, voice: VoiceModel) => {
    e.stopPropagation();
    if (typeof window === 'undefined') return;

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setPreviewingVoiceId(voice.id);
      const utter = new SpeechSynthesisUtterance(voice.sampleText);
      utter.rate = 1.0;
      utter.pitch = 1.0;
      utter.onend = () => setPreviewingVoiceId(null);
      utter.onerror = () => setPreviewingVoiceId(null);
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block w-full text-left">
      {/* Trigger Button: Exact 8px rounded container, 1px #E4E4E7 border, 14px chevron rotating 180deg over 200ms out-expo */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className={`flex w-full items-center justify-between rounded-lg border bg-studio-white px-3.5 py-2 text-xs transition-colors duration-200 ${
          isOpen ? 'border-studio-borderActive ring-1 ring-studio-borderActive' : 'border-studio-border hover:border-studio-borderHover'
        }`}
      >
        <div className="flex items-center space-x-2.5 truncate">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-studio-hover text-studio-obsidian">
            <Radio className="h-3 w-3 stroke-[1.5]" />
          </div>
          <div className="flex flex-col text-left truncate">
            <span className="font-medium text-studio-obsidian truncate">{selectedVoice.name}</span>
            <span className="text-[10px] text-studio-muted truncate">{selectedVoice.language} • {selectedVoice.provider}</span>
          </div>
        </div>

        {/* 14px monochrome chevron with exact 180deg rotation */}
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-studio-muted transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'rotate-180 text-studio-obsidian' : 'rotate-0'
          }`}
          style={{ strokeWidth: 1.5 }}
        />
      </button>

      {/* Floating Dropdown Menu: exactly 6px below trigger, studio-grade shadow, 180ms micro-spring */}
      {isOpen && (
        <div
          className="absolute left-0 z-50 mt-[6px] w-full min-w-[340px] max-w-md rounded-xl border border-studio-border bg-studio-white shadow-studio-menu transition-all duration-180 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            animation: 'dropdownSpring 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Search & Provider Filter Bar */}
          <div className="border-b border-studio-border p-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-studio-muted stroke-[1.5]" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search voices, languages, or providers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-studio-border bg-studio-canvas py-1.5 pl-8 pr-3 text-xs text-studio-obsidian placeholder-studio-muted outline-none transition-colors focus:border-studio-borderActive focus:bg-studio-white"
              />
            </div>

            {/* Gender Filters */}
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-wider text-studio-muted">Voices Filter</span>
              <div className="flex space-x-1">
                {(['All', 'Male', 'Female'] as const).map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setSelectedGender(gender)}
                    className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                      selectedGender === gender
                        ? 'bg-studio-obsidian text-studio-white'
                        : 'text-studio-muted hover:bg-studio-hover hover:text-studio-obsidian'
                    }`}
                  >
                    {gender}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scrollable Voices List */}
          <div className="max-h-64 overflow-y-auto p-1.5 divide-y divide-studio-borderSoft">
            {filteredVoices.length === 0 ? (
              <div className="p-4 text-center text-xs text-studio-muted">
                No voices found matching "{searchQuery}".
              </div>
            ) : (
              filteredVoices.map((voice) => {
                const isSelected = selectedVoice.id === voice.id;
                const isPlaying = previewingVoiceId === voice.id;

                return (
                  <div
                    key={voice.id}
                    onClick={() => {
                      onSelectVoice(voice);
                      setIsOpen(false);
                    }}
                    className={`group flex items-center justify-between rounded-md px-3 py-2 text-xs transition-colors duration-80 cursor-pointer ${
                      isSelected
                        ? 'bg-studio-hover text-studio-obsidian font-medium'
                        : 'text-studio-muted hover:bg-studio-hover hover:text-studio-obsidian'
                    }`}
                  >
                    <div className="flex flex-col truncate pr-2">
                      <div className="flex items-center space-x-1.5 truncate">
                        <span className="text-studio-obsidian font-medium truncate">{voice.name}</span>
                        <span className="rounded bg-studio-canvas border border-studio-border px-1.5 py-0.2 text-[9px] text-studio-muted">
                          {voice.gender}
                        </span>
                      </div>
                      <span className="text-[10px] text-studio-muted truncate">{voice.tag}</span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {/* Audio Sample Preview */}
                      <button
                        type="button"
                        onClick={(e) => previewVoice(e, voice)}
                        title="Preview voice sample"
                        className={`flex h-6 w-6 items-center justify-center rounded border border-studio-border transition-colors ${
                          isPlaying ? 'bg-studio-obsidian text-studio-white' : 'bg-studio-white text-studio-muted hover:text-studio-obsidian hover:bg-studio-hover'
                        }`}
                      >
                        <Volume2 className="h-3 w-3 stroke-[1.5]" />
                      </button>

                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-studio-obsidian stroke-[2]" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Footer: 60+ Providers Overview */}
          <div className="border-t border-studio-border bg-studio-porcelain px-3 py-2 text-[10px] text-studio-muted flex items-center justify-between">
            <span>Aggregating 60+ Open & Free Providers</span>
            <span className="font-mono text-studio-obsidian font-medium">Zero API Keys</span>
          </div>
        </div>
      )}
    </div>
  );
}
