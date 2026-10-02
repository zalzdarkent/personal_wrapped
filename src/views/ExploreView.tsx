import React, { useState } from 'react';
import { ViewRoute, WrappedData } from '../types';
import { SAMPLE_PRESETS } from '../data/samplePresets';
import { THEMES } from '../data/themes';
import { trackEvent } from '../utils/analytics';
import {
  Code,
  Music,
  Gamepad2,
  BookOpen,
  Activity,
  Sparkles,
  ArrowRight,
  Copy,
  Trophy,
  Flame,
  Layers
} from 'lucide-react';

interface ExploreViewProps {
  onNavigate: (route: ViewRoute) => void;
  onSelectRecap: (data: WrappedData) => void;
  onCustomizePreset: (data: WrappedData) => void;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  onNavigate,
  onSelectRecap,
  onCustomizePreset,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'tech' | 'media' | 'active'>('all');

  const presetsList = Object.values(SAMPLE_PRESETS);

  const filteredPresets = presetsList.filter((p) => {
    if (activeFilter === 'tech') return p.category === 'github' || p.category === 'creator';
    if (activeFilter === 'media') return p.category === 'spotify' || p.category === 'gaming' || p.category === 'reading';
    if (activeFilter === 'active') return p.category === 'fitness';
    return true;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'github': return <Code className="w-4 h-4" />;
      case 'spotify': return <Music className="w-4 h-4" />;
      case 'gaming': return <Gamepad2 className="w-4 h-4" />;
      case 'reading': return <BookOpen className="w-4 h-4" />;
      case 'fitness': return <Activity className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      {/* Header */}
      <div className="border-b-2 border-black pb-8">
        <div className="inline-block px-2.5 py-0.5 bg-black text-[#FFE500] font-mono-code font-bold text-xs uppercase mb-2">
          EXPLORE DOSSIERS & TEMPLATES
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-black">
          ANNUAL WRAPPED TEMPLATES
        </h1>
        <p className="text-sm text-neutral-700 mt-2 max-w-xl">
          Browse real milestone recaps across engineering, audio streaming, gaming achievements, literary goals, and athletic endurance. Open any to experience the story or clone to make it yours.
        </p>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 border-2 border-black font-display font-bold text-xs uppercase brutal-btn ${
              activeFilter === 'all' ? 'bg-black text-[#FFE500]' : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            All Domains ({presetsList.length})
          </button>
          <button
            onClick={() => setActiveFilter('tech')}
            className={`px-4 py-2 border-2 border-black font-display font-bold text-xs uppercase brutal-btn ${
              activeFilter === 'tech' ? 'bg-black text-[#FFE500]' : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            Dev & Tech
          </button>
          <button
            onClick={() => setActiveFilter('media')}
            className={`px-4 py-2 border-2 border-black font-display font-bold text-xs uppercase brutal-btn ${
              activeFilter === 'media' ? 'bg-black text-[#FFE500]' : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            Entertainment & Media
          </button>
          <button
            onClick={() => setActiveFilter('active')}
            className={`px-4 py-2 border-2 border-black font-display font-bold text-xs uppercase brutal-btn ${
              activeFilter === 'active' ? 'bg-black text-[#FFE500]' : 'bg-white text-black hover:bg-neutral-100'
            }`}
          >
            Sports & Fitness
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPresets.map((preset) => (
          <div
            key={preset.id}
            className="p-6 bg-white border-4 border-black brutal-shadow flex flex-col justify-between"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 border-b-2 border-black pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-black text-[#FFE500] flex items-center justify-center font-bold">
                    {getCategoryIcon(preset.category)}
                  </div>
                  <span className="font-mono-code font-bold text-xs uppercase text-neutral-800">
                    {preset.category}
                  </span>
                </div>
                <span className="font-mono-code text-[11px] bg-[#FFE500] px-1.5 py-0.5 border border-black font-bold">
                  {preset.year}
                </span>
              </div>

              <h2 className="font-display font-black text-2xl text-black mb-1">
                {preset.title}
              </h2>
              <div className="font-mono-code text-xs text-neutral-600 mb-4">
                {preset.userName} ({preset.handle})
              </div>

              {/* Stat highlight */}
              <div className="p-3 bg-black text-white border-2 border-black mb-4">
                <div className="text-[10px] font-mono-code text-[#FFE500] uppercase">
                  {preset.primaryMetric.label}
                </div>
                <div className="font-display font-black text-2xl text-[#D2FF3A]">
                  {preset.primaryMetric.value.toLocaleString()} {preset.primaryMetric.unit}
                </div>
              </div>

              {/* Archetype snippet */}
              <div className="p-3 bg-neutral-100 border-2 border-black mb-4 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-mono-code font-bold text-neutral-800">
                  <Trophy className="w-3.5 h-3.5 text-black" />
                  <span>{preset.archetype.badgeLabel}</span>
                </div>
                <div className="font-display font-bold text-sm text-black">
                  {preset.archetype.title}
                </div>
                <p className="text-[11px] text-neutral-600 line-clamp-2">
                  {preset.archetype.tagline}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t-2 border-black">
              <button
                onClick={() => {
                  trackEvent('start_creation', { source: 'explore_play', presetId: preset.id });
                  onSelectRecap(preset);
                  onNavigate('result');
                }}
                className="w-full py-2.5 bg-[#FFE500] border-2 border-black text-black font-display font-black text-xs uppercase tracking-wide brutal-btn flex items-center justify-center gap-1.5"
              >
                <span>OPEN & PLAY STORY</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  trackEvent('start_creation', { source: 'explore_clone', presetId: preset.id });
                  onCustomizePreset(preset);
                  onNavigate('create');
                }}
                className="w-full py-2 border-2 border-black bg-white hover:bg-neutral-100 text-black font-display font-bold text-xs uppercase tracking-wide brutal-btn flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>CLONE & CUSTOMIZE</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
