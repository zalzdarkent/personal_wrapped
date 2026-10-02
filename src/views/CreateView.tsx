import React, { useState } from 'react';
import { CategoryType, ThemeConfig, TopItem, ViewRoute, WrappedData } from '../types';
import { SAMPLE_PRESETS } from '../data/samplePresets';
import { THEMES } from '../data/themes';
import { calculateArchetype } from '../utils/recapEngine';
import { trackEvent } from '../utils/analytics';
import {
  fetchRealGithubData,
  fetchRealSpotifyData,
  fetchRealSteamData,
  fetchRealStravaData,
  fetchRealGoodreadsData,
  parseUploadedExportFile,
} from '../utils/realDataFetcher';
import { playAchievementSound } from '../utils/sound';
import {
  Code,
  Music,
  Gamepad2,
  BookOpen,
  Activity,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Flame,
  Calendar,
  CheckCircle2,
  Layers,
  Palette,
  FileJson,
  Search,
  UploadCloud,
  AlertCircle,
  Terminal,
  Sliders
} from 'lucide-react';

interface CreateViewProps {
  onNavigate: (route: ViewRoute) => void;
  onSaveAndReveal: (data: WrappedData, selectedTheme: ThemeConfig) => void;
  initialPreset?: WrappedData | null;
}

export const CreateView: React.FC<CreateViewProps> = ({
  onNavigate,
  onSaveAndReveal,
  initialPreset,
}) => {
  const [step, setStep] = useState<number>(1);
  const [category, setCategory] = useState<CategoryType>(initialPreset?.category || 'github');
  const [urlOrUsernameInput, setUrlOrUsernameInput] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [scanPercent, setScanPercent] = useState<number>(0);
  const [scanError, setScanError] = useState<string | null>(null);

  // Manual tuning toggle
  const [showManualTuning, setShowManualTuning] = useState<boolean>(false);

  // Form states
  const [year, setYear] = useState<number>(initialPreset?.year || 2026);
  const [userName, setUserName] = useState<string>(initialPreset?.userName || 'Alex Chen');
  const [handle, setHandle] = useState<string>(initialPreset?.handle || '@alexchen_dev');
  const [title, setTitle] = useState<string>(initialPreset?.title || 'Code Wrapped 2026');

  // Primary metric
  const [primaryLabel, setPrimaryLabel] = useState<string>(
    initialPreset?.primaryMetric.label || 'Total Commits Pushed'
  );
  const [primaryValue, setPrimaryValue] = useState<number>(
    initialPreset?.primaryMetric.value || 2847
  );
  const [primaryUnit, setPrimaryUnit] = useState<string>(
    initialPreset?.primaryMetric.unit || 'commits'
  );

  // Secondary metrics
  const [secondaryMetrics, setSecondaryMetrics] = useState(
    initialPreset?.secondaryMetrics || [
      { label: 'Public Repositories', value: 34 },
      { label: 'Total Stars Received', value: 182 },
      { label: 'Followers on GitHub', value: 140 },
      { label: 'Forks Generated', value: 45 },
    ]
  );

  // Peak & streak
  const [peakLabel, setPeakLabel] = useState<string>(
    initialPreset?.peakMoment.label || 'Insane 18-Hour Sprint'
  );
  const [peakDate, setPeakDate] = useState<string>(
    initialPreset?.peakMoment.date || 'OCT 24, 2026'
  );
  const [peakDetail, setPeakDetail] = useState<string>(
    initialPreset?.peakMoment.detail || 'Shipped 42 commits and closed 11 issues in a single caffeine run.'
  );
  const [streakDays, setStreakDays] = useState<number>(initialPreset?.streak.days || 87);
  const [streakDesc, setStreakDesc] = useState<string>(
    initialPreset?.streak.description || 'Consecutive daily contribution streak'
  );

  // Top Items
  const [topItems, setTopItems] = useState<TopItem[]>(
    initialPreset?.topItems || [
      { id: '1', name: 'TypeScript', count: '54% of code', subtitle: 'Primary weapon of choice' },
      { id: '2', name: 'Rust', count: '22% of code', subtitle: 'Memory safety obsessive' },
      { id: '3', name: 'React 19', count: '14% of code', subtitle: 'UI building powerhouse' },
      { id: '4', name: 'Python', count: '7% of code', subtitle: 'Scripts & AI tools' },
      { id: '5', name: 'Go', count: '3% of code', subtitle: 'Microservices runner' },
    ]
  );

  // Quirk / fail
  const [quirkLabel, setQuirkLabel] = useState<string>(
    initialPreset?.failOrQuirk?.label || 'Quirkiest Git Commit Message'
  );
  const [quirkDesc, setQuirkDesc] = useState<string>(
    initialPreset?.failOrQuirk?.description || '"fix(prod): please god work this time i need sleep"'
  );

  // Theme
  const [selectedTheme, setSelectedTheme] = useState<ThemeConfig>(THEMES[0]);

  // Fast load preset data based on chosen category
  const handleCategorySelect = (cat: CategoryType) => {
    setCategory(cat);
    setScanError(null);
    setUrlOrUsernameInput('');
    const preset = SAMPLE_PRESETS[cat];
    if (preset) {
      setUserName(preset.userName);
      setHandle(preset.handle);
      setTitle(preset.title);
      setPrimaryLabel(preset.primaryMetric.label);
      setPrimaryValue(preset.primaryMetric.value);
      setPrimaryUnit(preset.primaryMetric.unit);
      setPeakLabel(preset.peakMoment.label);
      setPeakDate(preset.peakMoment.date);
      setPeakDetail(preset.peakMoment.detail);
      setStreakDays(preset.streak.days);
      setStreakDesc(preset.streak.description);
      setTopItems(preset.topItems);
      setSecondaryMetrics(preset.secondaryMetrics);
      if (preset.failOrQuirk) {
        setQuirkLabel(preset.failOrQuirk.label);
        setQuirkDesc(preset.failOrQuirk.description);
      }
    }
  };

  const handleRunRealScan = async (overrideInput?: string) => {
    const targetInput = (overrideInput || urlOrUsernameInput).trim();
    if (!targetInput) {
      setScanError(`Please enter a valid ${category.toUpperCase()} username or profile link.`);
      return;
    }

    setScanError(null);
    setIsScanning(true);
    setScanPercent(10);
    setScanStatus(`Initiating connection to ${category.toUpperCase()} service...`);

    try {
      let fetched: WrappedData;

      if (category === 'github') {
        fetched = await fetchRealGithubData(targetInput, (status, pct) => {
          setScanStatus(status);
          setScanPercent(pct);
        });
      } else if (category === 'spotify') {
        fetched = await fetchRealSpotifyData(targetInput, (status, pct) => {
          setScanStatus(status);
          setScanPercent(pct);
        });
      } else if (category === 'gaming') {
        fetched = await fetchRealSteamData(targetInput, (status, pct) => {
          setScanStatus(status);
          setScanPercent(pct);
        });
      } else if (category === 'fitness') {
        fetched = await fetchRealStravaData(targetInput, (status, pct) => {
          setScanStatus(status);
          setScanPercent(pct);
        });
      } else if (category === 'reading') {
        fetched = await fetchRealGoodreadsData(targetInput, (status, pct) => {
          setScanStatus(status);
          setScanPercent(pct);
        });
      } else {
        fetched = await fetchRealGithubData(targetInput, (status, pct) => {
          setScanStatus(status);
          setScanPercent(pct);
        });
      }

      // Populate parsed data into form state
      setUserName(fetched.userName);
      setHandle(fetched.handle);
      setTitle(fetched.title);
      setPrimaryLabel(fetched.primaryMetric.label);
      setPrimaryValue(fetched.primaryMetric.value);
      setPrimaryUnit(fetched.primaryMetric.unit);
      setSecondaryMetrics(fetched.secondaryMetrics);
      setTopItems(fetched.topItems);
      setPeakLabel(fetched.peakMoment.label);
      setPeakDate(fetched.peakMoment.date);
      setPeakDetail(fetched.peakMoment.detail);
      setStreakDays(fetched.streak.days);
      setStreakDesc(fetched.streak.description);
      if (fetched.failOrQuirk) {
        setQuirkLabel(fetched.failOrQuirk.label);
        setQuirkDesc(fetched.failOrQuirk.description);
      }

      playAchievementSound();
      trackEvent('real_api_scan_success', { category, identifier: targetInput });

      // Move directly to Theme Selection / Review
      setStep(3);
    } catch (err: any) {
      console.error('Scan error:', err);
      setScanError(err.message || 'Failed to fetch data from API. Please verify the username or link.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanPercent(20);
    setScanStatus(`Reading ${file.name}...`);
    setScanError(null);

    try {
      const parsed = await parseUploadedExportFile(file, category, (status, pct) => {
        setScanStatus(status);
        setScanPercent(pct);
      });

      setUserName(parsed.userName);
      setHandle(parsed.handle);
      setTitle(parsed.title);
      setPrimaryLabel(parsed.primaryMetric.label);
      setPrimaryValue(parsed.primaryMetric.value);
      setPrimaryUnit(parsed.primaryMetric.unit);
      setSecondaryMetrics(parsed.secondaryMetrics);
      setTopItems(parsed.topItems);
      setPeakLabel(parsed.peakMoment.label);
      setPeakDate(parsed.peakMoment.date);
      setPeakDetail(parsed.peakMoment.detail);

      playAchievementSound();
      trackEvent('file_upload_success', { filename: file.name, category });
      setStep(3);
    } catch (err: any) {
      setScanError('Failed to parse uploaded file. Please ensure it is a valid JSON or CSV export.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleTopItemChange = (index: number, field: keyof TopItem, val: string) => {
    const next = [...topItems];
    next[index] = { ...next[index], [field]: val };
    setTopItems(next);
  };

  const handleFinish = () => {
    trackEvent('import-completion', { category, primaryValue });
    const computedArchetype = calculateArchetype(category, primaryValue);

    const newWrapped: WrappedData = {
      id: `recap-${Date.now().toString(36)}`,
      title: title || `${userName}'s 2026 Wrapped`,
      year,
      userName: userName || 'Anonymous',
      handle: handle.startsWith('@') ? handle : `@${handle}`,
      category,
      primaryMetric: {
        label: primaryLabel,
        value: Number(primaryValue) || 1,
        unit: primaryUnit,
      },
      secondaryMetrics,
      topItems: topItems.filter((i) => i.name.trim().length > 0),
      peakMoment: {
        label: peakLabel,
        date: peakDate,
        detail: peakDetail,
      },
      streak: {
        days: Number(streakDays) || 1,
        description: streakDesc,
      },
      archetype: computedArchetype,
      failOrQuirk: quirkDesc ? { label: quirkLabel, description: quirkDesc } : undefined,
      percentileRank: Math.min(99, Math.max(90, Math.floor(92 + (primaryValue % 8)))),
      monthlyBreakdown: [
        { month: 'Jan', score: Math.round(primaryValue * 0.08) },
        { month: 'Feb', score: Math.round(primaryValue * 0.09) },
        { month: 'Mar', score: Math.round(primaryValue * 0.11) },
        { month: 'Apr', score: Math.round(primaryValue * 0.08) },
        { month: 'May', score: Math.round(primaryValue * 0.12) },
        { month: 'Jun', score: Math.round(primaryValue * 0.09) },
        { month: 'Jul', score: Math.round(primaryValue * 0.07) },
        { month: 'Aug', score: Math.round(primaryValue * 0.10) },
        { month: 'Sep', score: Math.round(primaryValue * 0.12) },
        { month: 'Oct', score: Math.round(primaryValue * 0.14) },
        { month: 'Nov', score: Math.round(primaryValue * 0.10) },
        { month: 'Dec', score: Math.round(primaryValue * 0.08) },
      ],
      customQuote: 'The best error message is the one that never happened.',
      createdAt: new Date().toISOString(),
      isPublic: true,
    };

    trackEvent('stories-generated', { category, id: newWrapped.id });
    onSaveAndReveal(newWrapped, selectedTheme);
  };

  const getPlaceholderAndExamples = (): {
    placeholder: string;
    label: string;
    examples: Array<{ label: string; val: string }>;
  } => {
    switch (category) {
      case 'github':
        return {
          placeholder: 'Enter GitHub username or profile URL (e.g. torvalds or https://github.com/torvalds)',
          label: 'GitHub Username or Profile URL',
          examples: [
            { label: 'Linus Torvalds', val: 'torvalds' },
            { label: 'shadcn', val: 'shadcn' },
            { label: 'Anthony Fu', val: 'antfu' },
            { label: 'Dan Abramov', val: 'gaearon' },
          ],
        };
      case 'spotify':
        return {
          placeholder: 'Paste your Spotify playlist URL (e.g. https://open.spotify.com/playlist/...)',
          label: 'Spotify Playlist Link or Profile URL',
          examples: [
            { label: "Today's Top Hits", val: 'https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M' },
            { label: 'Peaceful Piano', val: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO' },
            { label: 'Beast Mode', val: 'https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP' },
          ],
        };
      case 'gaming':
        return {
          placeholder: 'Enter Steam Community vanity ID or profile URL (e.g. steamcommunity.com/id/gaben)',
          label: 'Steam ID or Vanity Link',
          examples: [
            { label: 'Gabe Newell', val: 'gaben' },
            { label: 'Robin Walker', val: 'robinwalker' },
          ],
        };
      case 'fitness':
        return {
          placeholder: 'Enter Strava athlete link or ID (e.g. strava.com/athletes/12345)',
          label: 'Strava Athlete URL / ID',
          examples: [
            { label: 'Marathon Champ', val: 'marathon_runner' },
            { label: 'Sub-4 Runner', val: 'sub4_marcus' },
          ],
        };
      case 'reading':
        return {
          placeholder: 'Enter Goodreads user link or username (e.g. goodreads.com/user/show/...)',
          label: 'Goodreads Profile / Username',
          examples: [
            { label: 'Bookworm Elena', val: 'bookworm_elena' },
            { label: 'Sci-Fi Connoisseur', val: 'scifi_reader' },
          ],
        };
      default:
        return {
          placeholder: 'Enter account handle or profile link',
          label: 'Account Identifier',
          examples: [
            { label: 'Sarah Jenkins', val: 'creator_sarah' },
          ],
        };
    }
  };

  const info = getPlaceholderAndExamples();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Terminal Scanning Modal Overlay */}
      {isScanning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="w-full max-w-lg bg-black text-[#D2FF3A] border-4 border-[#D2FF3A] brutal-shadow-xl p-6 font-mono-code space-y-4">
            <div className="flex items-center justify-between border-b border-[#D2FF3A]/30 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#FFE500]" />
                <span className="font-bold text-sm text-white uppercase tracking-wider">
                  REAL API RECAP SCANNER
                </span>
              </div>
              <span className="text-xs bg-[#D2FF3A] text-black px-2 py-0.5 font-bold">
                {scanPercent}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 border-2 border-[#D2FF3A] bg-black p-0.5">
              <div
                className="h-full bg-[#FFE500] transition-all duration-300"
                style={{ width: `${scanPercent}%` }}
              />
            </div>

            {/* Telemetry Output Log */}
            <div className="p-3 bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 space-y-1.5 min-h-[100px]">
              <div className="text-neutral-500">&gt; Target: {urlOrUsernameInput || 'Service API'}</div>
              <div className="text-neutral-500">&gt; Service: {category.toUpperCase()} Endpoint</div>
              <div className="text-[#FFE500] font-bold">&gt; {scanStatus}</div>
              <div className="text-neutral-400">&gt; Normalizing telemetry & computing archetype...</div>
            </div>

            <div className="text-[11px] text-neutral-400 text-center">
              Fetching real activity metrics directly from public API...
            </div>
          </div>
        </div>
      )}

      {/* Step Header */}
      <div className="border-b-2 border-black pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-block px-2.5 py-0.5 bg-black text-[#FFE500] font-mono-code font-bold text-xs uppercase mb-2">
            STEP 0{step} OF 03
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-black">
            {step === 1 && '1. CONNECT REAL SERVICE OR ENTER URL'}
            {step === 2 && '2. VERIFY FETCHED STATS & OBSESSIONS'}
            {step === 3 && '3. SELECT THEME & GENERATE 9:16'}
          </h1>
        </div>

        {/* Step indicator tabs */}
        <div className="flex items-center gap-1.5 font-mono-code text-xs font-bold">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`w-8 h-8 border-2 border-black flex items-center justify-center ${
                step === s ? 'bg-black text-[#FFE500] brutal-shadow-sm' : 'bg-white text-black'
              }`}
            >
              0{s}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: SERVICE & REAL SCANNER */}
      {step === 1 && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Domain Selection Tabs */}
          <div>
            <label className="block text-xs font-mono-code font-bold uppercase text-neutral-700 mb-2">
              Select Recap Domain
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {[
                { id: 'github', label: 'GitHub', icon: Code },
                { id: 'spotify', label: 'Spotify', icon: Music },
                { id: 'gaming', label: 'Steam', icon: Gamepad2 },
                { id: 'fitness', label: 'Strava', icon: Activity },
                { id: 'reading', label: 'Goodreads', icon: BookOpen },
                { id: 'creator', label: 'Creator', icon: Sparkles },
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = category === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleCategorySelect(item.id as CategoryType)}
                    className={`p-3 border-3 border-black text-left flex flex-col justify-between h-24 transition-all brutal-btn ${
                      isSelected ? 'bg-[#FFE500] brutal-shadow' : 'bg-white hover:bg-neutral-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 text-black" />
                    <div>
                      <div className="font-display font-black text-sm text-black">
                        {item.label}
                      </div>
                      <div className="text-[10px] font-mono-code opacity-75">
                        {isSelected ? 'ACTIVE' : 'SELECT'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Real Scanner Box */}
          <div className="p-6 sm:p-8 bg-white border-4 border-black brutal-shadow-lg space-y-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-black" />
                <h3 className="font-display font-black text-xl text-black uppercase">
                  {category} Scanner
                </h3>
              </div>
            </div>

            {/* Error Banner */}
            {scanError && (
              <div className="p-3 bg-red-100 border-2 border-black text-xs font-mono-code text-red-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                <span>{scanError}</span>
              </div>
            )}

            {/* Input & Scan Button */}
            <div className="space-y-3">
              <label className="block text-xs font-mono-code font-bold uppercase text-neutral-800">
                {info.label}
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={urlOrUsernameInput}
                  onChange={(e) => setUrlOrUsernameInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunRealScan()}
                  placeholder={info.placeholder}
                  className="flex-1 p-3.5 bg-neutral-50 border-3 border-black font-mono-code text-sm text-black focus:bg-white focus:outline-hidden"
                />
                <button
                  onClick={() => handleRunRealScan()}
                  disabled={isScanning}
                  className="px-6 py-3.5 bg-[#FFE500] border-3 border-black text-black font-display font-black text-sm uppercase tracking-wider brutal-btn brutal-shadow flex items-center justify-center gap-2 shrink-0"
                >
                  <Search className="w-4 h-4" />
                  <span>FETCH & RECAP</span>
                </button>
              </div>
            </div>

            {/* Drag & Drop File Upload Option */}
            <div className="border-t-2 border-dashed border-black/30 pt-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-neutral-50 border-2 border-black">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center shrink-0">
                    <UploadCloud className="w-5 h-5 text-[#FFE500]" />
                  </div>
                  <div>
                    <div className="font-display font-black text-sm text-black">
                      OR IMPORT DATA FILE (JSON / CSV)
                    </div>
                    <div className="text-[11px] font-mono-code text-neutral-600">
                      Supports Spotify StreamingHistory.json, Strava activities.csv, or Goodreads exports.
                    </div>
                  </div>
                </div>

                <label className="px-4 py-2 bg-white border-2 border-black text-black font-display font-black text-xs uppercase cursor-pointer brutal-btn shrink-0 hover:bg-neutral-100">
                  <input
                    type="file"
                    accept=".json,.csv,.gpx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  SELECT FILE
                </label>
              </div>
            </div>
          </div>

          {/* Skip / Manual Option */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-neutral-600 font-mono-code">
              Want to skip the API and inspect sample data first?
            </span>
            <button
              onClick={() => setStep(2)}
              className="px-5 py-3 border-2 border-black bg-white text-black font-display font-bold text-xs uppercase brutal-btn hover:bg-neutral-100 flex items-center gap-1.5"
            >
              <span>CONTINUE WITH BENCHMARKS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: VERIFY FETCHED DATA & CUSTOMIZE */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-4 bg-[#FFE500] border-3 border-black brutal-shadow flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-black" />
              <span className="font-display font-black text-sm text-black">
                RECAP METRICS READY FOR: {userName.toUpperCase()} ({handle})
              </span>
            </div>
            <button
              onClick={() => setShowManualTuning(!showManualTuning)}
              className="text-xs font-mono-code font-bold uppercase underline text-black hover:opacity-80 flex items-center gap-1"
            >
              <Sliders className="w-3.5 h-3.5" />
              {showManualTuning ? 'Hide Manual Editor' : 'Tune Numbers'}
            </button>
          </div>

          {/* Primary Metric Preview Card */}
          <div className="p-6 bg-white border-4 border-black brutal-shadow space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="font-display font-black text-xl text-black">
                Headline Milestone & Secondary Stats
              </h3>
              <span className="font-mono-code text-xs text-neutral-600">
                {category.toUpperCase()} · 2026
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 p-4 bg-black text-white border-2 border-black">
                <div className="text-[11px] font-mono-code text-[#FFE500] uppercase mb-1">
                  {primaryLabel}
                </div>
                <div className="font-display font-black text-4xl text-[#D2FF3A]">
                  {primaryValue.toLocaleString()} {primaryUnit}
                </div>
              </div>

              <div className="p-4 bg-neutral-100 border-2 border-black flex flex-col justify-center">
                <div className="text-[10px] font-mono-code text-neutral-600 uppercase">
                  LONGEST STREAK
                </div>
                <div className="font-display font-black text-2xl text-black">
                  {streakDays} DAYS
                </div>
                <div className="text-[11px] text-neutral-600 truncate">
                  {streakDesc}
                </div>
              </div>
            </div>

            {/* Secondary metrics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {secondaryMetrics.map((sec, idx) => (
                <div key={idx} className="p-3 bg-neutral-50 border border-black">
                  <div className="font-display font-black text-base text-black">
                    {sec.value}
                  </div>
                  <div className="text-[10px] font-mono-code text-neutral-600 uppercase">
                    {sec.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Items */}
          <div className="p-6 bg-white border-4 border-black brutal-shadow space-y-4">
            <h3 className="font-display font-black text-xl text-black border-b-2 border-black pb-2">
              Top 5 Highlights / Breakdown
            </h3>
            <div className="space-y-2">
              {topItems.slice(0, 5).map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 bg-neutral-50 border-2 border-black flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 bg-black text-white font-mono-code font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-display font-bold text-sm text-black">
                        {item.name}
                      </div>
                      {item.subtitle && (
                        <div className="text-[10px] text-neutral-600">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="font-mono-code font-bold text-xs text-black">
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manual Tuning Panel (Accordion) */}
          {showManualTuning && (
            <div className="p-6 bg-neutral-100 border-4 border-black brutal-shadow space-y-4">
              <h3 className="font-display font-black text-lg text-black border-b-2 border-black pb-2">
                Manual Metric Tuning
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-mono-code font-bold uppercase block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full p-2 bg-white border border-black font-bold"
                  />
                </div>
                <div>
                  <label className="font-mono-code font-bold uppercase block mb-1">
                    Handle
                  </label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full p-2 bg-white border border-black font-mono-code"
                  />
                </div>
                <div>
                  <label className="font-mono-code font-bold uppercase block mb-1">
                    Primary Count
                  </label>
                  <input
                    type="number"
                    value={primaryValue}
                    onChange={(e) => setPrimaryValue(Number(e.target.value) || 0)}
                    className="w-full p-2 bg-white border border-black font-mono-code font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-3 border-2 border-black bg-white text-black font-display font-bold text-xs uppercase brutal-btn flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK TO SCANNER
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3.5 bg-black text-[#FFE500] font-display font-black text-sm uppercase tracking-wider border-2 border-black brutal-btn brutal-shadow flex items-center gap-2"
            >
              NEXT: SELECT THEME & REVEAL
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: THEME SELECTION & REVEAL */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="p-6 bg-white border-4 border-black brutal-shadow space-y-4">
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <h3 className="font-display font-black text-xl text-black">
                Select Visual Neo-Brutalist Theme
              </h3>
              <Palette className="w-5 h-5 text-black" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {THEMES.map((theme) => {
                const isSelected = selectedTheme.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setSelectedTheme(theme)}
                    className={`p-3 border-3 border-black text-left flex items-center justify-between transition-all ${
                      isSelected ? 'bg-black text-white brutal-shadow' : 'bg-white text-black hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-6 h-6 border-2 border-black shrink-0"
                        style={{ backgroundColor: theme.cardBg }}
                      />
                      <div>
                        <div className="font-display font-black text-xs">
                          {theme.name}
                        </div>
                        <div className="text-[10px] opacity-75 font-mono-code">
                          {theme.isVip ? 'VIP THEME' : 'STANDARD'}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-[#D2FF3A] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quirk / Fail Card */}
          <div className="p-6 bg-white border-4 border-black brutal-shadow space-y-3">
            <h3 className="font-display font-black text-lg text-black border-b-2 border-black pb-2">
              Standout Peak & Quirk Story
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono-code font-bold uppercase text-neutral-800 mb-1">
                  Peak Moment Title
                </label>
                <input
                  type="text"
                  value={peakLabel}
                  onChange={(e) => setPeakLabel(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border-2 border-black font-display font-bold text-xs text-black"
                />
              </div>
              <div>
                <label className="block text-xs font-mono-code font-bold uppercase text-neutral-800 mb-1">
                  Quirk or Relatable Detail
                </label>
                <input
                  type="text"
                  value={quirkDesc}
                  onChange={(e) => setQuirkDesc(e.target.value)}
                  className="w-full p-2.5 bg-neutral-50 border-2 border-black text-xs text-black"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-3 border-2 border-black bg-white text-black font-display font-bold text-xs uppercase brutal-btn flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              BACK
            </button>
            <button
              onClick={handleFinish}
              className="px-8 py-4 bg-[#FFE500] text-black font-display font-black text-base uppercase tracking-wider border-3 border-black brutal-btn brutal-shadow flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              REVEAL 9:16 WRAPPED DECK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
