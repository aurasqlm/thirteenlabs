export type AudioFormat = 'mp3' | 'wav' | 'ogg' | 'flac' | 'aac';

export interface VoiceModel {
  id: string;
  name: string;
  provider: string;
  gender: 'Female' | 'Male' | 'Neutral';
  ageGroup?: 'Child' | 'Young' | 'Mature' | 'Senior';
  locale: string;
  language: string;
  accent?: string;
  tag: string;
  sampleText: string;
  quality: 'Ultra' | 'Studio' | 'Neural' | 'Standard';
  previewUrl?: string;
}

export interface VoiceProvider {
  id: string;
  name: string;
  badge: string;
  description: string;
  voiceCount: number;
  freeTier: boolean;
  category: 'Edge Neural' | 'Browser Native' | 'Open Source' | 'Cloud Neural' | 'Community Engine';
  latency: 'Ultra-low (<100ms)' | 'Fast (150-300ms)' | 'Standard (400ms)';
}

export interface EmotionTag {
  id: string;
  code: string;
  label: string;
  category: 'Reactions' | 'Breathing & Human' | 'Emotional States' | 'Acoustic Timing' | 'Foley & Stems' | 'Voice Modulation' | 'Character Archetypes';
  description: string;
  prosodyEffect?: {
    pitch?: string;
    rate?: string;
    volume?: string;
  };
}

export interface GeneratedAudioItem {
  id: string;
  text: string;
  voice: VoiceModel;
  provider: string;
  format: AudioFormat;
  audioUrl: string;
  durationSeconds: number;
  timestamp: number;
  settings: {
    speed: number;
    pitch: number;
    stability: number;
    similarity: number;
  };
}

export interface ScriptPreset {
  id: string;
  title: string;
  category: string;
  text: string;
  suggestedVoiceId: string;
}
