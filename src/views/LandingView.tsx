import React from 'react';
import { ViewRoute, WrappedData } from '../types';
import { SAMPLE_PRESETS } from '../data/samplePresets';
import { THEMES } from '../data/themes';
import { StoryViewer } from '../components/StoryViewer';
import { generateStorySlides } from '../utils/recapEngine';
import { trackEvent } from '../utils/analytics';
import {
  Sparkles,
  ArrowRight,
  Code,
  Music,
  Gamepad2,
  BookOpen,
  Activity,
  Share2,
  Shield,
  Download,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface LandingViewProps {
  onNavigate: (route: ViewRoute) => void;
  onSelectRecap: (data: WrappedData) => void;
  isPremiumUnlocked: boolean;
  onOpenUpgradeModal: () => void;
  onOpenExportModal: () => void;
  onOpenShareModal: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onNavigate,
  onSelectRecap,
  isPremiumUnlocked,
  onOpenUpgradeModal,
  onOpenExportModal,
  onOpenShareModal,
}) => {
  const [activeTheme, setActiveTheme] = React.useState(THEMES[0]);
  const previewData = SAMPLE_PRESETS.github;
  const slides = generateStorySlides(isPremiumUnlocked);

  React.useEffect(() => {
    trackEvent('landing_view');
  }, []);

  const handleStartFromPreset = (presetKey: string) => {
    const data = SAMPLE_PRESETS[presetKey];
    if (data) {
      trackEvent('start_creation', { source: 'preset_landing', category: data.category });
      onSelectRecap(data);
      onNavigate('result');
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="pt-10 sm:pt-16 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Value Prop */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#D2FF3A] font-mono-code text-xs font-bold uppercase tracking-wider">
              <span>★ 2026 EDITION</span>
              <span>·</span>
              <span>NEO-BRUTALIST STORY RECAP</span>
            </div>

            <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl leading-[0.98] tracking-tight text-black text-balance">
              TURN YOUR YEAR INTO A <span className="bg-[#FFE500] px-2 inline-block border-2 border-black rotate-1">SHAREABLE</span> MASTERPIECE.
            </h1>

            <p className="text-base sm:text-lg text-neutral-800 max-w-xl font-medium leading-relaxed">
              Don't wait for December algorithms. Convert your GitHub commits, Spotify minutes, gaming conquests, reading logs, and fitness milestones into bold, high-contrast 9:16 recap stories in under 2 minutes.
            </p>

            {/* Instant Live Scanner Bar */}
            <div className="p-4 bg-white border-3 border-black brutal-shadow space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono-code font-bold uppercase text-neutral-800">
                <span className="flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-black" />
                  Instant Live Public Scanner:
                </span>
                <span className="bg-[#FFE500] px-1.5 py-0.5 border border-black text-[10px]">
                  GITHUB · SPOTIFY · STEAM
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Enter GitHub username or URL (e.g. torvalds)"
                  id="hero-scan-input"
                  className="flex-1 p-3 bg-neutral-50 border-2 border-black font-mono-code text-xs text-black focus:bg-white focus:outline-hidden"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (val) {
                        onNavigate('create');
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const inputEl = document.getElementById('hero-scan-input') as HTMLInputElement;
                    const val = inputEl?.value?.trim();
                    trackEvent('start_creation', { source: 'hero_instant_scanner', query: val });
                    onNavigate('create');
                  }}
                  className="px-5 py-3 bg-[#FFE500] border-2 border-black text-black font-display font-black text-xs uppercase tracking-wider brutal-btn flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  SCAN REAL RECAP
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-mono-code text-neutral-600">
                <span className="font-bold">Try live profile:</span>
                {['torvalds', 'shadcn', 'antfu', 'gaearon'].map((u) => (
                  <button
                    key={u}
                    onClick={() => {
                      const inputEl = document.getElementById('hero-scan-input') as HTMLInputElement;
                      if (inputEl) inputEl.value = u;
                      onNavigate('create');
                    }}
                    className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 border border-black text-neutral-900 font-bold"
                  >
                    @{u}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  trackEvent('start_creation', { source: 'hero_primary_btn' });
                  onNavigate('create');
                }}
                className="px-6 py-3.5 bg-black border-3 border-black text-[#FFE500] font-display font-black text-sm uppercase tracking-wider brutal-btn brutal-shadow flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                CREATE CUSTOM WRAPPED
              </button>

              <button
                onClick={() => onNavigate('explore')}
                className="px-5 py-3.5 bg-white border-3 border-black text-black font-display font-bold text-sm uppercase tracking-wider brutal-btn brutal-shadow-sm flex items-center gap-2 hover:bg-neutral-50"
              >
                EXPLORE PRESETS
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Proof Badges */}
            <div className="pt-4 border-t-2 border-black/10 grid grid-cols-3 gap-4 text-xs font-mono-code text-neutral-800">
              <div>
                <strong className="block text-black font-display font-black text-base sm:text-lg">9:16</strong>
                Social Format
              </div>
              <div>
                <strong className="block text-black font-display font-black text-base sm:text-lg">0 SDC</strong>
                Private & Local
              </div>
              <div>
                <strong className="block text-black font-display font-black text-base sm:text-lg">&lt; 2 MIN</strong>
                Idea to Share
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Story Preview */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="font-mono-code text-xs font-bold text-neutral-700 uppercase">
                  LIVE INTERACTIVE DEMO (TAP TO TEST)
                </span>
                <span className="text-[11px] font-mono-code bg-black text-[#FFE500] px-1.5 py-0.5">
                  GITHUB 2026
                </span>
              </div>
              <StoryViewer
                slides={slides}
                data={previewData}
                activeTheme={activeTheme}
                onThemeChange={setActiveTheme}
                isPremiumUnlocked={isPremiumUnlocked}
                onOpenUpgradeModal={onOpenUpgradeModal}
                onOpenExportModal={onOpenExportModal}
                onOpenShareModal={onOpenShareModal}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Domain Categories Carousel / Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="border-t-2 border-black pt-12 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-block px-2.5 py-0.5 bg-black text-white font-mono-code font-bold text-xs uppercase mb-2">
                SUPPORTED DOMAINS
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl text-black">
                WRAPPED RECAPS FOR EVERY PURSUIT
              </h2>
            </div>
            <button
              onClick={() => onNavigate('explore')}
              className="text-xs font-mono-code font-bold uppercase underline underline-offset-4 text-black hover:text-neutral-600"
            >
              View all 6 presets & templates →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: GitHub */}
            <div className="p-6 bg-white border-3 border-black brutal-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-black text-[#D2FF3A] border-2 border-black flex items-center justify-center mb-4">
                  <Code className="w-5 h-5" />
                </div>
                <h3 className="font-display font-black text-xl text-black mb-1">
                  GitHub & Developer
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                  Highlight commit volume, PR merges, night owl coding hours, primary tech stack, and git quirks.
                </p>
                <div className="text-xs font-mono-code text-neutral-800 bg-neutral-100 p-2 border border-black mb-4">
                  Metric: 2,847 Commits · Top 1%
                </div>
              </div>
              <button
                onClick={() => handleStartFromPreset('github')}
                className="w-full py-2.5 bg-[#FFE500] border-2 border-black text-black font-display font-black text-xs uppercase tracking-wide brutal-btn flex items-center justify-center gap-1.5"
              >
                <span>OPEN DEV RECAP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 2: Spotify */}
            <div className="p-6 bg-white border-3 border-black brutal-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-black text-[#00F0FF] border-2 border-black flex items-center justify-center mb-4">
                  <Music className="w-5 h-5" />
                </div>
                <h3 className="font-display font-black text-xl text-black mb-1">
                  Audio & Music
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                  Total streaming minutes, top 5 obsessed tracks, diverse genres explored, and your music listener archetype.
                </p>
                <div className="text-xs font-mono-code text-neutral-800 bg-neutral-100 p-2 border border-black mb-4">
                  Metric: 78,420 Min · Sonic Nomad
                </div>
              </div>
              <button
                onClick={() => handleStartFromPreset('spotify')}
                className="w-full py-2.5 bg-[#00F0FF] border-2 border-black text-black font-display font-black text-xs uppercase tracking-wide brutal-btn flex items-center justify-center gap-1.5"
              >
                <span>OPEN MUSIC RECAP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 3: Steam / Gaming */}
            <div className="p-6 bg-white border-3 border-black brutal-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-black text-[#FF5A36] border-2 border-black flex items-center justify-center mb-4">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <h3 className="font-display font-black text-xl text-black mb-1">
                  Gaming & Steam
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                  Hours logged, backlog games cleared, hardest achievements unlocked, and completionist stats.
                </p>
                <div className="text-xs font-mono-code text-neutral-800 bg-neutral-100 p-2 border border-black mb-4">
                  Metric: 1,140 Hours · Boss Melter
                </div>
              </div>
              <button
                onClick={() => handleStartFromPreset('gaming')}
                className="w-full py-2.5 bg-[#FF5A36] border-2 border-black text-white font-display font-black text-xs uppercase tracking-wide brutal-btn flex items-center justify-center gap-1.5"
              >
                <span>OPEN GAMING RECAP</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core User Flow / How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="p-8 bg-[#FFE500] border-4 border-black brutal-shadow-lg">
          <div className="max-w-2xl mb-8">
            <span className="font-mono-code text-xs font-bold uppercase text-black bg-white px-2 py-0.5 border border-black">
              SIMPLE 3-STEP FLOW
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-black mt-2">
              HOW PERSONAL YEAR WRAPPED WORKS
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 bg-white border-2 border-black brutal-shadow-sm">
              <div className="font-mono-code font-black text-2xl text-black mb-2">
                01.
              </div>
              <h3 className="font-display font-black text-lg text-black mb-1">
                Import or Select Domain
              </h3>
              <p className="text-xs text-neutral-700 leading-relaxed">
                Choose GitHub, Spotify, Steam, Goodreads, Strava, or manually fill your standout numbers in 30 seconds.
              </p>
            </div>

            <div className="p-5 bg-white border-2 border-black brutal-shadow-sm">
              <div className="font-mono-code font-black text-2xl text-black mb-2">
                02.
              </div>
              <h3 className="font-display font-black text-lg text-black mb-1">
                Recap Engine Normalization
              </h3>
              <p className="text-xs text-neutral-700 leading-relaxed">
                Our engine automatically calculates your personality archetype, percentile ranking, and standout peak days.
              </p>
            </div>

            <div className="p-5 bg-white border-2 border-black brutal-shadow-sm">
              <div className="font-mono-code font-black text-2xl text-black mb-2">
                03.
              </div>
              <h3 className="font-display font-black text-lg text-black mb-1">
                9:16 Reveal & Viral Share
              </h3>
              <p className="text-xs text-neutral-700 leading-relaxed">
                Tap through your interactive story deck, export 1080x1920 PNG cards, and share deep links with friends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Local Privacy Note */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="p-6 bg-white border-3 border-black brutal-shadow flex flex-col sm:flex-row items-center gap-6">
          <div className="w-14 h-14 bg-black text-[#D2FF3A] border-2 border-black flex items-center justify-center shrink-0">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg text-black mb-1">
              Safety, Privacy & User Data Control
            </h3>
            <p className="text-xs text-neutral-700 leading-relaxed">
              Your activity stats and recaps are stored locally in your browser session. We do not sell your personal data or harvest credentials. Archetypes are designed for celebration, motivation, and entertainment.
            </p>
          </div>
          <button
            onClick={() => onNavigate('create')}
            className="px-5 py-3 bg-black text-[#FFE500] font-display font-black text-xs uppercase tracking-wider border-2 border-black brutal-btn shrink-0"
          >
            START NOW
          </button>
        </div>
      </section>
    </div>
  );
};
