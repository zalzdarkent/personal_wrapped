import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ThemeConfig, WrappedData } from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Sparkles,
  Bot,
  Video,
  FileVideo,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { trackEvent } from '../utils/analytics';

interface VideoRecapPlayerProps {
  data: WrappedData;
  theme: ThemeConfig;
  onOpenShareModal: () => void;
}

interface GeminiNarration {
  title: string;
  hook: string;
  scenes: Array<{
    time: string;
    title: string;
    voiceover: string;
    visualDescription: string;
  }>;
  punchline: string;
  fullScript: string;
}

export const VideoRecapPlayer: React.FC<VideoRecapPlayerProps> = ({
  data,
  theme,
  onOpenShareModal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordProgress, setRecordProgress] = useState<number>(0);
  const [narration, setNarration] = useState<GeminiNarration | null>(null);
  const [isLoadingScript, setIsLoadingScript] = useState<boolean>(true);
  const [showStoryboard, setShowStoryboard] = useState<boolean>(false);

  const duration = 20; // 20-second dynamic vertical video
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const synthIntervalRef = useRef<number | null>(null);

  // 1. Fetch AI Director Script from Gemini
  useEffect(() => {
    let isMounted = true;
    const fetchScript = async () => {
      setIsLoadingScript(true);
      try {
        const res = await fetch('/api/gemini/narration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success && isMounted) {
            setNarration(json.narration);
          }
        }
      } catch (err) {
        console.warn('Could not fetch Gemini narration:', err);
      } finally {
        if (isMounted) setIsLoadingScript(false);
      }
    };

    fetchScript();
    return () => {
      isMounted = false;
    };
  }, [data]);

  // 2. Synthesize audio background beat
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
        audioDestinationRef.current = audioCtxRef.current.createMediaStreamDestination();
      }
    }
  }, []);

  const playSynthesizerBeat = useCallback((freq: number, dur: number) => {
    if (isMuted || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + dur);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      if (audioDestinationRef.current) {
        gain.connect(audioDestinationRef.current);
      }

      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch {
      // Audio autoplay policy fallback
    }
  }, [isMuted]);

  // Speech voiceover
  const speakCurrentScene = useCallback((text: string) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.15; // fast, high-energy
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  // 3. Render Canvas Frame at 1080x1920
  const renderFrame = useCallback((t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 1080;
    const h = 1920;

    // Background base
    ctx.fillStyle = theme.cardBg;
    ctx.fillRect(0, 0, w, h);

    // Frame margin
    const m = 48;
    const fw = w - m * 2;
    const fh = h - m * 2;

    // Outer thick border
    ctx.fillStyle = '#000000';
    ctx.fillRect(m + 16, m + 16, fw, fh);
    ctx.fillStyle = theme.cardBg;
    ctx.fillRect(m, m, fw, fh);
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(m, m, fw, fh);

    // Header Bar
    ctx.fillStyle = '#000000';
    ctx.fillRect(m, m, fw, 120);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 36px "Space Grotesk", sans-serif';
    ctx.fillText('★ 2026 VIDEO RECAP', m + 40, m + 75);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFE500';
    ctx.font = 'bold 32px "JetBrains Mono", monospace';
    ctx.fillText(`${data.userName.toUpperCase()}`, m + fw - 40, m + 75);
    ctx.textAlign = 'left';

    // Top Progress Bar
    const progressPct = Math.min(1, t / duration);
    ctx.fillStyle = '#FFE500';
    ctx.fillRect(m, m + 120, fw * progressPct, 12);

    // ==========================================
    // SCENE LOGIC (4 PHASES)
    // ==========================================
    // Phase 1: 0 - 5s (INTRO HOOK)
    if (t < 5) {
      const sceneProgress = t / 5;
      const pulseScale = 1 + Math.sin(t * 8) * 0.02;

      ctx.save();
      ctx.translate(w / 2, h / 2 - 100);
      ctx.scale(pulseScale, pulseScale);

      // Kicker
      ctx.fillStyle = '#000000';
      ctx.fillRect(-fw / 2 + 40, -420, 480, 56);
      ctx.fillStyle = '#D2FF3A';
      ctx.font = 'bold 28px "JetBrains Mono", monospace';
      ctx.fillText(`DOMAIN: ${data.category.toUpperCase()}`, -fw / 2 + 60, -382);

      // Big Title
      ctx.fillStyle = '#000000';
      ctx.font = '900 88px "Space Grotesk", sans-serif';
      ctx.fillText('2026 WAS', -fw / 2 + 40, -250);
      ctx.fillText('AN ABSOLUTE', -fw / 2 + 40, -150);

      ctx.fillStyle = '#000000';
      ctx.fillRect(-fw / 2 + 40, -110, 680, 110);
      ctx.fillStyle = '#D2FF3A';
      ctx.fillText('MASTERCLASS', -fw / 2 + 60, -25);

      // Central Graphic Box
      ctx.fillStyle = '#000000';
      ctx.fillRect(-fw / 2 + 40, 40, fw - 80, 420);

      ctx.fillStyle = '#FFE500';
      ctx.font = 'bold 28px "JetBrains Mono", monospace';
      ctx.fillText('GEMINI AI NARRATION // HOOK', -fw / 2 + 70, 110);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '500 36px "Space Grotesk", sans-serif';
      const hookText = narration?.hook || `Stop scrolling! ${data.userName}'s 2026 dossier is live.`;
      ctx.fillText(hookText.slice(0, 42), -fw / 2 + 70, 180);
      if (hookText.length > 42) {
        ctx.fillText(hookText.slice(42, 85), -fw / 2 + 70, 230);
      }

      ctx.fillStyle = '#00F0FF';
      ctx.font = 'bold 32px "JetBrains Mono", monospace';
      ctx.fillText(`@${data.handle}`, -fw / 2 + 70, 360);

      ctx.restore();
    }
    // Phase 2: 5 - 10s (KEYSTONE METRIC)
    else if (t < 10) {
      const sceneProgress = (t - 5) / 5;
      const countUp = Math.round(data.primaryMetric.value * Math.min(1, sceneProgress * 1.5));

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 36px "JetBrains Mono", monospace';
      ctx.fillText('[ 01 // KEYSTONE MILESTONES ]', m + 40, m + 220);

      // Keystone Box
      ctx.fillStyle = '#000000';
      ctx.fillRect(m + 40, m + 260, fw - 80, 520);

      ctx.fillStyle = '#FFE500';
      ctx.font = 'bold 32px "JetBrains Mono", monospace';
      ctx.fillText(data.primaryMetric.label.toUpperCase(), m + 70, m + 340);

      // Giant Counter
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 150px "Space Grotesk", sans-serif';
      ctx.fillText(`${countUp.toLocaleString()}`, m + 70, m + 520);

      ctx.fillStyle = '#D2FF3A';
      ctx.font = 'bold 48px "Space Grotesk", sans-serif';
      ctx.fillText(`${data.primaryMetric.unit.toUpperCase()}`, m + 70, m + 610);

      // Percentile Badge
      ctx.fillStyle = '#000000';
      ctx.fillRect(m + 40, m + 820, fw - 80, 220);
      ctx.fillStyle = '#D2FF3A';
      ctx.font = '900 68px "Space Grotesk", sans-serif';
      ctx.fillText(`TOP ${100 - data.percentileRank}% GLOBALLY`, m + 70, m + 930);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px "JetBrains Mono", monospace';
      ctx.fillText(`UNBROKEN STREAK: ${data.streak.days} DAYS`, m + 70, m + 990);

      // 2 Sub-metrics
      const boxW = (fw - 100) / 2;
      data.secondaryMetrics.slice(0, 2).forEach((sec, idx) => {
        const x = m + 40 + idx * (boxW + 20);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(x, m + 1080, boxW, 220);
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(x, m + 1080, boxW, 220);

        ctx.fillStyle = '#000000';
        ctx.font = '900 58px "Space Grotesk", sans-serif';
        ctx.fillText(String(sec.value), x + 30, m + 1180);

        ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#444444';
        ctx.fillText(sec.label.toUpperCase(), x + 30, m + 1240);
      });
    }
    // Phase 3: 10 - 15s (TOP OBSESSIONS)
    else if (t < 15) {
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 36px "JetBrains Mono", monospace';
      ctx.fillText('[ 02 // TOP 5 OBSESSIONS ]', m + 40, m + 220);

      ctx.font = '900 68px "Space Grotesk", sans-serif';
      ctx.fillText('HEAVY ROTATION', m + 40, m + 300);

      // Render items sliding in
      data.topItems.slice(0, 5).forEach((item, idx) => {
        const itemY = m + 340 + idx * 220;
        const itemDelay = 10 + idx * 0.4;
        const isShown = t >= itemDelay;
        const offsetX = isShown ? 0 : 200;

        ctx.fillStyle = idx === 0 ? '#FFE500' : '#FFFFFF';
        ctx.fillRect(m + 40 + offsetX, itemY, fw - 80, 190);
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(m + 40 + offsetX, itemY, fw - 80, 190);

        // Rank
        ctx.fillStyle = '#000000';
        ctx.fillRect(m + 60 + offsetX, itemY + 25, 75, 75);
        ctx.fillStyle = idx === 0 ? '#FFE500' : '#FFFFFF';
        ctx.font = '900 40px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`0${idx + 1}`, m + 97 + offsetX, itemY + 77);
        ctx.textAlign = 'left';

        // Title
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 38px "Space Grotesk", sans-serif';
        ctx.fillText(item.name.slice(0, 24), m + 160 + offsetX, itemY + 75);

        // Subtitle
        ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#555555';
        ctx.fillText((item.subtitle || '').slice(0, 32), m + 160 + offsetX, itemY + 125);

        // Count tag
        ctx.fillStyle = '#000000';
        ctx.fillRect(m + fw - 200 + offsetX, itemY + 30, 140, 50);
        ctx.fillStyle = '#D2FF3A';
        ctx.font = 'bold 22px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(String(item.count || '').slice(0, 10), m + fw - 130 + offsetX, itemY + 63);
        ctx.textAlign = 'left';
      });
    }
    // Phase 4: 15 - 20s (ARCHETYPE REVEAL & OUTRO)
    else {
      const sceneProgress = (t - 15) / 5;
      const stampScale = Math.min(1, 0.4 + sceneProgress * 1.5);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 36px "JetBrains Mono", monospace';
      ctx.fillText('[ 03 // 2026 IDENTITY CROWN ]', m + 40, m + 220);

      // Giant Archetype Box
      ctx.fillStyle = '#000000';
      ctx.fillRect(m + 40, m + 260, fw - 80, 840);

      ctx.fillStyle = '#FFE500';
      ctx.font = 'bold 32px "JetBrains Mono", monospace';
      ctx.fillText(`★ OFFICIAL RECAP ARCHETYPE`, m + 80, m + 360);

      ctx.fillStyle = '#D2FF3A';
      ctx.font = '900 76px "Space Grotesk", sans-serif';
      ctx.fillText(data.archetype.title, m + 80, m + 480);

      ctx.fillStyle = '#FFE500';
      ctx.font = 'bold 36px "JetBrains Mono", monospace';
      ctx.fillText(`"${data.archetype.tagline}"`, m + 80, m + 570);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '500 32px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(data.archetype.description.slice(0, 48), m + 80, m + 670);
      if (data.archetype.description.length > 48) {
        ctx.fillText(data.archetype.description.slice(48, 100), m + 80, m + 720);
      }

      // Quirk / Highlight
      if (data.failOrQuirk) {
        ctx.fillStyle = '#FF5A36';
        ctx.fillRect(m + 80, m + 800, fw - 160, 180);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 28px "JetBrains Mono", monospace';
        ctx.fillText(data.failOrQuirk.label.toUpperCase(), m + 110, m + 860);
        ctx.font = '600 30px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(data.failOrQuirk.description.slice(0, 36), m + 110, m + 920);
      }

      // Closing Sticker
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(m + 40, m + 1140, fw - 80, 260);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(m + 40, m + 1140, fw - 80, 260);

      ctx.fillStyle = '#000000';
      ctx.font = '900 56px "Space Grotesk", sans-serif';
      ctx.fillText(`${data.userName.toUpperCase()}`, m + 80, m + 1240);

      ctx.font = 'bold 32px "JetBrains Mono", monospace';
      ctx.fillStyle = '#444444';
      ctx.fillText(`SEE YOU IN 2027 · ${data.category.toUpperCase()}`, m + 80, m + 1320);
    }

    // ==========================================
    // SYNCHRONIZED CAPTION BANNER AT BOTTOM
    // ==========================================
    const captionY = m + fh - 240;
    ctx.fillStyle = '#000000';
    ctx.fillRect(m + 40, captionY, fw - 80, 120);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FFE500';
    ctx.strokeRect(m + 40, captionY, fw - 80, 120);

    let currentSubtitle = narration?.hook || `Inspecting ${data.userName}'s 2026 Wrapped...`;
    if (t >= 5 && t < 10) {
      currentSubtitle = narration?.scenes?.[1]?.voiceover || `Clocking in at ${data.primaryMetric.value.toLocaleString()} ${data.primaryMetric.unit}!`;
    } else if (t >= 10 && t < 15) {
      currentSubtitle = narration?.scenes?.[2]?.voiceover || `Heavy rotation on repeat all year long.`;
    } else if (t >= 15) {
      currentSubtitle = narration?.scenes?.[3]?.voiceover || `Officially certified as ${data.archetype.title}.`;
    }

    ctx.fillStyle = '#FFE500';
    ctx.font = 'bold 22px "JetBrains Mono", monospace';
    ctx.fillText('▶ GEMINI AI CAPTION:', m + 60, captionY + 40);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 26px "Space Grotesk", sans-serif';
    ctx.fillText(currentSubtitle.slice(0, 52), m + 60, captionY + 85);

    // Bottom Watermark
    const footerY = m + fh - 80;
    ctx.fillStyle = '#000000';
    ctx.fillRect(m, footerY, fw, 80);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px "Space Grotesk", sans-serif';
    ctx.fillText(`PERSONAL YEAR WRAPPED 2026`, m + 40, footerY + 50);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#FFE500';
    ctx.font = 'bold 24px "JetBrains Mono", monospace';
    ctx.fillText('personalwrapped.app', m + fw - 40, footerY + 50);
    ctx.textAlign = 'left';
  }, [data, theme, narration, duration]);

  // Main Animation Loop
  useEffect(() => {
    let lastBeatSecond = -1;

    const tick = () => {
      if (isPlaying) {
        const now = Date.now();
        const delta = (now - lastTimeRef.current) / 1000;
        lastTimeRef.current = now;

        setCurrentTime((prev) => {
          const next = prev + delta;
          if (next >= duration) {
            // Loop or restart
            return 0;
          }

          // Trigger audio beat every second
          const sec = Math.floor(next);
          if (sec !== lastBeatSecond) {
            lastBeatSecond = sec;
            const freq = sec % 2 === 0 ? 120 : 180;
            playSynthesizerBeat(freq, 0.15);

            // Trigger speech for scene switches
            if (sec === 0 && narration?.hook) {
              speakCurrentScene(narration.hook);
            } else if (sec === 5 && narration?.scenes?.[1]?.voiceover) {
              speakCurrentScene(narration.scenes[1].voiceover);
            } else if (sec === 10 && narration?.scenes?.[2]?.voiceover) {
              speakCurrentScene(narration.scenes[2].voiceover);
            } else if (sec === 15 && narration?.scenes?.[3]?.voiceover) {
              speakCurrentScene(narration.scenes[3].voiceover);
            }
          }

          return next;
        });
      } else {
        lastTimeRef.current = Date.now();
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    lastTimeRef.current = Date.now();
    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, duration, narration, playSynthesizerBeat, speakCurrentScene]);

  // Render on time update
  useEffect(() => {
    renderFrame(currentTime);
  }, [currentTime, renderFrame]);

  const handleTogglePlay = () => {
    initAudio();
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    initAudio();
    setCurrentTime(0);
    setIsPlaying(true);
    if (narration?.hook) speakCurrentScene(narration.hook);
  };

  // 4. Record Real 9:16 Video (WebM / MP4) via MediaRecorder
  const handleDownloadVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    initAudio();
    setIsRecording(true);
    setIsPlaying(false);
    setRecordProgress(0);
    trackEvent('export_video_started', { category: data.category });

    try {
      const stream = canvas.captureStream(30);

      // Add audio track if audio destination exists
      if (audioDestinationRef.current && audioDestinationRef.current.stream.getAudioTracks().length > 0) {
        stream.addTrack(audioDestinationRef.current.stream.getAudioTracks()[0]);
      }

      // Check supported MIME types
      let mimeType = 'video/webm;codecs=vp9';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 4000000, // high 4Mbps bitrate
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const videoBlob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(videoBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.handle.replace('@', '') || 'user'}_${data.category}_wrapped_2026.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setIsRecording(false);
        setIsPlaying(true);
        trackEvent('export_video_completed');
      };

      recorder.start();

      // Render all frames sequentially
      const totalFrames = 30 * duration; // 600 frames
      for (let f = 0; f < totalFrames; f++) {
        const recordTime = (f / 30);
        renderFrame(recordTime);
        setRecordProgress(Math.round((f / totalFrames) * 100));
        await new Promise((r) => setTimeout(r, 16)); // ~60fps step
      }

      recorder.stop();
    } catch (err) {
      console.error('Video recording error:', err);
      setIsRecording(false);
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start justify-center max-w-5xl mx-auto py-2">
      {/* 9:16 Video Player Stage */}
      <div className="w-full max-w-[380px] sm:max-w-[420px] mx-auto flex flex-col items-center">
        {/* Canvas Video Display */}
        <div className="w-full aspect-story border-4 border-black brutal-shadow-xl relative overflow-hidden bg-black">
          <canvas
            ref={canvasRef}
            width={1080}
            height={1920}
            className="w-full h-full object-cover select-none cursor-pointer"
            onClick={handleTogglePlay}
          />

          {/* Recording Overlay */}
          {isRecording && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center text-white z-40 space-y-3 font-mono-code">
              <FileVideo className="w-12 h-12 text-[#FFE500] animate-bounce" />
              <div className="font-display font-black text-xl text-white">
                RENDERING 9:16 VIDEO...
              </div>
              <div className="w-48 h-3 border-2 border-[#FFE500] bg-black p-0.5">
                <div
                  className="h-full bg-[#D2FF3A] transition-all"
                  style={{ width: `${recordProgress}%` }}
                />
              </div>
              <div className="text-xs text-neutral-400">
                Encoding 600 frames with synced captions & audio ({recordProgress}%)
              </div>
            </div>
          )}

          {/* Floating Play Indicator when paused */}
          {!isPlaying && !isRecording && (
            <div
              onClick={handleTogglePlay}
              className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer pointer-events-auto"
            >
              <div className="w-16 h-16 bg-[#FFE500] border-3 border-black brutal-shadow flex items-center justify-center text-black">
                <Play className="w-8 h-8 fill-black translate-x-0.5" />
              </div>
            </div>
          )}
        </div>

        {/* Video Controls Bar */}
        <div className="w-full mt-4 p-3 bg-white border-3 border-black brutal-shadow space-y-3">
          {/* Timeline Scrubber */}
          <div className="flex items-center gap-2 font-mono-code text-xs font-bold">
            <span className="text-neutral-700 w-10">
              0:{String(Math.floor(currentTime)).padStart(2, '0')}
            </span>
            <input
              type="range"
              min={0}
              max={duration}
              step={0.1}
              value={currentTime}
              onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
              className="flex-1 accent-black cursor-pointer h-2 bg-neutral-200 border border-black"
            />
            <span className="text-neutral-700 w-10 text-right">
              0:20
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleTogglePlay}
                className="p-2 border-2 border-black bg-[#FFE500] text-black brutal-btn"
                title={isPlaying ? 'Pause Video' : 'Play Video'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-black" />}
              </button>

              <button
                onClick={handleRestart}
                className="p-2 border-2 border-black bg-white hover:bg-neutral-100 text-black brutal-btn"
                title="Restart Video"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 border-2 border-black bg-white hover:bg-neutral-100 text-black brutal-btn"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-600" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            <button
              onClick={handleDownloadVideo}
              disabled={isRecording}
              className="px-4 py-2 bg-black text-[#D2FF3A] border-2 border-black font-display font-black text-xs uppercase tracking-wider brutal-btn flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>DOWNLOAD 9:16 VIDEO</span>
            </button>
          </div>
        </div>
      </div>

      {/* Right Column: Gemini AI Video Director Dossier */}
      <div className="flex-1 w-full space-y-6">
        {/* Gemini Director Card */}
        <div className="p-6 bg-white border-4 border-black brutal-shadow space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black text-[#FFE500] flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg text-black">
                  GEMINI AI VIDEO DIRECTOR
                </h3>
                <div className="text-[10px] font-mono-code text-neutral-600">
                  Model: gemini-3.8-flash · TikTok/Reels Video Engine
                </div>
              </div>
            </div>

            <span className="px-2 py-0.5 bg-[#D2FF3A] border border-black text-[10px] font-mono-code font-bold uppercase">
              ACTIVE
            </span>
          </div>

          {isLoadingScript ? (
            <div className="p-4 bg-neutral-50 border-2 border-black font-mono-code text-xs text-neutral-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-black animate-spin" />
              <span>Generating viral screenplay & voiceover from your metrics...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Screenplay summary */}
              <div className="p-3 bg-neutral-100 border-2 border-black space-y-1">
                <div className="font-mono-code text-[10px] uppercase text-neutral-600 font-bold">
                  DIRECTOR'S LOGLINE / HOOK
                </div>
                <div className="font-display font-black text-sm text-black">
                  "{narration?.hook}"
                </div>
              </div>

              {/* 4 Storyboard Scenes */}
              <div className="space-y-2">
                <div className="text-xs font-mono-code font-bold uppercase text-neutral-700">
                  4-Scene Video Timeline (20s)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(narration?.scenes || []).map((scene, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 border-2 border-black text-xs font-mono-code ${
                        currentTime >= idx * 5 && currentTime < (idx + 1) * 5
                          ? 'bg-[#FFE500] font-bold shadow-[2px_2px_0px_#000]'
                          : 'bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] opacity-75 mb-1">
                        <span>{scene.time}</span>
                        <span>{scene.title}</span>
                      </div>
                      <div className="line-clamp-2 text-neutral-900">
                        {scene.voiceover}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Social share & viral loop */}
          <div className="pt-2 border-t-2 border-black flex items-center justify-between">
            <span className="text-xs font-mono-code text-neutral-700">
              Format: <strong>9:16 Vertical Video (WebM/MP4)</strong>
            </span>
            <button
              onClick={onOpenShareModal}
              className="px-3.5 py-2 bg-black text-white font-display font-black text-xs uppercase brutal-btn flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-[#FFE500]" />
              SHARE LINK
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="p-5 bg-[#FFE500] border-4 border-black brutal-shadow space-y-3">
          <div className="font-display font-black text-base text-black flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-black" />
            READY FOR INSTAGRAM REELS & TIKTOK
          </div>
          <p className="text-xs text-neutral-800 leading-relaxed font-medium">
            This video is generated with 60fps kinetic motion, synchronized on-screen captions, and rhythmic audio beats. Download it directly to post to your Reels, TikTok, or WhatsApp Status!
          </p>
        </div>
      </div>
    </div>
  );
};
