import React, { useEffect, useState, useRef } from 'react';
import { StorySlide, ThemeConfig, WrappedData } from '../types';
import { StoryCard } from './StoryCard';
import { THEMES } from '../data/themes';
import { playStoryAdvanceSound, playStoryBackSound, playAchievementSound } from '../utils/sound';
import { trackEvent } from '../utils/analytics';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Share2,
  Download,
  Lock,
  Palette,
  Sparkles,
  Maximize2
} from 'lucide-react';

interface StoryViewerProps {
  slides: StorySlide[];
  data: WrappedData;
  activeTheme: ThemeConfig;
  onThemeChange: (theme: ThemeConfig) => void;
  isPremiumUnlocked: boolean;
  onOpenUpgradeModal: () => void;
  onOpenExportModal: () => void;
  onOpenShareModal: () => void;
  initialSlideIndex?: number;
}

const SLIDE_DURATION = 5000; // 5 seconds per slide

export const StoryViewer: React.FC<StoryViewerProps> = ({
  slides,
  data,
  activeTheme,
  onThemeChange,
  isPremiumUnlocked,
  onOpenUpgradeModal,
  onOpenExportModal,
  onOpenShareModal,
  initialSlideIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (initialSlideIndex !== undefined && initialSlideIndex >= 0 && initialSlideIndex < slides.length) {
      setCurrentIndex(initialSlideIndex);
      setProgress(0);
    }
  }, [initialSlideIndex]);

  const currentSlide = slides[currentIndex] || slides[0];
  const isCurrentSlideLocked = currentSlide.isPremium && !isPremiumUnlocked;

  // Auto-advance progress timer
  useEffect(() => {
    if (!isPlaying || isCurrentSlideLocked) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const step = 50; // update every 50ms
    const increment = (step / SLIDE_DURATION) * 100;

    progressIntervalRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, step);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentIndex, isPlaying, isCurrentSlideLocked, slides.length]);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextSlide = slides[currentIndex + 1];
      if (nextSlide.isPremium && !isPremiumUnlocked) {
        setIsPlaying(false);
        setCurrentIndex(currentIndex + 1);
        setProgress(0);
        trackEvent('premium-slide-blocked', { slideId: nextSlide.id });
        return;
      }
      playStoryAdvanceSound();
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else {
      setIsPlaying(false);
      setProgress(100);
      playAchievementSound();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      playStoryBackSound();
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    }
  };

  const handleSelectSlide = (idx: number) => {
    const target = slides[idx];
    if (target.isPremium && !isPremiumUnlocked) {
      setIsPlaying(false);
      setCurrentIndex(idx);
      setProgress(0);
      return;
    }
    playStoryAdvanceSound();
    setCurrentIndex(idx);
    setProgress(0);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto">
      {/* 9:16 Story Stage */}
      <div className="w-full relative aspect-story bg-neutral-900 border-4 border-black brutal-shadow-lg overflow-hidden group">
        {/* Story Progress Segmented Bars */}
        <div className="absolute top-2 left-3 right-3 z-30 flex items-center gap-1.5 pointer-events-none">
          {slides.map((s, idx) => {
            let fillPct = 0;
            if (idx < currentIndex) fillPct = 100;
            else if (idx === currentIndex) fillPct = progress;

            return (
              <div
                key={s.id}
                className="h-1.5 flex-1 bg-black/40 overflow-hidden border border-black"
              >
                <div
                  className="h-full bg-white transition-all duration-75"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Tap Hotspots for Left & Right Navigation */}
        <div className="absolute inset-0 z-20 flex">
          <div
            onClick={handlePrev}
            className="w-1/3 h-full cursor-pointer opacity-0 hover:opacity-10 bg-black/10 transition-opacity"
            title="Previous slide"
          />
          <div
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-1/3 h-full cursor-pointer opacity-0 hover:opacity-10 bg-black/10 transition-opacity"
            title={isPlaying ? 'Pause' : 'Play'}
          />
          <div
            onClick={handleNext}
            className="w-1/3 h-full cursor-pointer opacity-0 hover:opacity-10 bg-black/10 transition-opacity"
            title="Next slide"
          />
        </div>

        {/* Active Slide Card */}
        <StoryCard
          slide={currentSlide}
          data={data}
          theme={activeTheme}
          removeWatermark={isPremiumUnlocked}
        />

        {/* Premium Lock Overlay for VIP Slides */}
        {isCurrentSlideLocked && (
          <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-14 h-14 bg-[#FFE500] text-black border-2 border-black flex items-center justify-center mb-4 brutal-shadow">
              <Lock className="w-7 h-7" />
            </div>
            <div className="inline-block px-2.5 py-1 bg-[#D2FF3A] text-black font-mono-code font-bold text-xs uppercase mb-2">
              PREMIUM SLIDE UNLOCK
            </div>
            <h3 className="font-display font-black text-2xl mb-2 text-white">
              {currentSlide.title}
            </h3>
            <p className="text-xs text-neutral-300 max-w-xs mb-6 leading-relaxed">
              Unlock deep telemetry, monthly charts, custom themes, and watermark-free 1080x1920 exports.
            </p>
            <button
              onClick={onOpenUpgradeModal}
              className="px-6 py-3 bg-[#FFE500] text-black font-display font-black text-sm uppercase tracking-wider border-2 border-black brutal-btn brutal-shadow flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Unlock 8-Slide Recap (Rp 25.000)
            </button>
          </div>
        )}
      </div>

      {/* Floating Story Deck Controls */}
      <div className="w-full mt-4 bg-white border-2 border-black p-3 flex items-center justify-between gap-2 brutal-shadow">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2 border-2 border-black bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed brutal-btn"
            title="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4 text-black" />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 border-2 border-black bg-white hover:bg-neutral-100 brutal-btn"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-black" /> : <Play className="w-4 h-4 text-black" />}
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex === slides.length - 1}
            className="p-2 border-2 border-black bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed brutal-btn"
            title="Next Slide"
          >
            <ChevronRight className="w-4 h-4 text-black" />
          </button>
          <span className="font-mono-code font-bold text-xs ml-1 text-neutral-800">
            {currentIndex + 1}/{slides.length}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsThemePickerOpen(!isThemePickerOpen)}
              className="p-2 border-2 border-black bg-white hover:bg-neutral-100 brutal-btn flex items-center gap-1"
              title="Change Theme Palette"
            >
              <Palette className="w-4 h-4 text-black" />
            </button>

            {isThemePickerOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-48 bg-white border-2 border-black p-2 brutal-shadow-lg z-50">
                <div className="text-[11px] font-mono-code font-bold uppercase text-neutral-600 mb-2 px-1">
                  Select Theme
                </div>
                <div className="space-y-1">
                  {THEMES.map((theme) => {
                    const isLocked = theme.isVip && !isPremiumUnlocked;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => {
                          if (isLocked) {
                            onOpenUpgradeModal();
                          } else {
                            onThemeChange(theme);
                            setIsThemePickerOpen(false);
                          }
                        }}
                        className={`w-full text-left px-2 py-1.5 border border-black flex items-center justify-between text-xs font-bold transition-all ${
                          activeTheme.id === theme.id ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 border border-black inline-block shrink-0"
                            style={{ backgroundColor: theme.cardBg }}
                          />
                          <span className="truncate">{theme.name}</span>
                        </div>
                        {isLocked && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Export PNG */}
          <button
            onClick={onOpenExportModal}
            className="p-2 border-2 border-black bg-white hover:bg-neutral-100 brutal-btn flex items-center gap-1"
            title="Export 9:16 Social Image"
          >
            <Download className="w-4 h-4 text-black" />
            <span className="text-xs font-display font-black hidden sm:inline">EXPORT</span>
          </button>

          {/* Share */}
          <button
            onClick={onOpenShareModal}
            className="px-3 py-2 border-2 border-black bg-[#FFE500] hover:bg-yellow-400 brutal-btn brutal-shadow-sm flex items-center gap-1.5"
            title="Share Recap"
          >
            <Share2 className="w-4 h-4 text-black" />
            <span className="text-xs font-display font-black text-black">SHARE</span>
          </button>
        </div>
      </div>

      {/* Slide Thumbnails Selector */}
      <div className="w-full mt-3 flex items-center gap-1.5 overflow-x-auto pb-2">
        {slides.map((s, idx) => {
          const isSelected = idx === currentIndex;
          const isLocked = s.isPremium && !isPremiumUnlocked;
          return (
            <button
              key={s.id}
              onClick={() => handleSelectSlide(idx)}
              className={`h-11 px-2.5 shrink-0 border-2 border-black text-xs font-mono-code font-bold flex items-center gap-1.5 transition-all ${
                isSelected
                  ? 'bg-black text-[#FFE500] brutal-shadow-sm'
                  : 'bg-white text-black hover:bg-neutral-100'
              }`}
            >
              <span>{idx + 1}</span>
              <span className="hidden sm:inline text-[10px] uppercase font-sans font-bold">
                {s.type.replace('_', ' ')}
              </span>
              {isLocked && <Lock className="w-2.5 h-2.5 text-neutral-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
