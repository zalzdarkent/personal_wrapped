import React, { useState } from 'react';
import { StorySlide, ThemeConfig, ViewRoute, WrappedData } from '../types';
import { StoryViewer } from '../components/StoryViewer';
import { StoryCard } from '../components/StoryCard';
import { VideoRecapPlayer } from '../components/VideoRecapPlayer';
import { generateStorySlides } from '../utils/recapEngine';
import { trackEvent } from '../utils/analytics';
import {
  Share2,
  Download,
  Sparkles,
  ArrowRight,
  Layers,
  Play,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Flame,
  Lock,
  Video
} from 'lucide-react';

interface ResultViewProps {
  data: WrappedData;
  theme: ThemeConfig;
  onThemeChange: (theme: ThemeConfig) => void;
  isPremiumUnlocked: boolean;
  onNavigate: (route: ViewRoute) => void;
  onOpenUpgradeModal: () => void;
  onOpenExportModal: () => void;
  onOpenShareModal: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  data,
  theme,
  onThemeChange,
  isPremiumUnlocked,
  onNavigate,
  onOpenUpgradeModal,
  onOpenExportModal,
  onOpenShareModal,
}) => {
  const [viewMode, setViewMode] = useState<'video' | 'story' | 'grid'>('video');
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);
  const slides = generateStorySlides(isPremiumUnlocked);

  React.useEffect(() => {
    trackEvent('result_viewed', { id: data.id, category: data.category });
  }, [data.id, data.category]);

  const handleOpenSlideFromGrid = (idx: number) => {
    setSelectedSlideIndex(idx);
    setViewMode('story');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Top Banner & Viral Attribution */}
      <div className="p-4 bg-[#FFE500] border-4 border-black brutal-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black text-[#FFE500] flex items-center justify-center font-display font-black text-lg">
            ★
          </div>
          <div>
            <div className="font-display font-black text-lg sm:text-xl text-black">
              {data.userName.toUpperCase()}'S 2026 DOSSIER
            </div>
            <div className="text-xs font-mono-code text-neutral-800">
              Archetype: <strong className="underline">{data.archetype.title}</strong> · Top {100 - data.percentileRank}%
            </div>
          </div>
        </div>

        {/* Viral Action */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onOpenShareModal}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-black text-white font-display font-black text-xs uppercase tracking-wider border-2 border-black brutal-btn flex items-center justify-center gap-1.5"
          >
            <Share2 className="w-4 h-4 text-[#FFE500]" />
            SHARE LINK
          </button>
          <button
            onClick={() => onNavigate('create')}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-black font-display font-black text-xs uppercase tracking-wider border-2 border-black brutal-btn flex items-center justify-center gap-1.5 hover:bg-neutral-100"
          >
            <Sparkles className="w-4 h-4 text-black" />
            CREATE YOURS
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-black pb-4 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Video mode button */}
          <button
            onClick={() => setViewMode('video')}
            className={`px-3.5 py-2 border-2 border-black font-display font-black text-xs uppercase brutal-btn flex items-center gap-1.5 ${
              viewMode === 'video' ? 'bg-[#FFE500] text-black shadow-[3px_3px_0px_#000]' : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-black" />
            9:16 Video Recap (AI)
          </button>

          {/* Stories mode button */}
          <button
            onClick={() => setViewMode('story')}
            className={`px-3.5 py-2 border-2 border-black font-display font-bold text-xs uppercase brutal-btn flex items-center gap-1.5 ${
              viewMode === 'story' ? 'bg-black text-[#FFE500]' : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Stories Deck
          </button>

          {/* Grid mode button */}
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3.5 py-2 border-2 border-black font-display font-bold text-xs uppercase brutal-btn flex items-center gap-1.5 ${
              viewMode === 'grid' ? 'bg-black text-[#FFE500]' : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Grid View ({slides.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {!isPremiumUnlocked && (
            <button
              onClick={onOpenUpgradeModal}
              className="px-3 py-1.5 bg-[#D2FF3A] border-2 border-black text-black font-display font-black text-xs uppercase brutal-btn flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              UNLOCK 8 SLIDES (PRO)
            </button>
          )}

          <button
            onClick={onOpenExportModal}
            className="px-3 py-1.5 bg-white border-2 border-black text-black font-display font-bold text-xs uppercase brutal-btn flex items-center gap-1 hover:bg-neutral-100"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT ASSETS
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'video' ? (
        <div className="py-2">
          <VideoRecapPlayer
            data={data}
            theme={theme}
            onOpenShareModal={onOpenShareModal}
          />
        </div>
      ) : viewMode === 'story' ? (
        <div className="py-4">
          <StoryViewer
            slides={slides}
            data={data}
            activeTheme={theme}
            onThemeChange={onThemeChange}
            isPremiumUnlocked={isPremiumUnlocked}
            onOpenUpgradeModal={onOpenUpgradeModal}
            onOpenExportModal={onOpenExportModal}
            onOpenShareModal={onOpenShareModal}
            initialSlideIndex={selectedSlideIndex}
          />
        </div>
      ) : (
        /* Grid Overview of all slides */
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono-code font-bold uppercase text-neutral-700">
              TAP ANY CARD TO PLAY IN FULL STORY MODE
            </span>
            <span className="text-[11px] font-mono-code text-neutral-500">
              8:9 PROPORTIONED DOSSIER DECK
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {slides.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => handleOpenSlideFromGrid(idx)}
                className="flex flex-col space-y-2 cursor-pointer group"
              >
                <div className="flex items-center justify-between font-mono-code text-xs font-bold text-neutral-800 px-1 group-hover:text-black">
                  <span className="group-hover:underline">0{idx + 1}. {s.type.toUpperCase()}</span>
                  {s.isPremium && !isPremiumUnlocked && <Lock className="w-3.5 h-3.5 text-neutral-500" />}
                </div>

                <div className="w-full aspect-story relative overflow-hidden transition-transform duration-150 group-hover:-translate-y-1">
                  <StoryCard
                    slide={s}
                    data={data}
                    theme={theme}
                    removeWatermark={isPremiumUnlocked}
                    isCompact={true}
                  />

                  {/* Hover indicator overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center pointer-events-none">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black text-[#FFE500] px-2.5 py-1 text-[10px] font-mono-code font-bold border border-black shadow-[2px_2px_0px_#FFE500]">
                      ▶ PLAY SLIDE
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recipient / Friend Viral Loop Callout */}
      <div className="p-8 bg-black text-white border-4 border-black brutal-shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="font-mono-code text-xs font-bold uppercase text-[#D2FF3A]">
            INSPIRED BY THIS RECAP?
          </span>
          <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
            CREATE YOUR OWN 2026 WRAPPED NOW.
          </h3>
          <p className="text-xs text-neutral-300 max-w-lg leading-relaxed">
            Generate your own 9:16 story deck with your achievements, top hours, and custom archetype in less than 2 minutes. Free and private.
          </p>
        </div>

        <button
          onClick={() => {
            trackEvent('organic-visits-from-shares', { referredBy: data.id });
            onNavigate('create');
          }}
          className="px-8 py-4 bg-[#FFE500] text-black font-display font-black text-sm uppercase tracking-wider border-2 border-black brutal-btn brutal-shadow shrink-0 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          START YOUR WRAPPED
        </button>
      </div>
    </div>
  );
};
