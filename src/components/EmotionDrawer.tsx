'use client';

import React, { useState } from 'react';
import { X, Search, Sparkles, Plus, Info, Layers } from 'lucide-react';
import { ALL_EMOTION_TAGS } from '@/lib/constants';
import { EmotionTag } from '@/types';

interface EmotionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertTag: (tagCode: string) => void;
}

export default function EmotionDrawer({ isOpen, onClose, onInsertTag }: EmotionDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = [
    'All',
    'Reactions',
    'Breathing & Human',
    'Emotional States',
    'Acoustic Timing',
    'Foley & Stems',
    'Voice Modulation',
    'Character Archetypes',
  ];

  const filteredTags = ALL_EMOTION_TAGS.filter((tag) => {
    const matchesSearch =
      tag.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || tag.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-studio-border bg-studio-white shadow-studio-menu transition-all animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-studio-border p-4 bg-studio-porcelain">
        <div className="flex items-center space-x-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-studio-obsidian text-studio-white">
            <Sparkles className="h-3.5 w-3.5 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="font-sans text-xs font-semibold tracking-tight text-studio-obsidian">
              1,000+ Vocal Extensions & Emotion Tags
            </h3>
            <p className="text-[10px] text-studio-muted">
              Click any tag to inject into your script
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-studio-muted transition-colors hover:bg-studio-hover hover:text-studio-obsidian"
        >
          <X className="h-4 w-4 stroke-[1.5]" />
        </button>
      </div>

      {/* Search Input */}
      <div className="border-b border-studio-border p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-studio-muted stroke-[1.5]" />
          <input
            type="text"
            placeholder="Search emotions (e.g. laugh, cough, whisper, pause)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-studio-border bg-studio-canvas py-1.5 pl-8 pr-3 text-xs text-studio-obsidian placeholder-studio-muted outline-none transition-colors focus:border-studio-borderActive focus:bg-studio-white"
          />
        </div>

        {/* Category Pill Filters */}
        <div className="mt-2.5 flex flex-wrap gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-studio-obsidian text-studio-white'
                  : 'border border-studio-border bg-studio-white text-studio-muted hover:bg-studio-hover hover:text-studio-obsidian'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tags List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-studio-muted pb-1">
          <span>Available Extensions</span>
          <span className="font-mono text-[10px]">{filteredTags.length} tags</span>
        </div>

        {filteredTags.slice(0, 150).map((tag) => (
          <div
            key={tag.id}
            onClick={() => onInsertTag(tag.code)}
            className="group flex items-center justify-between rounded-lg border border-studio-border bg-studio-white p-2 text-xs transition-all duration-100 hover:border-studio-borderHover hover:bg-studio-hover hover:shadow-studio-tight cursor-pointer"
          >
            <div className="flex flex-col pr-2">
              <div className="flex items-center space-x-2">
                <code className="rounded bg-studio-canvas border border-studio-borderSoft px-1.5 py-0.5 font-mono text-[11px] text-studio-obsidian font-semibold">
                  {tag.code}
                </code>
                <span className="text-[11px] text-studio-subtle font-medium">{tag.label}</span>
              </div>
              <p className="mt-0.5 text-[10px] text-studio-muted truncate max-w-[280px]">
                {tag.description}
              </p>
            </div>

            <button
              type="button"
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-studio-border bg-studio-white text-studio-muted opacity-80 group-hover:opacity-100 group-hover:border-studio-obsidian group-hover:bg-studio-obsidian group-hover:text-studio-white transition-colors"
            >
              <Plus className="h-3 w-3 stroke-[2]" />
            </button>
          </div>
        ))}

        {filteredTags.length > 150 && (
          <div className="py-2 text-center text-[11px] text-studio-muted">
            Showing top 150 results. Use the search bar above to narrow down 1,000+ items.
          </div>
        )}
      </div>

      {/* Quick Footer */}
      <div className="border-t border-studio-border bg-studio-porcelain p-3 text-[10px] text-studio-muted flex items-center justify-between">
        <span>SSML acoustic inflections & foley stems</span>
        <span className="font-mono text-studio-obsidian font-medium">100% Free Engine</span>
      </div>
    </div>
  );
}
