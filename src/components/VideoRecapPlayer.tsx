import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { ThemeConfig, WrappedData } from '../types';
import { PersonalWrappedVideo } from '../remotion/PersonalWrappedVideo';
import { GeminiNarration } from '../remotion/types';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Sparkles,
  Bot,
  FileVideo,
  CheckCircle2,
  Share2,
  Crown,
  Zap,
  Layers,
} from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { playAchievementSound } from '../utils/sound';

interface VideoRecapPlayerProps {
  data: WrappedData;
  theme: ThemeConfig;
  isPremiumUnlocked?: boolean;
  onOpenUpgradeModal?: () => void;
  onOpenShareModal: () => void;
}

export const VideoRecapPlayer: React.FC<VideoRecapPlayerProps> = ({
  data,
  theme,
  isPremiumUnlocked = false,
  onOpenUpgradeModal,
  onOpenShareModal,
}) => {
  const playerRef = useRef<PlayerRef>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadStatus, setDownloadStatus] = useState<string>('');
  const [videoFormat, setVideoFormat] = useState<'mp4' | 'webm'>('mp4');
  const [narration, setNarration] = useState<GeminiNarration | null>(null);
  const [isLoadingScript, setIsLoadingScript] = useState<boolean>(true);

  // VIP Pro Mode State: If unlocked, auto-on; otherwise user can toggle Preview Mode
  const [isProActive, setIsProActive] = useState<boolean>(isPremiumUnlocked);

  useEffect(() => {
    if (isPremiumUnlocked) {
      setIsProActive(true);
    }
  }, [isPremiumUnlocked]);

  const duration = 20; // 20-second dynamic vertical video (600 frames at 30fps)
  const audioCtxRef = useRef<AudioContext | null>(null);

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

        const volume = isBassDrop ? 0.3 : 0.15;
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + dur);
      } catch {
        // Audio policy fallback
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
      utterance.rate = 1.15;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    },
    [isMuted]
  );

  // Synchronize Player frame updates with audio & speech
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    let lastSec = -1;

    const onFrameUpdate = (e: { detail: { frame: number } }) => {
      const f = e.detail.frame;
      const t = f / 30;
      setCurrentTime(t);

      const sec = Math.floor(t);
      if (sec !== lastSec) {
        lastSec = sec;
        const isTransition = sec === 0 || sec === 5 || sec === 10 || sec === 15;
        const freq = isTransition ? 220 : sec % 2 === 0 ? 120 : 180;
        playSynthesizerBeat(freq, isTransition ? 0.35 : 0.15, isTransition);

        if (isTransition && isProActive) {
          playAchievementSound();
        }

        // Trigger speech voiceover on scene boundaries
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
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    player.addEventListener('frameupdate', onFrameUpdate as any);
    player.addEventListener('play', onPlay);
    player.addEventListener('pause', onPause);

    return () => {
      player.removeEventListener('frameupdate', onFrameUpdate as any);
      player.removeEventListener('play', onPlay);
      player.removeEventListener('pause', onPause);
    };
  }, [narration, isProActive, playSynthesizerBeat, speakCurrentScene]);

  const handleTogglePlay = () => {
    initAudio();
    if (playerRef.current) {
      if (playerRef.current.isPlaying()) {
        playerRef.current.pause();
        setIsPlaying(false);
      } else {
        playerRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleRestart = () => {
    initAudio();
    if (playerRef.current) {
      playerRef.current.seekTo(0);
      playerRef.current.play();
      setIsPlaying(true);
    }
    if (narration?.hook) speakCurrentScene(narration.hook);
  };

  const handleSeek = (timeInSec: number) => {
    setCurrentTime(timeInSec);
    if (playerRef.current) {
      playerRef.current.seekTo(Math.round(timeInSec * 30));
    }
  };

  // Video Download Handler
  const handleDownloadVideo = async () => {
    setIsDownloading(true);
    setDownloadStatus('Initializing 3D video render...');
    trackEvent('export_video_started', {
      category: data.category,
      isPro: isProActive,
      format: videoFormat,
    });

    const prefix = isProActive ? 'VIP_PRO' : 'WRAP';
    const cleanHandle = data.handle.replace(/[^a-zA-Z0-9_-]/g, '') || 'user';
    const defaultFilename = `${prefix}_${cleanHandle}_${data.category}_wrapped_2026.mp4`;

    try {
      // 1. Request server-side dynamic render with the user's customized data
      setDownloadStatus(`Rendering personalized 3D recap for ${data.userName}...`);
      const renderRes = await fetch('/api/render-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          theme,
          isPro: isProActive,
          narration,
        }),
      });

      if (renderRes.ok) {
        const json = await renderRes.json();
        if (json.success && json.downloadUrl) {
          setDownloadStatus('Downloading rendered MP4...');
          const videoRes = await fetch(json.downloadUrl);
          if (videoRes.ok) {
            const blob = await videoRes.blob();
            if (blob.size > 50000) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = json.filename || defaultFilename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              trackEvent('export_video_completed', { isPro: isProActive, format: 'mp4' });
              setIsDownloading(false);
              setDownloadStatus('');
              return;
            }
          }
        } else if (json.error) {
          throw new Error(json.error);
        }
      } else {
        const errJson = await renderRes.json().catch(() => null);
        throw new Error(errJson?.error || `Server returned error (${renderRes.status})`);
      }

      // 2. Fallback to broadcast MP4 ONLY if category is github
      if (data.category === 'github') {
        setDownloadStatus('Downloading broadcast video...');
        const res = await fetch('/personal_wrapped.mp4');
        if (res.ok) {
          const blob = await res.blob();
          if (blob.size > 50000 && (blob.type.includes('video') || blob.type === 'application/octet-stream' || blob.type === '')) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = defaultFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            trackEvent('export_video_completed', { isPro: isProActive, format: 'mp4' });
            setIsDownloading(false);
            setDownloadStatus('');
            return;
          }
        }
      }
    } catch (err: any) {
      console.error('Video download error:', err);
      alert(`Gagal mengekspor video ${data.category}: ${err.message || 'Silakan coba beberapa saat lagi.'}`);
    } finally {
      setIsDownloading(false);
      setDownloadStatus('');
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

        {/* Remotion Video Player Stage */}
        <div className="w-full aspect-story border-4 border-black brutal-shadow-xl relative overflow-hidden bg-black">
          <Player
            ref={playerRef}
            component={PersonalWrappedVideo}
            durationInFrames={600}
            compositionWidth={1080}
            compositionHeight={1920}
            fps={30}
            inputProps={{
              data,
              theme,
              isPro: isProActive,
              narration,
            }}
            style={{
              width: '100%',
              height: '100%',
            }}
            controls={false}
            loop
            autoPlay
            clickToPlay={false}
          />

          {/* Floating Play Indicator when paused */}
          {!isPlaying && (
            <div
              onClick={handleTogglePlay}
              className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer pointer-events-auto z-50"
            >
              <div className="w-16 h-16 bg-[#FFE500] border-3 border-black brutal-shadow flex items-center justify-center text-black">
                <Play className="w-8 h-8 fill-black translate-x-0.5" />
              </div>
            </div>
          )}

          {/* Downloading state overlay */}
          {isDownloading && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 text-center text-white z-50 space-y-3 font-mono-code">
              <FileVideo className="w-12 h-12 text-[#FFE500] animate-bounce" />
              <div className="font-display font-black text-xl text-white">
                PREPARING 9:16 BROADCAST MP4...
              </div>
              <div className="text-xs text-neutral-300 font-bold text-[#FFE500]">
                {downloadStatus || 'Rendering personalized 3D video with Remotion...'}
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
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
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
              disabled={isDownloading}
              className={`px-4 py-2 border-2 border-black font-display font-black text-xs uppercase tracking-wider brutal-btn flex items-center gap-1.5 ${
                isDownloading
                  ? 'bg-neutral-200 text-neutral-600 cursor-not-allowed'
                  : isProActive
                  ? 'bg-gradient-to-r from-[#FFE500] to-[#D2FF3A] text-black shadow-[3px_3px_0px_#000]'
                  : 'bg-black text-[#D2FF3A]'
              }`}
            >
              <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>
                {isDownloading
                  ? 'RENDERING MP4...'
                  : isProActive
                  ? `DOWNLOAD VIP (${videoFormat.toUpperCase()})`
                  : `DOWNLOAD 9:16 (${videoFormat.toUpperCase()})`}
              </span>
            </button>
          </div>

          {/* Active Rendering Status Banner */}
          {isDownloading && (
            <div className="w-full mt-2 p-2.5 bg-[#FFE500] border-2 border-black text-xs font-mono-code font-bold text-black flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000]">
              <Sparkles className="w-4 h-4 animate-spin text-black" />
              <span>{downloadStatus || 'Rendering personalized 3D video recap...'}</span>
            </div>
          )}

          {/* Format Selector Bar */}
          <div className="flex items-center justify-between pt-2 border-t-2 border-black text-xs">
            <span className="font-mono-code text-[11px] text-neutral-700 font-bold uppercase">
              Format:
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setVideoFormat('mp4')}
                disabled={isDownloading}
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
                disabled={isDownloading}
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
                  Model: gemini-3.8-flash · Remotion Cinematic Motion Engine
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
                  4-Scene Remotion Timeline (20s)
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
              <span><strong>Remotion Interpolation:</strong> Zero jitter, frame-deterministic Bézier & cubic easing.</span>
            </li>
            <li className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-black" />
              <span><strong>TransitionSeries Flow:</strong> Orchestrated seamless transitions between 4 story scenes.</span>
            </li>
            <li className="flex items-center gap-2">
              <Crown className="w-3.5 h-3.5 text-black" />
              <span><strong>VIP Stardust & Sheen:</strong> Specular metallic sweep, golden particles, and holographic seal.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
