'use client';

import React from 'react';
import { X, History, Play, Trash2, Download, ArrowUpRight } from 'lucide-react';
import { GeneratedAudioItem } from '@/types';
import { triggerDownload, downloadFormattedAudio } from '@/lib/audioEngine';

interface AudioHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: GeneratedAudioItem[];
  onPlayItem: (item: GeneratedAudioItem) => void;
  onRestoreText: (text: string) => void;
  onClearHistory: () => void;
  onDeleteItem?: (id: string) => void;
}

export default function AudioHistoryDrawer({
  isOpen,
  onClose,
  history,
  onPlayItem,
  onRestoreText,
  onClearHistory,
  onDeleteItem,
}: AudioHistoryDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Translucent Backdrop: click outside to dismiss */}
      <div
        className="fixed inset-0 bg-black/25 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
      />

      {/* Slide-over Drawer Container */}
      <div className="absolute inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-studio-border bg-studio-white shadow-studio-menu transition-all animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-studio-border p-4 bg-studio-porcelain">
        <div className="flex items-center space-x-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-studio-obsidian text-studio-white">
            <History className="h-3.5 w-3.5 stroke-[1.5]" />
          </div>
          <div>
            <h3 className="font-sans text-xs font-semibold tracking-tight text-studio-obsidian">
              Audio History Vault
            </h3>
            <p className="text-[10px] text-studio-muted">
              {history.length} saved audio generations
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              title="Clear all history"
              className="flex h-7 w-7 items-center justify-center rounded-md text-studio-muted transition-colors hover:bg-studio-hover hover:text-red-600"
            >
              <Trash2 className="h-3.5 w-3.5 stroke-[1.5]" />
            </button>
          )}
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-studio-muted transition-colors hover:bg-studio-hover hover:text-studio-obsidian"
          >
            <X className="h-4 w-4 stroke-[1.5]" />
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <History className="h-8 w-8 text-studio-muted stroke-[1] mb-2" />
            <p className="text-xs font-medium text-studio-obsidian">No generations yet</p>
            <p className="text-[11px] text-studio-muted mt-0.5">
              Generated audio clips will be archived here automatically.
            </p>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="group rounded-lg border border-studio-border bg-studio-white p-3 text-xs transition-all hover:border-studio-borderHover hover:shadow-studio-tight"
            >
              {/* Voice info & timestamp */}
              <div className="flex items-center justify-between text-[10px] text-studio-muted pb-1.5 border-b border-studio-borderSoft">
                <span className="font-medium text-studio-obsidian">{item.voice.name}</span>
                <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>

              {/* Text Snippet */}
              <p className="my-2 text-[11px] text-studio-subtle line-clamp-2">
                {item.text}
              </p>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center space-x-1.5">
                  {/* Play preview */}
                  <button
                    onClick={() => onPlayItem(item)}
                    className="flex items-center space-x-1 rounded bg-studio-obsidian px-2 py-1 text-[10px] font-medium text-studio-white transition-opacity hover:opacity-90"
                  >
                    <Play className="h-2.5 w-2.5 fill-current" />
                    <span>Play</span>
                  </button>

                  {/* Re-inject text into editor */}
                  <button
                    onClick={() => onRestoreText(item.text)}
                    className="flex items-center space-x-1 rounded border border-studio-border bg-studio-white px-2 py-1 text-[10px] text-studio-muted hover:bg-studio-hover hover:text-studio-obsidian transition-colors"
                  >
                    <ArrowUpRight className="h-2.5 w-2.5 stroke-[1.5]" />
                    <span>Load Script</span>
                  </button>
                </div>

                {/* Instant Download with format transcoding */}
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => downloadFormattedAudio(item.audioUrl, item.format, `thirteenlabs-${item.id}`)}
                    className="flex h-6 w-6 items-center justify-center rounded border border-studio-border text-studio-muted hover:bg-studio-hover hover:text-studio-obsidian transition-colors"
                    title={`Download .${item.format}`}
                  >
                    <Download className="h-3 w-3 stroke-[1.5]" />
                  </button>

                  {onDeleteItem && (
                    <button
                      onClick={() => onDeleteItem(item.id)}
                      className="flex h-6 w-6 items-center justify-center rounded border border-studio-border text-studio-muted hover:bg-studio-hover hover:text-red-600 transition-colors"
                      title="Delete recording"
                    >
                      <Trash2 className="h-3 w-3 stroke-[1.5]" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-studio-border bg-studio-porcelain p-3 text-[10px] text-studio-muted text-center">
        Stored locally in your browser memory • 100% private
      </div>
    </div>
    </div>
  );
}
