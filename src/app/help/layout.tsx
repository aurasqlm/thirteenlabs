import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help & Documentation',
  description:
    'Complete guide to ThirteenLabs: 1,000+ emotion tags, 60+ neural TTS engine providers, keyboard shortcuts, and lossless audio exports by aurasqlm.',
  alternates: {
    canonical: '/help',
  },
  openGraph: {
    title: 'Help Directory & Voice Documentation | ThirteenLabs',
    description: 'Master 1,000+ emotion tags, 60+ TTS engines, and DSP audio settings.',
    url: 'https://thirteenlabs.bond/help',
  },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
