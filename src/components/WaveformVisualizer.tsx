'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Square, RotateCcw, Download, Volume2, VolumeX, ChevronDown, Check } from 'lucide-react';
import { AudioFormat } from '@/types';
import { triggerDownload } from '@/lib/audioEngine';

interface WaveformVisualizerProps {
  audioUrl: string | null;
  selectedFormat: AudioFormat;
  onChangeFormat: (format: AudioFormat) => void;
  onDownload: () => void;
  isLoading: boolean;
  onStopAll?: () => void;
}

export default function WaveformVisualizer({
  audioUrl,
  selectedFormat,
  onChangeFormat,
  onDownload,
  isLoading,
  onStopAll,
}: WaveformVisualizerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [volume, setVolume] = useState(1.0); // 100% full volume
  const [isFormatOpen, setIsFormatOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const formatDropdownRef = useRef<HTMLDivElement>(null);

  // Close format dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (formatDropdownRef.current && !formatDropdownRef.current.contains(e.target as Node)) {
        setIsFormatOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync audio element and auto-play on new generation
  useEffect(() => {
    if (!audioUrl) return;

    // Stop any existing speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    audio.volume = Math.min(1.0, volume);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setDuration(audio.duration || 3);
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    // Auto-play the newly generated voice
    audio.play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.warn('Autoplay prevented by browser policy, user can press play', err);
        setIsPlaying(false);
      });

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [audioUrl]);

  // Handle play/pause
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.playbackRate = playbackSpeed;
      audioRef.current.volume = Math.min(1.0, volume);
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  // Immediate STOP button (stops both Audio element and Web Speech API synthesis)
  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentTime(0);
    if (onStopAll) onStopAll();
  };

  // Change speed
  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // Change volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = Math.min(1.0, newVol);
    }
  };

  // Handle scrubber
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Draw real-time aesthetic waveform bars
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let progress = duration > 0 ? currentTime / duration : 0;
    const barCount = 64;
    const width = canvas.width;
    const height = canvas.height;
    const barWidth = width / barCount - 2;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 2);
        const barProgress = i / barCount;
        const isActive = barProgress <= progress;

        const sineWave = Math.sin(i * 0.25 + (isPlaying ? Date.now() * 0.005 : 0));
        const pseudoRandom = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
        const barHeight = Math.max(4, (sineWave * 0.3 + pseudoRandom * 0.7) * (height * 0.75));
        const y = (height - barHeight) / 2;

        ctx.fillStyle = isActive ? '#09090B' : '#E4E4E7';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      if (isPlaying) {
        animationFrameRef.current = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, currentTime, duration]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const formats: { id: AudioFormat; label: string; desc: string }[] = [
    { id: 'mp3', label: 'MP3 (MPEG-3)', desc: 'Standard compressed streaming audio' },
    { id: 'wav', label: 'WAV (Lossless 48kHz)', desc: 'Uncompressed broadcast studio audio' },
    { id: 'flac', label: 'FLAC (Lossless)', desc: 'High-fidelity lossless compression' },
    { id: 'ogg', label: 'OGG (Vorbis)', desc: 'Open web & gaming audio format' },
    { id: 'aac', label: 'AAC (Apple / Web)', desc: 'High-efficiency advanced audio' },
  ];

  return (
    <div className="w-full rounded-xl border border-studio-border bg-studio-white p-4 shadow-studio-tight">
      {/* Waveform Canvas */}
      <div className="relative mb-3 flex h-16 w-full items-center justify-center overflow-hidden rounded-lg border border-studio-borderSoft bg-studio-porcelain px-2">
        <canvas
          ref={canvasRef}
          width={640}
          height={64}
          className="h-full w-full"
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-studio-white/80 backdrop-blur-xs">
            <span className="font-mono text-xs text-studio-obsidian animate-pulse font-medium">
              Synthesizing acoustic wave & audio stream...
            </span>
          </div>
        )}
      </div>

      {/* Scrubber & Time */}
      <div className="mb-3 flex items-center space-x-3">
        <span className="font-mono text-[11px] text-studio-muted">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min="0"
          max={duration || 1}
          step="0.01"
          value={currentTime}
          onChange={handleSeek}
          className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-studio-border accent-studio-obsidian transition-colors"
        />
        <span className="font-mono text-[11px] text-studio-muted">
          {formatTime(duration)}
        </span>
      </div>

      {/* Control Deck: Play, Stop, Speed, Volume Boost, Format, Download */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-studio-borderSoft">
        {/* Left: Playback controls, Stop button, Volume & Speed */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Main Play/Pause Button */}
          <button
            onClick={togglePlay}
            disabled={!audioUrl || isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-studio-obsidian text-studio-white shadow-studio-btn transition-all duration-100 ease-studio-squash hover:-translate-y-0.5 hover:bg-studio-obsidianHover hover:shadow-studio-hover active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none"
            title={isPlaying ? 'Pause (Ctrl + Space)' : 'Play (Ctrl + Space)'}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 stroke-[2]" />
            ) : (
              <Play className="h-4 w-4 stroke-[2] ml-0.5" />
            )}
          </button>

          {/* STOP BUTTON: Stops all audio and synthesis immediately */}
          <button
            onClick={handleStop}
            className="flex h-9 items-center space-x-1.5 rounded-full border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 active:scale-95"
            title="Stop playback immediately"
          >
            <Square className="h-3 w-3 fill-current" />
            <span>Stop</span>
          </button>

          {/* Replay Button */}
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
                audioRef.current.play();
                setIsPlaying(true);
              }
            }}
            disabled={!audioUrl}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-studio-border bg-studio-white text-studio-muted transition-colors hover:bg-studio-hover hover:text-studio-obsidian disabled:opacity-40"
            title="Replay from start"
          >
            <RotateCcw className="h-3.5 w-3.5 stroke-[1.5]" />
          </button>

          {/* Volume Gain Control */}
          <div className="flex items-center space-x-1.5 pl-2 border-l border-studio-borderSoft">
            <Volume2 className="h-3.5 w-3.5 text-studio-muted stroke-[1.5]" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="h-1 w-16 cursor-pointer appearance-none rounded-full bg-studio-border accent-studio-obsidian"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
            <span className="font-mono text-[10px] text-studio-muted">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Speed Multiplier Pills */}
          <div className="flex items-center space-x-1 pl-2 border-l border-studio-borderSoft">
            {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => changeSpeed(s)}
                className={`rounded-full px-2 py-0.5 font-mono text-[10px] transition-all duration-100 ${
                  playbackSpeed === s
                    ? 'border border-studio-obsidian bg-studio-obsidian text-studio-white'
                    : 'border border-studio-border bg-studio-white text-studio-muted hover:bg-studio-hover hover:text-studio-obsidian'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Right: Audio Format Selector & Download */}
        <div className="flex items-center space-x-2">
          {/* Format Selector Dropdown */}
          <div ref={formatDropdownRef} className="relative">
            <button
              onClick={() => setIsFormatOpen(!isFormatOpen)}
              className="flex items-center space-x-1.5 rounded-lg border border-studio-border bg-studio-white px-2.5 py-1.5 text-xs font-mono uppercase text-studio-obsidian transition-colors hover:border-studio-borderActive hover:bg-studio-hover"
            >
              <span>{selectedFormat}</span>
              <ChevronDown className="h-3 w-3 text-studio-muted stroke-[1.5]" />
            </button>

            {isFormatOpen && (
              <div className="absolute right-0 bottom-full mb-2 z-50 w-52 rounded-xl border border-studio-border bg-studio-white p-1.5 shadow-studio-menu">
                <div className="px-2 py-1 text-[10px] font-mono uppercase text-studio-muted">
                  Export Audio Format
                </div>
                {formats.map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => {
                      onChangeFormat(fmt.id);
                      setIsFormatOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                      selectedFormat === fmt.id
                        ? 'bg-studio-hover text-studio-obsidian font-medium'
                        : 'text-studio-muted hover:bg-studio-hover hover:text-studio-obsidian'
                    }`}
                  >
                    <div>
                      <span className="font-mono text-xs">{fmt.label}</span>
                    </div>
                    {selectedFormat === fmt.id && (
                      <Check className="h-3.5 w-3.5 text-studio-obsidian stroke-[2]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Download Action Trigger */}
          <button
            onClick={onDownload}
            disabled={!audioUrl || isLoading}
            className="flex items-center space-x-1.5 rounded-lg border border-studio-obsidian bg-studio-obsidian px-3.5 py-1.5 text-xs font-medium text-studio-white shadow-studio-btn transition-all duration-100 ease-studio-squash hover:-translate-y-0.5 hover:bg-studio-obsidianHover hover:shadow-studio-hover active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none"
            title="Download audio (Ctrl + D)"
          >
            <Download className="h-3.5 w-3.5 stroke-[1.5]" />
            <span className="font-mono uppercase text-[11px]">Download .{selectedFormat}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
