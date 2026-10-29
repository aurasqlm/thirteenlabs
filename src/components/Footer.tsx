import React from 'react';
import Link from 'next/link';
import { GitBranch, Heart, Globe, Terminal, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-studio-border bg-studio-porcelain py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Brand & Attribution */}
          <div className="flex flex-col items-center md:items-start space-y-1">
            <div className="flex items-center space-x-2">
              <div className="flex h-5 w-5 items-center justify-center overflow-hidden rounded border border-studio-border bg-studio-obsidian">
                <img
                  src="/logo.png"
                  alt="ThirteenLabs 13 Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-sans text-sm font-semibold tracking-tight text-studio-obsidian">
                ThirteenLabs
              </span>
              <span className="rounded-full border border-studio-border bg-studio-white px-2 py-0.5 font-mono text-[10px] text-studio-muted">
                v1.0.0 Open Source
              </span>
            </div>
            <p className="text-xs text-studio-muted">
              Architected & engineered by{' '}
              <a
                href="https://github.com/aurasqlm"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-studio-obsidian underline decoration-studio-border hover:decoration-studio-obsidian transition-colors"
              >
                aurasqlm
              </a>
              . Free high-fidelity voice synthesis without corporate API limits.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex items-center space-x-4 text-xs text-studio-muted">
            <Link href="/gen" className="hover:text-studio-obsidian transition-colors">
              Gen Studio
            </Link>
            <span className="text-studio-border">•</span>
            <Link href="/help" className="hover:text-studio-obsidian transition-colors">
              Help Directory & Docs
            </Link>
            <span className="text-studio-border">•</span>
            <a
              href="https://github.com/aurasqlm/thirteenlabs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:text-studio-obsidian transition-colors"
            >
              <GitBranch className="h-3 w-3 stroke-[1.5]" />
              <span>GitHub</span>
            </a>
            <span className="text-studio-border">•</span>
            <span className="font-mono text-[11px] text-studio-subtle">
              thirteenlabs.bond
            </span>
          </div>
        </div>

        {/* Hairline sub-bar */}
        <div className="mt-6 flex flex-col items-center justify-between border-t border-studio-borderSoft pt-4 text-[11px] text-studio-muted sm:flex-row">
          <div className="flex items-center space-x-1">
            <ShieldCheck className="h-3.5 w-3.5 stroke-[1.5] text-emerald-600" />
            <span>Zero telemetry • Client-side audio rendering • Free neural aggregation</span>
          </div>
          <div className="mt-2 font-mono sm:mt-0">
            Deployed via Cloudflare Wrangler & Next.js App Router
          </div>
        </div>
      </div>
    </footer>
  );
}
