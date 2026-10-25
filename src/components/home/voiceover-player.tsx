"use client";

import { useRef, useState } from "react";
import { Icon } from "../icons";

function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// One-tap player for the organisers' voiceover. Nothing downloads until the first play,
// which keeps the hero light on mobile data.
export function VoiceoverPlayer(voiceover: { src: string; title: string; duration: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      setStarted(true);
      void audio.play();
    } else {
      audio.pause();
    }
  }

  return (
    <div className="flex w-full max-w-[400px] items-center gap-3.5 rounded-full border border-white/20 bg-white/[0.07] py-2 pr-6 pl-2 backdrop-blur-sm">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause the organisers' message" : "Play the organisers' message"}
        className="flex size-12 flex-none cursor-pointer items-center justify-center rounded-full bg-white text-navy transition-transform duration-150 ease-out hover:scale-105 active:scale-95 motion-reduce:transition-none"
      >
        <Icon name={playing ? "pause" : "play"} size={20} strokeWidth={3} />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-[15px] font-semibold text-white">{voiceover.title}</span>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={current}
            disabled={!started}
            onChange={(e) => {
              const audio = audioRef.current;
              if (!audio) return;
              audio.currentTime = Number(e.target.value);
              setCurrent(audio.currentTime);
            }}
            aria-label="Seek"
            aria-valuetext={`${formatTime(current)} of ${formatTime(duration)}`}
            style={{ "--progress": `${duration ? (current / duration) * 100 : 0}%` } as React.CSSProperties}
            className="voiceover-range h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-[linear-gradient(to_right,var(--color-sun)_var(--progress),rgb(255_255_255/0.25)_var(--progress))] disabled:cursor-default"
          />
          <span className="flex-none text-[13px] text-haze tabular-nums">
            {started ? `${formatTime(current)} / ${formatTime(duration)}` : voiceover.duration}
          </span>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={voiceover.src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
      />
    </div>
  );
}
