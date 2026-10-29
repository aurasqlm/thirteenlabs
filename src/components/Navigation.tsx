'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, HelpCircle, Command, GitBranch } from 'lucide-react';

interface NavigationProps {
  onOpenShortcuts: () => void;
}

export default function Navigation({ onOpenShortcuts }: NavigationProps) {
  const pathname = usePathname();
  const isGen = pathname === '/' || pathname === '/gen';
  const isHelp = pathname === '/help';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-studio-border bg-studio-porcelain/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand Mark & Author Credits */}
        <div className="flex items-center space-x-3">
          <Link href="/gen" className="group flex items-center space-x-2.5">
            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-md border border-studio-border bg-studio-obsidian transition-transform group-hover:scale-95 shadow-studio-tight">
              <img
                src="/logo.png"
                alt="ThirteenLabs 13 Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-sans text-sm font-semibold tracking-tight text-studio-obsidian">
                ThirteenLabs
              </span>
              <span className="text-[10px] text-studio-muted transition-colors group-hover:text-studio-obsidian">
                by <span className="font-mono font-medium text-studio-subtle">aurasqlm</span>
              </span>
            </div>
          </Link>
          <div className="hidden h-4 w-[1px] bg-studio-border md:block" />
          <span className="hidden rounded-full border border-studio-border bg-studio-white px-2 py-0.5 text-[10px] font-medium text-studio-muted md:inline-block">
            thirteenlabs.bond
          </span>
        </div>

        {/* The Strict 2 Primary Nav Links: Gen & Help */}
        <nav className="flex items-center space-x-1 rounded-full border border-studio-border bg-studio-white p-1 shadow-studio-tight">
          <Link
            href="/gen"
            className={`flex items-center space-x-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              isGen
                ? 'bg-studio-obsidian text-studio-white shadow-studio-btn'
                : 'text-studio-muted hover:bg-studio-hover hover:text-studio-obsidian'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 stroke-[1.5]" />
            <span>Gen</span>
          </Link>

          <Link
            href="/help"
            className={`flex items-center space-x-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
              isHelp
                ? 'bg-studio-obsidian text-studio-white shadow-studio-btn'
                : 'text-studio-muted hover:bg-studio-hover hover:text-studio-obsidian'
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5 stroke-[1.5]" />
            <span>Help</span>
          </Link>
        </nav>

        {/* Global Shortcut Pill & GitHub Link */}
        <div className="flex items-center space-x-2">
          {/* Global Shortcut Trigger Pill */}
          <button
            onClick={onOpenShortcuts}
            title="Keyboard shortcuts (Ctrl + ?)"
            className="flex items-center space-x-1.5 rounded-md border border-studio-border bg-studio-white px-2.5 py-1 text-xs text-studio-muted transition-all hover:border-studio-borderActive hover:bg-studio-hover hover:text-studio-obsidian active:scale-[0.98]"
          >
            <Command className="h-3 w-3 stroke-[1.5]" />
            <span className="font-mono text-[11px]">Ctrl + ?</span>
          </button>

          {/* GitHub Open Source Repository */}
          <a
            href="https://github.com/aurasqlm/thirteenlabs"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Source on GitHub (aurasqlm/thirteenlabs)"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-studio-border bg-studio-white text-studio-muted transition-all hover:border-studio-borderActive hover:bg-studio-hover hover:text-studio-obsidian active:scale-[0.98]"
          >
            <GitBranch className="h-3.5 w-3.5 stroke-[1.5]" />
          </a>
        </div>
      </div>
    </header>
  );
}
