import React from 'react';
import { StorySlide, ThemeConfig, WrappedData } from '../types';
import {
  Sparkles,
  Trophy,
  Flame,
  Calendar,
  Award,
  BarChart3,
  Star,
  Compass,
  Music,
  Code,
  Gamepad2,
  BookOpen,
  Activity
} from 'lucide-react';

interface StoryCardProps {
  slide: StorySlide;
  data: WrappedData;
  theme: ThemeConfig;
  removeWatermark?: boolean;
  isCompact?: boolean;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  slide,
  data,
  theme,
  removeWatermark = false,
  isCompact = false,
}) => {
  const getCategoryIcon = () => {
    switch (data.category) {
      case 'github': return <Code className={isCompact ? "w-3 h-3" : "w-4 h-4"} />;
      case 'spotify': return <Music className={isCompact ? "w-3 h-3" : "w-4 h-4"} />;
      case 'gaming': return <Gamepad2 className={isCompact ? "w-3 h-3" : "w-4 h-4"} />;
      case 'reading': return <BookOpen className={isCompact ? "w-3 h-3" : "w-4 h-4"} />;
      case 'fitness': return <Activity className={isCompact ? "w-3 h-3" : "w-4 h-4"} />;
      default: return <Compass className={isCompact ? "w-3 h-3" : "w-4 h-4"} />;
    }
  };

  return (
    <div
      className={`w-full h-full flex flex-col justify-between relative select-none overflow-hidden transition-colors duration-200 ${
        isCompact
          ? 'p-3.5 border-3 border-black shadow-[3px_3px_0px_#000]'
          : 'p-6 sm:p-7 border-4 border-black shadow-[6px_6px_0px_#000]'
      }`}
      style={{
        backgroundColor: theme.cardBg,
      }}
    >
      {/* Top Header Badge */}
      <div className={`z-10 flex items-center justify-between gap-2 border-b-2 border-black ${isCompact ? 'pb-1.5' : 'pb-3'}`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <div className={`${isCompact ? 'w-5 h-5' : 'w-7 h-7'} bg-black text-[#FFE500] flex items-center justify-center font-bold shrink-0`}>
            {getCategoryIcon()}
          </div>
          <div className="truncate">
            <div className={`font-display font-black uppercase tracking-wider text-black truncate ${isCompact ? 'text-[11px]' : 'text-xs'}`}>
              {data.userName}
            </div>
            <div className={`font-mono-code text-neutral-700 truncate ${isCompact ? 'text-[9px]' : 'text-[11px]'}`}>
              {data.handle}
            </div>
          </div>
        </div>

        <div className={`bg-black text-[#FFE500] font-mono-code font-bold border border-black shrink-0 ${
          isCompact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs shadow-[2px_2px_0px_#FFE500]'
        }`}>
          {data.year} RECAP
        </div>
      </div>

      {/* Main Slide Content */}
      <div className="my-auto z-10 flex flex-col justify-center py-1">
        {/* ========================================== */}
        {/* SLIDE 1: INTRO */}
        {/* ========================================== */}
        {slide.type === 'intro' && (
          <div className={`${isCompact ? 'space-y-2' : 'space-y-5'} animate-in fade-in zoom-in-95 duration-200`}>
            <div className={`inline-block bg-black text-white font-mono-code font-bold uppercase tracking-wider ${
              isCompact ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-xs'
            }`}>
              ANNUAL DOSSIER · {data.category.toUpperCase()}
            </div>

            <h2 className={`font-display font-black leading-[1.05] tracking-tight text-black ${
              isCompact ? 'text-lg sm:text-xl' : 'text-4xl sm:text-5xl'
            }`}>
              2026 WAS AN ABSOLUTE{' '}
              <span className="bg-black text-[#D2FF3A] px-1.5 py-0.5 inline-block -rotate-1">
                MASTERCLASS
              </span>
            </h2>

            {!isCompact && (
              <p className="text-sm sm:text-base font-medium text-neutral-800 leading-relaxed">
                You pushed limits, defied the baseline, and left an undeniable mark across the past 365 days.
              </p>
            )}

            {/* Central Keystone Box */}
            <div className={`bg-black text-white border-2 border-black ${
              isCompact ? 'p-2.5 shadow-[2px_2px_0px_#000]' : 'p-4 shadow-[4px_4px_0px_#000]'
            }`}>
              <div className={`font-mono-code text-[#FFE500] uppercase tracking-wider ${
                isCompact ? 'text-[9px] mb-0.5' : 'text-[11px] mb-1'
              }`}>
                KEYSTONE METRIC
              </div>
              <div className={`font-display font-black text-white ${
                isCompact ? 'text-2xl leading-none' : 'text-3xl sm:text-4xl'
              }`}>
                {data.primaryMetric.value.toLocaleString()}
              </div>
              <div className={`font-bold text-[#D2FF3A] uppercase truncate ${
                isCompact ? 'text-[9px] mt-0.5' : 'text-xs mt-0.5'
              }`}>
                {data.primaryMetric.unit}
              </div>
            </div>

            <div className={`flex items-center gap-1.5 bg-white border-2 border-black font-mono-code text-black ${
              isCompact ? 'p-2 text-[9px] shadow-[2px_2px_0px_#000]' : 'p-3 text-xs shadow-[3px_3px_0px_#000]'
            }`}>
              <Trophy className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} text-black shrink-0`} />
              <span className="truncate">
                Calculated: <strong className="font-bold">{data.archetype.badgeLabel}</strong>
              </span>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* SLIDE 2: PRIMARY METRIC */}
        {/* ========================================== */}
        {slide.type === 'primary_metric' && (
          <div className={`${isCompact ? 'space-y-2' : 'space-y-4'} animate-in fade-in zoom-in-95 duration-200`}>
            <div className={`font-mono-code font-bold uppercase tracking-wider text-neutral-800 ${
              isCompact ? 'text-[9px]' : 'text-xs'
            }`}>
              [ 01 // THE HEADLINE NUMBER ]
            </div>

            <div className={`bg-black text-white border-3 border-black ${
              isCompact ? 'p-3 shadow-[3px_3px_0px_#000]' : 'p-5 shadow-[5px_5px_0px_#000]'
            }`}>
              <div className={`font-mono-code text-[#FFE500] uppercase tracking-wide truncate ${
                isCompact ? 'text-[9px] mb-1' : 'text-xs mb-2'
              }`}>
                {data.primaryMetric.label}
              </div>
              <div className={`font-display font-black text-white tracking-tight leading-none ${
                isCompact ? 'text-3xl mb-1' : 'text-5xl sm:text-6xl mb-2'
              }`}>
                {data.primaryMetric.value.toLocaleString()}
              </div>
              <div className={`inline-block bg-[#D2FF3A] text-black font-display font-black uppercase tracking-wide ${
                isCompact ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs'
              }`}>
                TOP {100 - data.percentileRank}% GLOBALLY
              </div>
            </div>

            {/* Secondary 2-grid */}
            <div className="grid grid-cols-2 gap-2">
              {data.secondaryMetrics.slice(0, 4).map((sec, idx) => (
                <div
                  key={idx}
                  className={`bg-white border-2 border-black ${
                    isCompact ? 'p-2 shadow-[2px_2px_0px_#000]' : 'p-3 shadow-[3px_3px_0px_#000]'
                  }`}
                >
                  <div className={`font-display font-black text-black truncate ${
                    isCompact ? 'text-sm' : 'text-lg sm:text-xl'
                  }`}>
                    {sec.value}
                  </div>
                  <div className={`font-bold text-neutral-600 uppercase leading-tight mt-0.5 truncate ${
                    isCompact ? 'text-[8px]' : 'text-[11px]'
                  }`}>
                    {sec.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* SLIDE 3: TOP 5 LIST */}
        {/* ========================================== */}
        {slide.type === 'top_list' && (
          <div className={`${isCompact ? 'space-y-1.5' : 'space-y-3'} animate-in fade-in zoom-in-95 duration-200`}>
            <div className="flex items-center justify-between">
              <div className={`font-mono-code font-bold uppercase tracking-wider text-neutral-800 ${
                isCompact ? 'text-[9px]' : 'text-xs'
              }`}>
                [ 02 // TOP 5 OBSESSIONS ]
              </div>
              <Star className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} text-black fill-black`} />
            </div>

            <div className={`${isCompact ? 'space-y-1' : 'space-y-2'}`}>
              {data.topItems.slice(0, 5).map((item, idx) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between gap-2 border-2 border-black transition-all ${
                    isCompact ? 'p-1.5' : 'p-2.5'
                  } ${
                    idx === 0
                      ? isCompact ? 'bg-black text-white' : 'bg-black text-white shadow-[4px_4px_0px_#FFE500]'
                      : isCompact ? 'bg-white text-black' : 'bg-white text-black shadow-[3px_3px_0px_#000]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`flex items-center justify-center font-mono-code font-bold shrink-0 ${
                        isCompact ? 'w-4 h-4 text-[9px]' : 'w-6 h-6 text-xs'
                      } ${
                        idx === 0 ? 'bg-[#FFE500] text-black' : 'bg-neutral-200 text-black'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <div className="truncate min-w-0">
                      <div className={`font-display font-black truncate ${
                        isCompact ? 'text-xs leading-tight' : 'text-sm'
                      }`}>
                        {item.name}
                      </div>
                      {item.subtitle && (
                        <div className={`truncate ${isCompact ? 'text-[8px]' : 'text-[10px]'} ${
                          idx === 0 ? 'text-neutral-300' : 'text-neutral-500'
                        }`}>
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`font-mono-code font-bold shrink-0 ${
                    isCompact ? 'text-[9px]' : 'text-xs'
                  } ${idx === 0 ? 'text-[#D2FF3A]' : 'text-black'}`}>
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* SLIDE 4: PEAK MOMENT & STREAK */}
        {/* ========================================== */}
        {slide.type === 'peak_moment' && (
          <div className={`${isCompact ? 'space-y-2' : 'space-y-4'} animate-in fade-in zoom-in-95 duration-200`}>
            <div className={`font-mono-code font-bold uppercase tracking-wider text-neutral-800 ${
              isCompact ? 'text-[9px]' : 'text-xs'
            }`}>
              [ 03 // THE PEAK & STREAK ]
            </div>

            {/* Peak Card */}
            <div className={`bg-black text-white border-3 border-black ${
              isCompact ? 'p-2.5 shadow-[2px_2px_0px_#000]' : 'p-4 shadow-[4px_4px_0px_#000]'
            }`}>
              <div className={`flex items-center gap-1 font-mono-code text-[#FF5A36] font-bold uppercase ${
                isCompact ? 'text-[9px] mb-1' : 'text-xs mb-2'
              }`}>
                <Calendar className={`${isCompact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'}`} />
                PEAK · {data.peakMoment.date}
              </div>
              <div className={`font-display font-black text-white truncate ${
                isCompact ? 'text-sm mb-1' : 'text-lg mb-1'
              }`}>
                {data.peakMoment.label}
              </div>
              <p className={`text-neutral-300 leading-relaxed ${
                isCompact ? 'text-[9px] line-clamp-2' : 'text-xs'
              }`}>
                {data.peakMoment.detail}
              </p>
            </div>

            {/* Streak Card */}
            <div className={`bg-[#D2FF3A] text-black border-3 border-black ${
              isCompact ? 'p-2.5 shadow-[2px_2px_0px_#000]' : 'p-4 shadow-[4px_4px_0px_#000]'
            }`}>
              <div className={`flex items-center gap-1 font-mono-code font-bold uppercase ${
                isCompact ? 'text-[9px] mb-0.5' : 'text-xs mb-1'
              }`}>
                <Flame className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} fill-black text-black`} />
                MAX STREAK
              </div>
              <div className={`font-display font-black leading-none ${
                isCompact ? 'text-2xl' : 'text-4xl'
              }`}>
                {data.streak.days} DAYS
              </div>
              <div className={`font-bold text-neutral-800 mt-1 truncate ${
                isCompact ? 'text-[9px]' : 'text-xs'
              }`}>
                {data.streak.description}
              </div>
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* SLIDE 5: ARCHETYPE */}
        {/* ========================================== */}
        {slide.type === 'archetype' && (
          <div className={`${isCompact ? 'space-y-2' : 'space-y-4'} animate-in fade-in zoom-in-95 duration-200`}>
            <div className={`inline-block bg-black text-[#FFE500] font-mono-code font-bold uppercase tracking-wider ${
              isCompact ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs'
            }`}>
              [ 04 // 2026 IDENTITY ]
            </div>

            <div className={`bg-black text-white border-3 border-black ${
              isCompact ? 'p-3 shadow-[3px_3px_0px_#000]' : 'p-5 shadow-[5px_5px_0px_#000]'
            }`}>
              <div className={`font-mono-code font-bold text-[#D2FF3A] uppercase tracking-wider ${
                isCompact ? 'text-[9px] mb-1' : 'text-xs mb-2'
              }`}>
                ★ {data.archetype.badgeLabel}
              </div>

              <h3 className={`font-display font-black text-white tracking-tight leading-tight ${
                isCompact ? 'text-base mb-1' : 'text-2xl sm:text-3xl mb-2'
              }`}>
                {data.archetype.title}
              </h3>

              <div className={`font-mono-code text-[#FFE500] truncate ${
                isCompact ? 'text-[9px] mb-1.5' : 'text-xs mb-3'
              }`}>
                "{data.archetype.tagline}"
              </div>

              <p className={`text-neutral-300 leading-relaxed ${
                isCompact ? 'text-[9px] line-clamp-3' : 'text-xs sm:text-sm'
              }`}>
                {data.archetype.description}
              </p>
            </div>

            {data.failOrQuirk && (
              <div className={`bg-white border-2 border-black ${
                isCompact ? 'p-2 shadow-[2px_2px_0px_#000]' : 'p-3 shadow-[3px_3px_0px_#000]'
              }`}>
                <div className={`font-mono-code font-bold text-[#FF5A36] uppercase truncate ${
                  isCompact ? 'text-[8px]' : 'text-[11px]'
                }`}>
                  {data.failOrQuirk.label}
                </div>
                <div className={`font-medium text-black mt-0.5 truncate ${
                  isCompact ? 'text-[9px]' : 'text-xs'
                }`}>
                  {data.failOrQuirk.description}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* SLIDE 6: DEEP STATS (PREMIUM) */}
        {/* ========================================== */}
        {slide.type === 'deep_stats' && (
          <div className={`${isCompact ? 'space-y-1.5' : 'space-y-4'} animate-in fade-in zoom-in-95 duration-200`}>
            <div className="flex items-center justify-between">
              <div className={`font-mono-code font-bold uppercase tracking-wider text-neutral-800 ${
                isCompact ? 'text-[9px]' : 'text-xs'
              }`}>
                [ PRO // ADVANCED TELEMETRY ]
              </div>
              <span className={`bg-black text-[#D2FF3A] font-mono-code font-bold ${
                isCompact ? 'px-1.5 py-0.5 text-[8px]' : 'px-2 py-0.5 text-[10px]'
              }`}>
                DEEP DIVE
              </span>
            </div>

            <div className={`${isCompact ? 'space-y-1.5' : 'space-y-2.5'}`}>
              {data.secondaryMetrics.slice(0, 4).map((sec, idx) => (
                <div
                  key={idx}
                  className={`bg-white border-2 border-black flex items-center justify-between ${
                    isCompact ? 'p-2 shadow-[2px_2px_0px_#000]' : 'p-3 shadow-[3px_3px_0px_#000]'
                  }`}
                >
                  <div className="truncate mr-2">
                    <div className={`font-mono-code uppercase text-neutral-600 ${
                      isCompact ? 'text-[8px]' : 'text-[11px]'
                    }`}>
                      METRIC {idx + 1}
                    </div>
                    <div className={`font-display font-bold text-black truncate ${
                      isCompact ? 'text-xs' : 'text-sm'
                    }`}>
                      {sec.label}
                    </div>
                  </div>
                  <div className={`font-display font-black text-black shrink-0 ${
                    isCompact ? 'text-sm' : 'text-xl'
                  }`}>
                    {sec.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================== */}
        {/* SLIDE 7: MONTHLY CHART (PREMIUM) */}
        {/* ========================================== */}
        {slide.type === 'monthly_chart' && (
          <div className={`${isCompact ? 'space-y-2' : 'space-y-4'} animate-in fade-in zoom-in-95 duration-200`}>
            <div className="flex items-center justify-between">
              <div className={`font-mono-code font-bold uppercase tracking-wider text-neutral-800 ${
                isCompact ? 'text-[9px]' : 'text-xs'
              }`}>
                [ PRO // 12-MONTH MOMENTUM ]
              </div>
              <BarChart3 className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} text-black`} />
            </div>

            {/* Bar chart */}
            <div className={`bg-black border-3 border-black text-white ${
              isCompact ? 'p-2.5 shadow-[2px_2px_0px_#000]' : 'p-4 shadow-[4px_4px_0px_#000]'
            }`}>
              <div className={`font-mono-code text-[#FFE500] uppercase ${
                isCompact ? 'text-[9px] mb-1.5' : 'text-[11px] mb-3'
              }`}>
                MONTHLY BREAKDOWN
              </div>

              <div className={`grid grid-cols-12 gap-0.5 sm:gap-1 items-end pt-1 border-b border-neutral-700 pb-1 ${
                isCompact ? 'h-20' : 'h-32'
              }`}>
                {(data.monthlyBreakdown || []).map((m, idx) => {
                  const maxVal = Math.max(...(data.monthlyBreakdown || []).map((x) => x.score), 1);
                  const heightPercent = Math.max(12, Math.round((m.score / maxVal) * 100));
                  const isPeak = m.score === maxVal;

                  return (
                    <div key={idx} className="flex flex-col items-center gap-0.5 h-full justify-end">
                      <div
                        className={`w-full transition-all border border-black ${
                          isPeak ? 'bg-[#FFE500]' : 'bg-[#D2FF3A]'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                      <span className="text-[8px] font-mono-code text-neutral-400">
                        {m.month[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[8px] sm:text-[10px] font-mono-code text-neutral-400 mt-1.5">
                <span>JAN</span>
                <span className="text-[#FFE500] font-bold">PEAK MOMENTUM</span>
                <span>DEC</span>
              </div>
            </div>

            {data.customQuote && !isCompact && (
              <div className="p-3 bg-white border-2 border-black text-xs font-medium text-black italic shadow-[3px_3px_0px_#000]">
                "{data.customQuote}"
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* SLIDE 8: FINAL SUMMARY DOSSIER */}
        {/* ========================================== */}
        {slide.type === 'final_card' && (
          <div className={`${isCompact ? 'space-y-2' : 'space-y-4'} animate-in fade-in zoom-in-95 duration-200`}>
            <div className={`bg-black text-white border-3 border-black ${
              isCompact ? 'p-2.5 shadow-[2px_2px_0px_#000]' : 'p-4 shadow-[4px_4px_0px_#000]'
            }`}>
              <div className={`font-mono-code text-[#FFE500] uppercase tracking-wider ${
                isCompact ? 'text-[8px] mb-0.5' : 'text-[11px] mb-1'
              }`}>
                OFFICIAL 2026 DOSSIER
              </div>
              <div className={`font-display font-black text-white truncate ${
                isCompact ? 'text-lg' : 'text-3xl'
              }`}>
                {data.userName}
              </div>
              <div className={`font-mono-code text-neutral-400 truncate ${
                isCompact ? 'text-[9px]' : 'text-xs'
              }`}>
                {data.handle} · {data.category.toUpperCase()}
              </div>

              <div className={`mt-2 pt-2 border-t border-neutral-800 grid grid-cols-2 gap-2`}>
                <div>
                  <div className="text-[8px] sm:text-[10px] text-neutral-400 font-mono-code truncate">PRIMARY</div>
                  <div className={`font-display font-black text-[#D2FF3A] truncate ${
                    isCompact ? 'text-sm' : 'text-xl'
                  }`}>
                    {data.primaryMetric.value.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[8px] sm:text-[10px] text-neutral-400 font-mono-code truncate">VERIFIED RANK</div>
                  <div className={`font-display font-black text-[#FFE500] truncate ${
                    isCompact ? 'text-sm' : 'text-xl'
                  }`}>
                    TOP {100 - data.percentileRank}%
                  </div>
                </div>
              </div>
            </div>

            {/* Archetype strip */}
            <div className={`bg-white border-2 border-black ${
              isCompact ? 'p-2 shadow-[2px_2px_0px_#000]' : 'p-3 shadow-[3px_3px_0px_#000]'
            }`}>
              <div className={`font-mono-code font-bold uppercase text-neutral-600 truncate ${
                isCompact ? 'text-[8px]' : 'text-[10px]'
              }`}>
                ARCHETYPE
              </div>
              <div className={`font-display font-black text-black truncate ${
                isCompact ? 'text-xs' : 'text-base'
              }`}>
                {data.archetype.title}
              </div>
              <div className={`text-neutral-700 truncate ${
                isCompact ? 'text-[9px]' : 'text-xs'
              }`}>
                {data.archetype.tagline}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subtle Footer Attribution */}
      <div className={`z-10 border-t-2 border-black flex items-center justify-between font-mono-code text-black ${
        isCompact ? 'pt-1.5 text-[9px]' : 'pt-3 text-[11px]'
      }`}>
        <span className="font-bold truncate mr-2">
          {removeWatermark ? data.userName.toUpperCase() : 'PERSONAL YEAR WRAPPED'}
        </span>
        <span className="font-bold text-neutral-800 shrink-0">
          {removeWatermark ? `2026 DOSSIER` : 'personalwrapped.app'}
        </span>
      </div>
    </div>
  );
};
