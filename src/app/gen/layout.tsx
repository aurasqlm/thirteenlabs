import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Voice Studio Generator',
  description:
    'Generate high-fidelity AI voiceovers with 60+ free neural TTS models, 1,000+ vocal emotion tags, and lossless audio export by aurasqlm.',
  alternates: {
    canonical: '/gen',
  },
  openGraph: {
    title: 'Voice Studio Generator | ThirteenLabs',
    description: '100% free speech synthesis with 1,000+ emotion extensions and lossless audio export.',
    url: 'https://thirteenlabs.bond/gen',
  },
};

export default function GenLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
