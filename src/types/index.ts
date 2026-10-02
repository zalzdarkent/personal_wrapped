export type CategoryType = 'github' | 'spotify' | 'gaming' | 'reading' | 'fitness' | 'creator' | 'custom';

export interface TopItem {
  id: string;
  name: string;
  count: number | string;
  subtitle?: string;
  rank?: number;
}

export interface MonthActivity {
  month: string;
  score: number;
}

export interface WrappedData {
  id: string;
  title: string;
  year: number;
  userName: string;
  handle: string;
  category: CategoryType;
  primaryMetric: {
    label: string;
    value: number;
    unit: string;
  };
  secondaryMetrics: Array<{
    label: string;
    value: string | number;
    unit?: string;
  }>;
  topItems: TopItem[];
  peakMoment: {
    label: string;
    date: string;
    detail: string;
  };
  streak: {
    days: number;
    description: string;
  };
  archetype: {
    title: string;
    tagline: string;
    description: string;
    badgeLabel: string;
  };
  failOrQuirk?: {
    label: string;
    description: string;
  };
  percentileRank: number; // e.g. 98 -> top 2%
  monthlyBreakdown?: MonthActivity[];
  customQuote?: string;
  createdAt: string;
  isPublic: boolean;
}

export interface StorySlide {
  id: string;
  type: 'intro' | 'primary_metric' | 'top_list' | 'peak_moment' | 'archetype' | 'deep_stats' | 'monthly_chart' | 'final_card';
  title: string;
  subtitle?: string;
  isPremium?: boolean;
}

export interface ThemeConfig {
  id: string;
  name: string;
  bgClass: string;
  cardBg: string;
  accentBg: string;
  textColor: string;
  accentText: string;
  borderColor: string;
  shadowColor: string;
  isVip?: boolean;
  stickerStyle: string;
}

export interface AnalyticsEvent {
  id: string;
  name: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export type ViewRoute = 'landing' | 'explore' | 'create' | 'result' | 'pricing' | 'profile' | 'admin';
