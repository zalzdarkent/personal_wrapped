import { AnalyticsEvent } from '../types';

const STORAGE_KEY = 'pyw_analytics_events';

// Default initial seeded events for realistic analytics admin metrics
const DEFAULT_EVENTS: AnalyticsEvent[] = [
  { id: '1', name: 'landing_view', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
  { id: '2', name: 'start_creation', timestamp: new Date(Date.now() - 3600000 * 20).toISOString() },
  { id: '3', name: 'import-completion', timestamp: new Date(Date.now() - 3600000 * 18).toISOString() },
  { id: '4', name: 'stories-generated', timestamp: new Date(Date.now() - 3600000 * 18).toISOString() },
  { id: '5', name: 'result_viewed', timestamp: new Date(Date.now() - 3600000 * 17).toISOString() },
  { id: '6', name: 'share_clicked', timestamp: new Date(Date.now() - 3600000 * 15).toISOString() },
  { id: '7', name: 'share_completed', timestamp: new Date(Date.now() - 3600000 * 15).toISOString() },
  { id: '8', name: 'organic-visits-from-shares', timestamp: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: '9', name: 'pricing_viewed', timestamp: new Date(Date.now() - 3600000 * 8).toISOString() },
  { id: '10', name: 'checkout_started', timestamp: new Date(Date.now() - 3600000 * 6).toISOString() },
  { id: '11', name: 'purchase_completed', timestamp: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: '12', name: 'premium-export-conversion', timestamp: new Date(Date.now() - 3600000 * 4).toISOString() },
];

export const getStoredEvents = (): AnalyticsEvent[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_EVENTS));
      return DEFAULT_EVENTS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_EVENTS;
  }
};

export const trackEvent = (name: string, metadata?: Record<string, any>) => {
  try {
    const current = getStoredEvents();
    const newEvent: AnalyticsEvent = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      timestamp: new Date().toISOString(),
      metadata,
    };
    const updated = [newEvent, ...current].slice(0, 500); // keep last 500
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Analytics tracking error:', err);
  }
};

export const getAggregatedMetrics = () => {
  const events = getStoredEvents();
  const counts: Record<string, number> = {};

  for (const ev of events) {
    counts[ev.name] = (counts[ev.name] || 0) + 1;
  }

  const generated = counts['stories-generated'] || 0;
  const shares = counts['share_completed'] || counts['share_clicked'] || 0;
  const shareRate = generated > 0 ? Math.min(100, Math.round((shares / generated) * 100)) : 0;

  const checkouts = counts['purchase_completed'] || 0;
  const premiumExports = counts['premium-export-conversion'] || 0;
  const conversionRate = generated > 0 ? Math.min(100, Math.round(((checkouts + premiumExports) / generated) * 100)) : 0;

  return {
    totalEvents: events.length,
    importCompletion: counts['import-completion'] || 0,
    storiesGenerated: generated,
    sharesCompleted: shares,
    shareRate: `${shareRate}%`,
    organicVisits: counts['organic-visits-from-shares'] || 0,
    purchases: checkouts,
    premiumConversionRate: `${conversionRate}%`,
    counts,
    recentEvents: events.slice(0, 15),
  };
};

export const clearAnalytics = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_EVENTS));
};
