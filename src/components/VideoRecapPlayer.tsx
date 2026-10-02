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
  Share2,
  Crown,
  Zap,
  Eye,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { playAchievementSound } from '../utils/sound';
import {
  getSupportedNativeMp4MimeType,
  getSupportedWebmMimeType,
  convertWebmToMp4,
} from '../utils/videoExport';

interface VideoRecapPlayerProps {
  data: WrappedData;
  theme: ThemeConfig;
  isPremiumUnlocked?: boolean;
  onOpenUpgradeModal?: () => void;
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

// ==========================================
// KINETIC MOTION & EASING ENGINE
// ==========================================
const easeOutBack = (x: number, c1 = 1.70158): number => {
  const c3 = c1 + 1;
  const clamped = Math.max(0, Math.min(1, x));
  return 1 + c3 * Math.pow(clamped - 1, 3) + c1 * Math.pow(clamped - 1, 2);
};

const easeOutElastic = (x: number): number => {
  const clamped = Math.max(0, Math.min(1, x));
  if (clamped === 0) return 0;
  if (clamped === 1) return 1;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * clamped) * Math.sin((clamped * 10 - 0.75) * c4) + 1;
};

const easeOutExpo = (x: number): number => {
  const clamped = Math.max(0, Math.min(1, x));
  return clamped === 1 ? 1 : 1 - Math.pow(2, -10 * clamped);
};

const easeInOutCubic = (x: number): number => {
  const clamped = Math.max(0, Math.min(1, x));
  return clamped < 0.5
    ? 4 * clamped * clamped * clamped
    : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
};

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

// Helper to draw rounded rectangle safely across canvas versions
const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) => {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

export const VideoRecapPlayer: React.FC<VideoRecapPlayerProps> = ({
  data,
  theme,
  isPremiumUnlocked = false,
  onOpenUpgradeModal,
  onOpenShareModal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordProgress, setRecordProgress] = useState<number>(0);
  const [videoFormat, setVideoFormat] = useState<'mp4' | 'webm'>('mp4');
  const [recordPhase, setRecordPhase] = useState<'rendering' | 'converting'>('rendering');
  const [narration, setNarration] = useState<GeminiNarration | null>(null);
  const [isLoadingScript, setIsLoadingScript] = useState<boolean>(true);

  // VIP Pro Mode State: If unlocked, auto-on; otherwise user can toggle Preview Mode
  const [isProActive, setIsProActive] = useState<boolean>(isPremiumUnlocked);

  useEffect(() => {
    if (isPremiumUnlocked) {
      setIsProActive(true);
    }
  }, [isPremiumUnlocked]);

  const duration = 20; // 20-second dynamic vertical video
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

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

  const playSynthesizerBeat = useCallback(
    (freq: number, dur: number, isBassDrop = false) => {
      if (isMuted || !audioCtxRef.current) return;
      try {
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = isBassDrop ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(
          isBassDrop ? 25 : 30,
          ctx.currentTime + dur
        );

        const volume = isBassDrop ? 0.35 : 0.2;
        gain.gain.setValueAtTime(volume, ctx.currentTime);
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
    },
    [isMuted]
  );

  // Speech voiceover
  const speakCurrentScene = useCallback(
    (text: string) => {
      if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.18; // fast, high-energy
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    },
    [isMuted]
  );

  // ==========================================
  // 3. RENDER CANVAS FRAME AT 1080x1920 (60FPS)
  // ==========================================
  const renderFrame = useCallback(
    (t: number, forceProMode?: boolean) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const isPro = forceProMode !== undefined ? forceProMode : isProActive;
      const w = 1080;
      const h = 1920;

      // Base Margins
      const m = 48;
      const fw = w - m * 2;
      const fh = h - m * 2;

      // Camera Shake & Rhythm Punch
      const beatPhase = (t * 2) % 1; // 120 BPM
      const beatImpulse = Math.pow(1 - beatPhase, 4);

      // Impact shake on scene drops (0s, 5s, 10s, 15s)
      const sceneElapsed = t % 5;
      const sceneEntryImpact = Math.max(0, 1 - sceneElapsed / 0.4);
      const shakeX = Math.sin(t * 60) * sceneEntryImpact * (isPro ? 12 : 8);
      const shakeY = Math.cos(t * 45) * sceneEntryImpact * (isPro ? 10 : 6);

      // Camera Spring Scale
      const cameraScale =
        1.0 + beatImpulse * (isPro ? 0.022 : 0.012) + Math.sin(t * 1.5) * 0.006;

      ctx.save();
      // Apply camera transformation
      ctx.translate(w / 2 + shakeX, h / 2 + shakeY);
      ctx.scale(cameraScale, cameraScale);
      ctx.translate(-w / 2, -h / 2);

      // ----------------------------------------------------
      // BACKGROUND BASE
      // ----------------------------------------------------
      ctx.fillStyle = theme.cardBg;
      ctx.fillRect(0, 0, w, h);

      // Animated Cyber Grid / Dynamic Dots Background
      const gridOffset = (t * 40) % 80;
      ctx.strokeStyle = isPro ? 'rgba(255, 229, 0, 0.08)' : 'rgba(0, 0, 0, 0.04)';
      ctx.lineWidth = 2;
      for (let x = 0; x < w; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = gridOffset; y < h; y += 80) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // ----------------------------------------------------
      // PRO EXCLUSIVE: 3D ROTATING WIREFRAME HYPERCUBE / HALO
      // ----------------------------------------------------
      if (isPro) {
        ctx.save();
        ctx.translate(w / 2, h / 2);
        const rotX = t * 0.8;
        const rotY = t * 1.2;
        const cubeSize = 380;
        const nodes = [
          [-1, -1, -1],
          [1, -1, -1],
          [1, 1, -1],
          [-1, 1, -1],
          [-1, -1, 1],
          [1, -1, 1],
          [1, 1, 1],
          [-1, 1, 1],
        ];

        const projected = nodes.map(([nx, ny, nz]) => {
          // Rotate Y
          const x1 = nx * Math.cos(rotY) + nz * Math.sin(rotY);
          const z1 = -nx * Math.sin(rotY) + nz * Math.cos(rotY);
          // Rotate X
          const y2 = ny * Math.cos(rotX) - z1 * Math.sin(rotX);
          const z2 = ny * Math.sin(rotX) + z1 * Math.cos(rotX);
          const fov = 3.5;
          const scale = fov / (fov + z2);
          return [x1 * cubeSize * scale, y2 * cubeSize * scale];
        });

        const edges = [
          [0, 1], [1, 2], [2, 3], [3, 0],
          [4, 5], [5, 6], [6, 7], [7, 4],
          [0, 4], [1, 5], [2, 6], [3, 7],
        ];

        ctx.strokeStyle = 'rgba(210, 255, 58, 0.15)';
        ctx.lineWidth = 3;
        edges.forEach(([p1, p2]) => {
          ctx.beginPath();
          ctx.moveTo(projected[p1][0], projected[p1][1]);
          ctx.lineTo(projected[p2][0], projected[p2][1]);
          ctx.stroke();
        });
        ctx.restore();
      }

      // ----------------------------------------------------
      // MORPHING ORGANIC LIQUID ENERGY BLOB (Canvas Spline)
      // ----------------------------------------------------
      const drawMorphingAura = (cx: number, cy: number, baseRadius: number) => {
        ctx.save();
        ctx.translate(cx, cy);
        const points = 10;
        const pts: [number, number][] = [];
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const wobble =
            Math.sin(angle * 3 + t * 3.5) * 0.22 +
            Math.cos(angle * 2 - t * 2.8) * 0.16;
          const r = baseRadius * (1 + wobble);
          pts.push([Math.cos(angle) * r, Math.sin(angle) * r]);
        }

        ctx.beginPath();
        ctx.moveTo((pts[0][0] + pts[points - 1][0]) / 2, (pts[0][1] + pts[points - 1][1]) / 2);
        for (let i = 0; i < points; i++) {
          const next = pts[(i + 1) % points];
          const midX = (pts[i][0] + next[0]) / 2;
          const midY = (pts[i][1] + next[1]) / 2;
          ctx.quadraticCurveTo(pts[i][0], pts[i][1], midX, midY);
        }
        ctx.closePath();

        if (isPro) {
          const grad = ctx.createRadialGradient(0, 0, 20, 0, 0, baseRadius * 1.3);
          grad.addColorStop(0, 'rgba(255, 229, 0, 0.35)');
          grad.addColorStop(0.5, 'rgba(255, 0, 127, 0.22)');
          grad.addColorStop(1, 'rgba(0, 240, 255, 0)');
          ctx.fillStyle = grad;
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
          ctx.fill();
        }
        ctx.restore();
      };

      // Draw background morphing aura centered
      drawMorphingAura(w / 2, h / 2 - 80, isPro ? 480 : 340);

      // ----------------------------------------------------
      // OUTER BRUTALIST FRAMEWORK
      // ----------------------------------------------------
      // Shadow offset
      ctx.fillStyle = '#000000';
      ctx.fillRect(m + 16, m + 16, fw, fh);
      ctx.fillStyle = theme.cardBg;
      ctx.fillRect(m, m, fw, fh);
      ctx.lineWidth = 10;
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(m, m, fw, fh);

      // ----------------------------------------------------
      // HEADER BAR WITH EQUALIZER & IDENTITY
      // ----------------------------------------------------
      ctx.fillStyle = '#000000';
      ctx.fillRect(m, m, fw, 120);

      // Pro VIP Golden Crown / Standard Badge
      if (isPro) {
        ctx.fillStyle = '#FFE500';
        ctx.font = '900 36px "Space Grotesk", sans-serif';
        ctx.fillText('👑 PRO VIP RECAP 2026', m + 40, m + 75);
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 36px "Space Grotesk", sans-serif';
        ctx.fillText('★ 2026 VIDEO RECAP', m + 40, m + 75);
      }

      ctx.textAlign = 'right';
      ctx.fillStyle = isPro ? '#00F0FF' : '#FFE500';
      ctx.font = 'bold 32px "JetBrains Mono", monospace';
      ctx.fillText(`${data.userName.toUpperCase()}`, m + fw - 40, m + 75);
      ctx.textAlign = 'left';

      // ----------------------------------------------------
      // PRO EXCLUSIVE: CYBER AUDIO WAVEFORM (32 FREQ BARS)
      // ----------------------------------------------------
      if (isPro) {
        const barsCount = 36;
        const barSpacing = fw / barsCount;
        for (let b = 0; b < barsCount; b++) {
          const barHeight =
            12 +
            Math.abs(Math.sin(t * 8 + b * 0.4)) * 32 +
            beatImpulse * 24;
          const bx = m + b * barSpacing;
          const by = m + 120 - barHeight;

          const barGrad = ctx.createLinearGradient(bx, by, bx, by + barHeight);
          barGrad.addColorStop(0, '#00F0FF');
          barGrad.addColorStop(0.5, '#FFE500');
          barGrad.addColorStop(1, '#FF007F');

          ctx.fillStyle = barGrad;
          ctx.fillRect(bx + 3, by, barSpacing - 6, barHeight);

          // Peak cap
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(bx + 3, by - 4, barSpacing - 6, 2);
        }
      }

      // Top Progress Bar
      const progressPct = Math.min(1, t / duration);
      ctx.fillStyle = isPro ? '#D2FF3A' : '#FFE500';
      ctx.fillRect(m, m + 120, fw * progressPct, 12);

      // ==========================================
      // SCENE MORPHING TRANSITION GEOMETRY
      // ==========================================
      // Transitions occur at [4.4, 5.0], [9.4, 10.0], [14.4, 15.0]
      const getTransitionData = (time: number) => {
        if (time >= 4.4 && time < 5.0) {
          return { active: true, progress: (time - 4.4) / 0.6, from: 1, to: 2 };
        }
        if (time >= 9.4 && time < 10.0) {
          return { active: true, progress: (time - 9.4) / 0.6, from: 2, to: 3 };
        }
        if (time >= 14.4 && time < 15.0) {
          return { active: true, progress: (time - 14.4) / 0.6, from: 3, to: 4 };
        }
        return { active: false, progress: 0, from: 0, to: 0 };
      };

      const trans = getTransitionData(t);

      // ==========================================
      // PHASE 1: 0.0s - 5.0s (INTRO HOOK & KINETIC TYPO)
      // ==========================================
      if (t < 5.0) {
        const sceneProgress = t / 5;
        const enterT = Math.min(1, t / 0.8);
        const easedEnter = easeOutBack(enterT);

        ctx.save();
        ctx.translate(w / 2, h / 2 - 100);

        // Kicker Pill
        const pillY = lerp(-600, -420, easedEnter);
        const pillSquash = 1 + Math.sin(enterT * Math.PI) * 0.15;
        ctx.save();
        ctx.translate(-fw / 2 + 40, pillY);
        ctx.scale(pillSquash, 1 / pillSquash);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 500, 56);
        ctx.fillStyle = isPro ? '#00F0FF' : '#D2FF3A';
        ctx.font = 'bold 28px "JetBrains Mono", monospace';
        ctx.fillText(`DOMAIN: ${data.category.toUpperCase()} // 2026`, 20, 38);
        ctx.restore();

        // Staggered Title Animations
        const line1Progress = easeOutExpo(Math.max(0, Math.min(1, (t - 0.2) / 0.6)));
        const line2Progress = easeOutExpo(Math.max(0, Math.min(1, (t - 0.4) / 0.6)));
        const line3Progress = easeOutBack(Math.max(0, Math.min(1, (t - 0.6) / 0.6)));

        // Line 1: "2026 WAS"
        const x1 = lerp(-fw / 2 - 400, -fw / 2 + 40, line1Progress);
        ctx.fillStyle = '#000000';
        ctx.font = '900 88px "Space Grotesk", sans-serif';
        ctx.fillText('2026 WAS', x1, -250);

        // Line 2: "AN ABSOLUTE"
        const x2 = lerp(fw / 2 + 400, -fw / 2 + 40, line2Progress);
        ctx.fillText('AN ABSOLUTE', x2, -150);

        // Line 3: "MASTERCLASS" in Highlight Box
        const scale3 = lerp(0.4, 1.0, line3Progress);
        ctx.save();
        ctx.translate(-fw / 2 + 40, -110);
        ctx.scale(scale3, scale3);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 720, 110);
        ctx.fillStyle = isPro ? '#FFE500' : '#D2FF3A';
        ctx.fillText('MASTERCLASS', 30, 85);
        ctx.restore();

        // Central Dossier Card (Morphing Anchor)
        const cardProgress = easeOutBack(Math.max(0, Math.min(1, (t - 0.8) / 0.7)));
        let cardW = (fw - 80) * cardProgress;
        let cardH = 430 * cardProgress;
        let cardX = -fw / 2 + 40 + ((fw - 80) - cardW) / 2;
        let cardY = 40;

        // If transitioning to Phase 2 (t: 4.4 - 5.0), MORPH shape smoothly!
        if (trans.active && trans.from === 1) {
          const mp = easeInOutCubic(trans.progress);
          cardW = lerp(fw - 80, fw - 80, mp);
          cardH = lerp(430, 520, mp);
          cardY = lerp(40, -160, mp);
        }

        ctx.fillStyle = '#000000';
        drawRoundedRect(ctx, cardX, cardY, cardW, cardH, isPro ? 24 : 8);
        ctx.fill();

        if (cardProgress > 0.6) {
          // Gemini Hook Header
          ctx.fillStyle = '#FFE500';
          ctx.font = 'bold 28px "JetBrains Mono", monospace';
          ctx.fillText('⚡ GEMINI AI NARRATION // HOOK', cardX + 35, cardY + 70);

          // Typewriter Text Reveal
          const hookText =
            narration?.hook || `Stop scrolling! ${data.userName}'s 2026 dossier is live.`;
          const charCount = Math.floor(
            Math.min(hookText.length, (t - 1.2) * 32)
          );
          const visibleText = hookText.slice(0, Math.max(0, charCount));

          ctx.fillStyle = '#FFFFFF';
          ctx.font = '600 36px "Space Grotesk", sans-serif';
          ctx.fillText(visibleText.slice(0, 42), cardX + 35, cardY + 140);
          if (visibleText.length > 42) {
            ctx.fillText(visibleText.slice(42, 86), cardX + 35, cardY + 195);
          }

          // Handle Pill & Indicator
          ctx.fillStyle = '#00F0FF';
          ctx.font = 'bold 32px "JetBrains Mono", monospace';
          ctx.fillText(`@${data.handle}`, cardX + 35, cardY + 330);

          // Audio pulse icon inside card
          ctx.fillStyle = '#D2FF3A';
          ctx.font = 'bold 22px "JetBrains Mono", monospace';
          ctx.fillText('AUDIO SYNC ACTIVE ▶', cardX + cardW - 320, cardY + 330);
        }

        ctx.restore();
      }

      // ==========================================
      // PHASE 2: 5.0s - 10.0s (KEYSTONE METRIC & MILESTONE POP)
      // ==========================================
      else if (t < 10.0) {
        const sceneT = t - 5.0;
        const enterProgress = Math.min(1, sceneT / 0.7);
        const enterEased = easeOutBack(enterProgress);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 36px "JetBrains Mono", monospace';
        ctx.fillText('[ 01 // KEYSTONE MILESTONES ]', m + 40, m + 220);

        // Keystone Monolith Box (Morphing Container)
        let boxX = m + 40;
        let boxY = m + 260;
        let boxW = fw - 80;
        let boxH = 520;
        let boxR = isPro ? 24 : 12;

        // Transition 2->3 morphing into horizontal tracks
        if (trans.active && trans.from === 2) {
          const mp = easeInOutCubic(trans.progress);
          boxH = lerp(520, 200, mp);
          boxY = lerp(m + 260, m + 340, mp);
        }

        ctx.fillStyle = '#000000';
        drawRoundedRect(ctx, boxX, boxY, boxW, boxH, boxR);
        ctx.fill();

        ctx.fillStyle = isPro ? '#00F0FF' : '#FFE500';
        ctx.font = 'bold 32px "JetBrains Mono", monospace';
        ctx.fillText(data.primaryMetric.label.toUpperCase(), m + 75, m + 340);

        // Kinetic Counter Animation with Exponential Roll & Final POP
        const countProgress = Math.min(1, sceneT / 2.0);
        const countEased = easeOutExpo(countProgress);
        const countUp = Math.round(data.primaryMetric.value * countEased);

        // Lock-in Pop effect when reaching 100% (at sceneT ~ 2.0s)
        const popTime = Math.max(0, sceneT - 2.0);
        const popScale =
          popTime < 0.5 ? 1.0 + Math.sin((popTime / 0.5) * Math.PI) * 0.18 : 1.0;

        ctx.save();
        ctx.translate(m + 75, m + 520);
        ctx.scale(popScale, popScale);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '900 150px "Space Grotesk", sans-serif';
        ctx.fillText(`${countUp.toLocaleString()}`, 0, 0);

        ctx.fillStyle = isPro ? '#FFE500' : '#D2FF3A';
        ctx.font = 'bold 48px "Space Grotesk", sans-serif';
        ctx.fillText(`${data.primaryMetric.unit.toUpperCase()}`, 0, 85);
        ctx.restore();

        // Pop Shockwave particles when counter hits 100%
        if (popTime > 0 && popTime < 0.8) {
          const ringR = popTime * 320;
          ctx.strokeStyle = isPro ? '#FFE500' : '#D2FF3A';
          ctx.lineWidth = 6 * (1 - popTime / 0.8);
          ctx.beginPath();
          ctx.arc(m + 350, m + 480, ringR, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Percentile Badge (Flies up from bottom)
        const rankEnter = easeOutBack(Math.max(0, Math.min(1, (sceneT - 0.6) / 0.6)));
        const rankY = lerp(m + 1200, m + 820, rankEnter);

        ctx.fillStyle = '#000000';
        drawRoundedRect(ctx, m + 40, rankY, fw - 80, 220, isPro ? 24 : 12);
        ctx.fill();

        ctx.fillStyle = isPro ? '#00F0FF' : '#D2FF3A';
        ctx.font = '900 68px "Space Grotesk", sans-serif';
        ctx.fillText(`TOP ${100 - data.percentileRank}% GLOBALLY`, m + 70, rankY + 105);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 28px "JetBrains Mono", monospace';
        ctx.fillText(`UNBROKEN STREAK: ${data.streak.days} DAYS`, m + 70, rankY + 165);

        // 2 Sub-metrics with 3D Flip & Pop
        const sub1Enter = easeOutBack(Math.max(0, Math.min(1, (sceneT - 1.2) / 0.5)));
        const sub2Enter = easeOutBack(Math.max(0, Math.min(1, (sceneT - 1.4) / 0.5)));
        const boxSubW = (fw - 100) / 2;

        data.secondaryMetrics.slice(0, 2).forEach((sec, idx) => {
          const subProgress = idx === 0 ? sub1Enter : sub2Enter;
          const x = m + 40 + idx * (boxSubW + 20);
          const y = lerp(m + 1300, m + 1080, subProgress);

          ctx.save();
          ctx.translate(x, y);

          // Card Shadow
          ctx.fillStyle = '#000000';
          ctx.fillRect(8, 8, boxSubW, 220);

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, boxSubW, 220);
          ctx.lineWidth = 6;
          ctx.strokeStyle = '#000000';
          ctx.strokeRect(0, 0, boxSubW, 220);

          ctx.fillStyle = '#000000';
          ctx.font = '900 58px "Space Grotesk", sans-serif';
          ctx.fillText(String(sec.value), 30, 100);

          ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#444444';
          ctx.fillText(sec.label.toUpperCase(), 30, 160);
          ctx.restore();
        });
      }

      // ==========================================
      // PHASE 3: 10.0s - 15.0s (TOP 5 OBSESSIONS - FLUID MORPHING STACK)
      // ==========================================
      else if (t < 15.0) {
        const sceneT = t - 10.0;

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 36px "JetBrains Mono", monospace';
        ctx.fillText('[ 02 // TOP 5 OBSESSIONS ]', m + 40, m + 220);

        ctx.font = '900 68px "Space Grotesk", sans-serif';
        ctx.fillText('HEAVY ROTATION', m + 40, m + 300);

        // Render Staggered Sliding Cards with Spring Physics & Rotation
        data.topItems.slice(0, 5).forEach((item, idx) => {
          const itemY = m + 340 + idx * 215;
          const itemDelay = idx * 0.22;
          const itemProgress = Math.max(0, Math.min(1, (sceneT - itemDelay) / 0.55));
          const eased = easeOutBack(itemProgress, 1.4);

          // Fly in from alternating Left / Right with slight tilt
          const fromLeft = idx % 2 === 0;
          const startX = fromLeft ? -500 : 500;
          const currentX = lerp(startX, 0, eased);
          const tiltDeg = lerp(fromLeft ? -5 : 5, 0, eased) * (Math.PI / 180);

          ctx.save();
          ctx.translate(m + 40 + currentX + (fw - 80) / 2, itemY + 95);
          ctx.rotate(tiltDeg);
          ctx.translate(-(fw - 80) / 2, -95);

          // Card Shadow
          ctx.fillStyle = '#000000';
          ctx.fillRect(8, 8, fw - 80, 190);

          // Card Background: Rank 1 is vibrant neon/gold
          if (idx === 0) {
            ctx.fillStyle = isPro ? '#FFE500' : '#D2FF3A';
          } else {
            ctx.fillStyle = '#FFFFFF';
          }
          ctx.fillRect(0, 0, fw - 80, 190);
          ctx.lineWidth = 6;
          ctx.strokeStyle = '#000000';
          ctx.strokeRect(0, 0, fw - 80, 190);

          // Rank Badge with Spring Pop
          const rankScale = easeOutElastic(itemProgress);
          ctx.save();
          ctx.translate(55, 60);
          ctx.scale(rankScale, rankScale);
          ctx.fillStyle = '#000000';
          ctx.fillRect(-35, -35, 70, 70);
          ctx.fillStyle = idx === 0 ? '#FFE500' : '#FFFFFF';
          ctx.font = '900 36px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`0${idx + 1}`, 0, 12);
          ctx.restore();

          // Title & Subtitle
          ctx.textAlign = 'left';
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 38px "Space Grotesk", sans-serif';
          ctx.fillText(item.name.slice(0, 24), 115, 75);

          ctx.font = '600 26px "Plus Jakarta Sans", sans-serif';
          ctx.fillStyle = '#444444';
          ctx.fillText((item.subtitle || '').slice(0, 32), 115, 125);

          // Count Tag
          ctx.fillStyle = '#000000';
          ctx.fillRect(fw - 220, 30, 130, 50);
          ctx.fillStyle = idx === 0 ? '#000000' : isPro ? '#00F0FF' : '#D2FF3A';
          if (idx === 0) ctx.fillStyle = '#FFE500';
          ctx.font = 'bold 22px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(String(item.count || '').slice(0, 10), fw - 155, 63);
          ctx.textAlign = 'left';

          ctx.restore();
        });
      }

      // ==========================================
      // PHASE 4: 15.0s - 20.0s (ARCHETYPE CROWN & GRAND FINALE)
      // ==========================================
      else {
        const sceneT = t - 15.0;
        const stampEnter = easeOutBack(Math.min(1, sceneT / 0.7), 1.6);

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 36px "JetBrains Mono", monospace';
        ctx.fillText('[ 03 // 2026 IDENTITY CROWN ]', m + 40, m + 220);

        // Giant Archetype Monolith Box
        const cardY = lerp(m + 1400, m + 260, stampEnter);
        ctx.fillStyle = '#000000';
        drawRoundedRect(ctx, m + 40, cardY, fw - 80, 840, isPro ? 28 : 12);
        ctx.fill();

        // Animated Golden Crown Icon
        const crownScale = easeOutElastic(Math.min(1, sceneT / 1.0));
        ctx.save();
        ctx.translate(m + 110, cardY + 100);
        ctx.scale(crownScale, crownScale);
        ctx.fillStyle = '#FFE500';
        ctx.beginPath();
        ctx.moveTo(0, 30);
        ctx.lineTo(15, -15);
        ctx.lineTo(30, 10);
        ctx.lineTo(45, -25);
        ctx.lineTo(60, 10);
        ctx.lineTo(75, -15);
        ctx.lineTo(90, 30);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        ctx.fillStyle = isPro ? '#00F0FF' : '#FFE500';
        ctx.font = 'bold 32px "JetBrains Mono", monospace';
        ctx.fillText('★ OFFICIAL RECAP ARCHETYPE', m + 220, cardY + 115);

        ctx.fillStyle = isPro ? '#FFE500' : '#D2FF3A';
        ctx.font = '900 76px "Space Grotesk", sans-serif';
        ctx.fillText(data.archetype.title, m + 80, cardY + 230);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px "JetBrains Mono", monospace';
        ctx.fillText(`"${data.archetype.tagline}"`, m + 80, cardY + 310);

        ctx.fillStyle = '#E5E5E5';
        ctx.font = '500 32px "Plus Jakarta Sans", sans-serif';
        ctx.fillText(data.archetype.description.slice(0, 48), m + 80, cardY + 410);
        if (data.archetype.description.length > 48) {
          ctx.fillText(data.archetype.description.slice(48, 100), m + 80, cardY + 460);
        }

        // Quirk / Highlight Banner
        if (data.failOrQuirk) {
          const quirkEnter = easeOutBack(Math.max(0, Math.min(1, (sceneT - 0.8) / 0.6)));
          const qx = lerp(-600, m + 80, quirkEnter);
          ctx.fillStyle = '#FF5A36';
          ctx.fillRect(qx, cardY + 540, fw - 160, 180);
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 28px "JetBrains Mono", monospace';
          ctx.fillText(data.failOrQuirk.label.toUpperCase(), qx + 30, cardY + 600);
          ctx.font = '600 30px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(data.failOrQuirk.description.slice(0, 36), qx + 30, cardY + 660);
        }

        // Closing Outro Ribbon
        const outroEnter = easeOutBack(Math.max(0, Math.min(1, (sceneT - 1.4) / 0.6)));
        const outroY = lerp(m + 1800, m + 1140, outroEnter);

        ctx.fillStyle = '#000000';
        ctx.fillRect(m + 48, outroY + 8, fw - 80, 260);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(m + 40, outroY, fw - 80, 260);
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#000000';
        ctx.strokeRect(m + 40, outroY, fw - 80, 260);

        ctx.fillStyle = '#000000';
        ctx.font = '900 56px "Space Grotesk", sans-serif';
        ctx.fillText(`${data.userName.toUpperCase()}`, m + 80, outroY + 100);

        ctx.font = 'bold 32px "JetBrains Mono", monospace';
        ctx.fillStyle = '#444444';
        ctx.fillText(`SEE YOU IN 2027 · ${data.category.toUpperCase()}`, m + 80, outroY + 180);
      }

      // ==========================================
      // MORPHING IRIS / WIPE OVERLAY ON TRANSITIONS
      // ==========================================
      if (trans.active) {
        const p = trans.progress;
        const irisScale = Math.sin(p * Math.PI);
        if (irisScale > 0.05) {
          ctx.save();
          ctx.translate(w / 2, h / 2);
          ctx.rotate(p * Math.PI * 0.5);

          // Draw Kinetic Expanding Diamond Iris
          const irisR = irisScale * 1400;
          ctx.fillStyle = isPro ? 'rgba(255, 229, 0, 0.25)' : 'rgba(0, 0, 0, 0.15)';
          ctx.beginPath();
          ctx.moveTo(0, -irisR);
          ctx.lineTo(irisR, 0);
          ctx.lineTo(0, irisR);
          ctx.lineTo(-irisR, 0);
          ctx.closePath();
          ctx.fill();

          ctx.lineWidth = 14;
          ctx.strokeStyle = isPro ? '#00F0FF' : '#000000';
          ctx.stroke();
          ctx.restore();
        }
      }

      // ==========================================
      // PRO EXCLUSIVE: SPECULAR METALLIC LIGHT SWEEP (45 DEGREE)
      // ==========================================
      if (isPro) {
        const sweepPeriod = 2.4;
        const sweepTime = (t % sweepPeriod) / sweepPeriod;
        const sweepX = lerp(-600, w + 600, sweepTime);

        ctx.save();
        ctx.beginPath();
        ctx.rect(m, m, fw, fh);
        ctx.clip();

        const sheenGrad = ctx.createLinearGradient(
          sweepX - 200,
          0,
          sweepX + 200,
          h
        );
        sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        sheenGrad.addColorStop(0.4, 'rgba(255, 229, 0, 0.08)');
        sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
        sheenGrad.addColorStop(0.6, 'rgba(0, 240, 255, 0.15)');
        sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = sheenGrad;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      // ==========================================
      // PRO EXCLUSIVE: DETERMINISTIC GOLDEN STARDUST PARTICLES
      // ==========================================
      if (isPro) {
        const particleCount = 42;
        ctx.save();
        for (let i = 0; i < particleCount; i++) {
          const speed = 60 + (i % 7) * 20;
          const pY = h - ((t * speed + i * 195) % h);
          const pX =
            ((i * 123.456) % fw) +
            m +
            Math.sin(t * 2 + i) * 45;
          const pSize = 4 + (i % 4) * 3;
          const pAlpha = 0.35 + 0.65 * Math.sin(t * 3 + i);

          ctx.fillStyle =
            i % 2 === 0
              ? `rgba(255, 229, 0, ${pAlpha})`
              : `rgba(0, 240, 255, ${pAlpha})`;

          // Twinkling 4-Point Stars (✦)
          if (i % 3 === 0) {
            ctx.save();
            ctx.translate(pX, pY);
            ctx.rotate(t * 2 + i);
            ctx.beginPath();
            ctx.moveTo(0, -pSize * 2);
            ctx.lineTo(pSize * 0.5, -pSize * 0.5);
            ctx.lineTo(pSize * 2, 0);
            ctx.lineTo(pSize * 0.5, pSize * 0.5);
            ctx.lineTo(0, pSize * 2);
            ctx.lineTo(-pSize * 0.5, pSize * 0.5);
            ctx.lineTo(-pSize * 2, 0);
            ctx.lineTo(-pSize * 0.5, -pSize * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
          } else {
            ctx.beginPath();
            ctx.arc(pX, pY, pSize, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // ==========================================
      // PRO EXCLUSIVE: HOLOGRAPHIC VIP CORNER SEAL
      // ==========================================
      if (isPro) {
        const sealX = m + fw - 110;
        const sealY = m + 210;
        ctx.save();
        ctx.translate(sealX, sealY);
        ctx.rotate(t * 0.5);

        ctx.fillStyle = '#FFE500';
        ctx.beginPath();
        const rays = 12;
        for (let r = 0; r < rays * 2; r++) {
          const angle = (r / (rays * 2)) * Math.PI * 2;
          const rad = r % 2 === 0 ? 55 : 42;
          if (r === 0) ctx.moveTo(Math.cos(angle) * rad, Math.sin(angle) * rad);
          else ctx.lineTo(Math.cos(angle) * rad, Math.sin(angle) * rad);
        }
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000000';
        ctx.stroke();

        ctx.rotate(-t * 0.5);
        ctx.fillStyle = '#000000';
        ctx.font = '900 16px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('VIP', 0, -4);
        ctx.fillText('PRO', 0, 14);
        ctx.textAlign = 'left';
        ctx.restore();
      }

      // ==========================================
      // SYNCHRONIZED CAPTION BANNER
      // ==========================================
      const captionY = m + fh - 240;
      ctx.fillStyle = '#000000';
      ctx.fillRect(m + 40, captionY, fw - 80, 120);
      ctx.lineWidth = 4;
      ctx.strokeStyle = isPro ? '#00F0FF' : '#FFE500';
      ctx.strokeRect(m + 40, captionY, fw - 80, 120);

      let currentSubtitle =
        narration?.hook || `Inspecting ${data.userName}'s 2026 Wrapped...`;
      if (t >= 5 && t < 10) {
        currentSubtitle =
          narration?.scenes?.[1]?.voiceover ||
          `Clocking in at ${data.primaryMetric.value.toLocaleString()} ${data.primaryMetric.unit}!`;
      } else if (t >= 10 && t < 15) {
        currentSubtitle =
          narration?.scenes?.[2]?.voiceover ||
          `Heavy rotation on repeat all year long.`;
      } else if (t >= 15) {
        currentSubtitle =
          narration?.scenes?.[3]?.voiceover ||
          `Officially certified as ${data.archetype.title}.`;
      }

      ctx.fillStyle = isPro ? '#00F0FF' : '#FFE500';
      ctx.font = 'bold 22px "JetBrains Mono", monospace';
      ctx.fillText(
        isPro ? '▶ GEMINI AI DIRECTOR // VIP PRO AUDIO:' : '▶ GEMINI AI CAPTION:',
        m + 60,
        captionY + 40
      );

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '600 26px "Space Grotesk", sans-serif';
      ctx.fillText(currentSubtitle.slice(0, 54), m + 60, captionY + 85);

      // ==========================================
      // BOTTOM WATERMARK / VIP BRANDING
      // ==========================================
      const footerY = m + fh - 80;
      ctx.fillStyle = '#000000';
      ctx.fillRect(m, footerY, fw, 80);

      if (isPro) {
        ctx.fillStyle = '#FFE500';
        ctx.font = 'bold 24px "Space Grotesk", sans-serif';
        ctx.fillText('✦ VIP PRO DOSSIER · UNRESTRICTED ARCHIVE', m + 40, footerY + 50);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#00F0FF';
        ctx.font = 'bold 24px "JetBrains Mono", monospace';
        ctx.fillText('VERIFIED 2026 EDITION', m + fw - 40, footerY + 50);
        ctx.textAlign = 'left';
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px "Space Grotesk", sans-serif';
        ctx.fillText('PERSONAL YEAR WRAPPED 2026', m + 40, footerY + 50);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#FFE500';
        ctx.font = 'bold 24px "JetBrains Mono", monospace';
        ctx.fillText('personalwrapped.app', m + fw - 40, footerY + 50);
        ctx.textAlign = 'left';
      }

      ctx.restore();
    },
    [data, theme, narration, duration, isProActive]
  );

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
            return 0; // Loop seamlessly
          }

          // Trigger audio beat every second & drops at scene transitions
          const sec = Math.floor(next);
          if (sec !== lastBeatSecond) {
            lastBeatSecond = sec;
            const isTransition = sec === 0 || sec === 5 || sec === 10 || sec === 15;
            const freq = isTransition ? 220 : sec % 2 === 0 ? 120 : 180;
            playSynthesizerBeat(freq, isTransition ? 0.35 : 0.15, isTransition);

            if (isTransition && isProActive) {
              playAchievementSound();
            }

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
  }, [
    isPlaying,
    duration,
    narration,
    playSynthesizerBeat,
    speakCurrentScene,
    isProActive,
  ]);

  // Render on time update
  useEffect(() => {
    renderFrame(currentTime, isProActive);
  }, [currentTime, renderFrame, isProActive]);

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

  // 4. Record Real 9:16 Video (MP4 / WebM) via MediaRecorder & Mediabunny
  const handleDownloadVideo = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    initAudio();
    setIsRecording(true);
    setRecordPhase('rendering');
    setIsPlaying(false);
    setRecordProgress(0);
    trackEvent('export_video_started', {
      category: data.category,
      isPro: isProActive,
      format: videoFormat,
    });

    try {
      const stream = canvas.captureStream(30);

      // Add audio track if destination exists
      if (
        audioDestinationRef.current &&
        audioDestinationRef.current.stream.getAudioTracks().length > 0
      ) {
        stream.addTrack(audioDestinationRef.current.stream.getAudioTracks()[0]);
      }

      const nativeMp4Mime = getSupportedNativeMp4MimeType();
      const webmMime = getSupportedWebmMimeType();

      let targetMime = webmMime;
      let isNativeMp4 = false;

      if (videoFormat === 'mp4') {
        if (nativeMp4Mime) {
          targetMime = nativeMp4Mime;
          isNativeMp4 = true;
        } else {
          // Will record as WebM first, then transcode via Mediabunny to MP4
          targetMime = webmMime;
          isNativeMp4 = false;
        }
      } else {
        targetMime = webmMime;
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: targetMime,
        videoBitsPerSecond: isProActive ? 8000000 : 4000000, // 8Mbps high-bitrate for Pro!
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const recordPromise = new Promise<Blob>((resolve, reject) => {
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: targetMime }));
        };
        recorder.onerror = (e) => {
          reject(e);
        };
      });

      recorder.start();

      // Render 600 frames sequentially with deterministic particles and morphing
      const totalFrames = 30 * duration;
      for (let f = 0; f < totalFrames; f++) {
        const recordTime = f / 30;
        renderFrame(recordTime, isProActive);
        setRecordProgress(Math.round((f / totalFrames) * 100));
        await new Promise((r) => setTimeout(r, 16));
      }

      recorder.stop();
      const recordedBlob = await recordPromise;

      let finalBlob = recordedBlob;
      let finalExtension: 'mp4' | 'webm' = videoFormat;

      if (videoFormat === 'mp4') {
        if (isNativeMp4) {
          finalBlob = recordedBlob;
          finalExtension = 'mp4';
        } else {
          // Transcode/remux WebM to MP4 using Mediabunny
          setRecordPhase('converting');
          setRecordProgress(0);
          try {
            finalBlob = await convertWebmToMp4(recordedBlob, (progress) => {
              setRecordProgress(Math.round(progress * 100));
            });
            finalExtension = 'mp4';
          } catch (transcodeErr) {
            console.warn('MP4 conversion fallback to WebM:', transcodeErr);
            finalBlob = recordedBlob;
            finalExtension = 'webm';
          }
        }
      }

      const url = URL.createObjectURL(finalBlob);
      const a = document.createElement('a');
      a.href = url;
      const prefix = isProActive ? 'VIP_PRO' : 'WRAP';
      const cleanHandle = data.handle.replace('@', '') || 'user';
      a.download = `${prefix}_${cleanHandle}_${data.category}_wrapped_2026.${finalExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsRecording(false);
      setIsPlaying(true);
      trackEvent('export_video_completed', { isPro: isProActive, format: finalExtension });
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
        {/* VIP / Pro Mode Control Bar */}
        <div
          className={`w-full mb-3 p-3 border-3 border-black brutal-shadow flex items-center justify-between gap-2 transition-all ${
            isProActive
              ? 'bg-gradient-to-r from-[#FFE500] via-[#D2FF3A] to-[#00F0FF] text-black font-bold'
              : 'bg-neutral-100 text-neutral-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <div
              className={`p-1.5 border-2 border-black ${
                isProActive ? 'bg-black text-[#FFE500]' : 'bg-white text-neutral-600'
              }`}
            >
              <Crown className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="text-xs font-display font-black tracking-tight flex items-center gap-1.5">
                {isProActive ? 'PRO VIP ANIMATION ENGINE' : 'STANDARD ANIMATION'}
                {isProActive && (
                  <span className="px-1.5 py-0.2 bg-black text-[#FFE500] text-[9px] font-mono-code uppercase rounded">
                    ACTIVE
                  </span>
                )}
              </div>
              <div className="text-[10px] font-mono-code opacity-80">
                {isProActive
                  ? 'Morphing Aura · Stardust · Specular Sweep · 3D Wireframe'
                  : 'Basic transitions · Upgrade for Ultra Visuals'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {!isPremiumUnlocked ? (
              <button
                onClick={() => setIsProActive(!isProActive)}
                className={`px-2.5 py-1 text-[11px] font-mono-code font-bold uppercase border-2 border-black brutal-btn ${
                  isProActive
                    ? 'bg-black text-white hover:bg-neutral-800'
                    : 'bg-[#D2FF3A] text-black hover:bg-[#c2ef26]'
                }`}
                title="Toggle Pro Animations preview"
              >
                {isProActive ? 'Preview Standard' : '✨ Preview VIP'}
              </button>
            ) : (
              <span className="text-[10px] font-mono-code font-bold px-2 py-0.5 bg-black text-[#D2FF3A] border border-black">
                PRO PASS OWNER
              </span>
            )}
          </div>
        </div>

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
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center text-white z-40 space-y-3 font-mono-code">
              <FileVideo className="w-12 h-12 text-[#FFE500] animate-bounce" />
              <div className="font-display font-black text-xl text-white">
                {recordPhase === 'converting'
                  ? 'FINALIZING MP4 CONTAINER...'
                  : isProActive
                  ? 'RENDERING PRO VIP 9:16 VIDEO...'
                  : 'RENDERING 9:16 VIDEO...'}
              </div>
              <div className="w-48 h-3 border-2 border-[#FFE500] bg-black p-0.5">
                <div
                  className={`h-full transition-all ${
                    isProActive ? 'bg-[#FFE500]' : 'bg-[#D2FF3A]'
                  }`}
                  style={{ width: `${recordProgress}%` }}
                />
              </div>
              <div className="text-xs text-neutral-300">
                {recordPhase === 'converting'
                  ? `Converting to MP4 format (${recordProgress}%)`
                  : `Encoding 600 kinetic frames with audio (${recordProgress}%)`}
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
            <span className="text-neutral-700 w-10 text-right">0:20</span>
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
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-red-600" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </div>

            <button
              onClick={handleDownloadVideo}
              disabled={isRecording}
              className={`px-4 py-2 border-2 border-black font-display font-black text-xs uppercase tracking-wider brutal-btn flex items-center gap-1.5 ${
                isProActive
                  ? 'bg-gradient-to-r from-[#FFE500] to-[#D2FF3A] text-black shadow-[3px_3px_0px_#000]'
                  : 'bg-black text-[#D2FF3A]'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {isProActive
                  ? `DOWNLOAD VIP (${videoFormat.toUpperCase()})`
                  : `DOWNLOAD 9:16 (${videoFormat.toUpperCase()})`}
              </span>
            </button>
          </div>

          {/* Format Selector Bar */}
          <div className="flex items-center justify-between pt-2 border-t-2 border-black text-xs">
            <span className="font-mono-code text-[11px] text-neutral-700 font-bold uppercase">
              Format:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setVideoFormat('mp4')}
                disabled={isRecording}
                className={`px-2.5 py-1 text-[11px] font-mono-code font-bold uppercase border-2 border-black transition-all ${
                  videoFormat === 'mp4'
                    ? 'bg-[#FFE500] text-black shadow-[2px_2px_0px_#000] -translate-y-0.5'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                MP4 (Default)
              </button>
              <button
                type="button"
                onClick={() => setVideoFormat('webm')}
                disabled={isRecording}
                className={`px-2.5 py-1 text-[11px] font-mono-code font-bold uppercase border-2 border-black transition-all ${
                  videoFormat === 'webm'
                    ? 'bg-[#FFE500] text-black shadow-[2px_2px_0px_#000] -translate-y-0.5'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                WebM
              </button>
            </div>
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
                  Model: gemini-3.8-flash · Kinetic Morphing Motion Engine
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
                  4-Scene Kinetic Morphing Timeline (20s)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(narration?.scenes || []).map((scene, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 border-2 border-black text-xs font-mono-code transition-all ${
                        currentTime >= idx * 5 && currentTime < (idx + 1) * 5
                          ? 'bg-[#FFE500] font-bold shadow-[2px_2px_0px_#000] scale-[1.02]'
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
              Format: <strong>9:16 Vertical Video ({videoFormat.toUpperCase()})</strong>
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

        {/* PRO UPSELL BANNER (If not yet purchased) */}
        {!isPremiumUnlocked && onOpenUpgradeModal && (
          <div className="p-5 bg-gradient-to-br from-[#FFE500] via-[#D2FF3A] to-[#00F0FF] border-4 border-black brutal-shadow space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-display font-black text-base text-black">
                <Crown className="w-5 h-5 text-black" />
                <span>UPGRADE TO PRO PASS VIDEO ENGINE</span>
              </div>
              <span className="px-2 py-0.5 bg-black text-[#FFE500] font-mono-code text-[11px] font-bold">
                VIP UPGRADE
              </span>
            </div>
            <p className="text-xs text-neutral-900 leading-relaxed font-medium">
              Unlock <strong>Morphing Organic Liquid Aura</strong>, <strong>Rotating 3D Cyber Wireframe</strong>, <strong>Golden Stardust Particles</strong>, <strong>Specular Light Sweep</strong>, <strong>Cyber Equalizer Waveform</strong>, and <strong>No-Watermark 8Mbps High-Bitrate Export</strong>.
            </p>
            <button
              onClick={onOpenUpgradeModal}
              className="w-full py-2.5 bg-black text-[#FFE500] border-2 border-black font-display font-black text-sm uppercase brutal-btn flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>UNLOCK PRO PASS (Rp 25.000 / $1.99)</span>
            </button>
          </div>
        )}

        {/* Feature Highlights */}
        <div className="p-5 bg-white border-4 border-black brutal-shadow space-y-3">
          <div className="font-display font-black text-base text-black flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-black" />
            MOTION DESIGN ENHANCEMENTS
          </div>
          <ul className="text-xs text-neutral-800 space-y-1.5 font-medium">
            <li className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-black" />
              <span><strong>Snappy Spring Physics:</strong> Overshoot and settle easing instead of rigid linear cuts.</span>
            </li>
            <li className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-black" />
              <span><strong>Geometric Morphing Iris:</strong> Seamless card-to-card shape transformation during scene changes.</span>
            </li>
            <li className="flex items-center gap-2">
              <Crown className="w-3.5 h-3.5 text-black" />
              <span><strong>VIP Stardust & Sheen:</strong> Exclusive 3D projections, particle fountain, and chromatic reflection for Premium users.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
