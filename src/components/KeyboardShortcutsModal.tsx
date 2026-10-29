'use client';

import React, { useEffect } from 'react';
import { X, Command, Sparkles, Volume2, Search, Smile, Download, History, Compass } from 'lucide-react';
import { KEYBOARD_SHORTCUTS } from '@/lib/constants';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Translucent backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Floating Dialog Container */}
      <div className="relative w-full max-w-lg rounded-xl border border-studio-border bg-studio-white p-6 shadow-studio-menu transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-studio-border pb-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-studio-hover text-studio-obsidian">
              <Command className="h-3.5 w-3.5 stroke-[1.5]" />
            </div>
            <h3 className="font-sans text-sm font-semibold tracking-tight text-studio-obsidian">
              Keyboard Shortcuts Directory
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-studio-muted transition-colors hover:bg-studio-hover hover:text-studio-obsidian"
          >
            <X className="h-4 w-4 stroke-[1.5]" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="mt-4 divide-y divide-studio-borderSoft">
          {KEYBOARD_SHORTCUTS.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2.5">
              <span className="text-xs text-studio-muted font-normal">
                {item.description}
              </span>
              <kbd className="inline-flex items-center rounded border border-studio-border bg-studio-porcelain px-2 py-0.5 font-mono text-[11px] font-medium text-studio-obsidian shadow-sm">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-5 rounded-lg border border-studio-border bg-studio-canvas p-3 text-center text-[11px] text-studio-muted">
          Press <kbd className="font-mono font-medium text-studio-obsidian">Esc</kbd> anytime to dismiss active dialogs or overlays.
        </div>
      </div>
    </div>
  );
}
