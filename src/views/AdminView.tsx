import React, { useState } from 'react';
import { ViewRoute } from '../types';
import { getAggregatedMetrics, clearAnalytics, trackEvent } from '../utils/analytics';
import {
  Shield,
  BarChart3,
  Users,
  AlertTriangle,
  RotateCcw,
  Download,
  Share2,
  Sparkles,
  TrendingUp,
  Activity,
  CheckCircle2
} from 'lucide-react';

interface AdminViewProps {
  onNavigate: (route: ViewRoute) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'reports' | 'events'>('analytics');
  const [metrics, setMetrics] = useState(getAggregatedMetrics());
  const [reports, setReports] = useState([
    { id: 'rep-1', item: 'Spam username detected', reason: 'Bot naming pattern', status: 'Resolved', date: '2026-09-28' },
    { id: 'rep-2', item: 'Misleading metric claim', reason: 'Over 1M hours in 1 year', status: 'Dismissed', date: '2026-09-30' },
  ]);

  const refreshMetrics = () => {
    setMetrics(getAggregatedMetrics());
  };

  const handleSimulateViralVisit = () => {
    trackEvent('organic-visits-from-shares', { source: 'simulated_test' });
    trackEvent('landing_view', { referer: 'shared_recap_story' });
    refreshMetrics();
  };

  const handleReset = () => {
    clearAnalytics();
    refreshMetrics();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="border-b-2 border-black pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-block px-2.5 py-0.5 bg-black text-[#D2FF3A] font-mono-code font-bold text-xs uppercase mb-2">
            ADMIN CONSOLE & TELEMETRY
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-black">
            MISSION CONTROL
          </h1>
          <p className="text-xs text-neutral-600 mt-1">
            Real-time North Star metrics, viral loop tracking, conversion telemetry, and content moderation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateViralVisit}
            className="px-3.5 py-2 bg-[#FFE500] border-2 border-black text-black font-display font-black text-xs uppercase brutal-btn flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            SIMULATE VIRAL HIT
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-white border-2 border-black text-black font-mono-code font-bold text-xs uppercase brutal-btn hover:bg-neutral-100 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b-2 border-black pb-4">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 border-2 border-black font-display font-bold text-xs uppercase brutal-btn flex items-center gap-1.5 ${
            activeTab === 'analytics' ? 'bg-black text-[#FFE500]' : 'bg-white text-black hover:bg-neutral-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          North Star Analytics
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-4 py-2 border-2 border-black font-display font-bold text-xs uppercase brutal-btn flex items-center gap-1.5 ${
            activeTab === 'events' ? 'bg-black text-[#FFE500]' : 'bg-white text-black hover:bg-neutral-100'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Live Event Stream ({metrics.totalEvents})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 border-2 border-black font-display font-bold text-xs uppercase brutal-btn flex items-center gap-1.5 ${
            activeTab === 'reports' ? 'bg-black text-[#FFE500]' : 'bg-white text-black hover:bg-neutral-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Moderation & Safety ({reports.length})
        </button>
      </div>

      {/* TAB 1: NORTH STAR ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* North Star Highlight Banner */}
          <div className="p-6 bg-black text-white border-4 border-black brutal-shadow flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="text-xs font-mono-code font-bold text-[#FFE500] uppercase mb-1">
                ★ PRD PRIMARY NORTH STAR METRIC
              </div>
              <h2 className="font-display font-black text-2xl text-white">
                Successful Shareable Result Rate
              </h2>
              <p className="text-xs text-neutral-400 mt-1 max-w-lg">
                Measures the percentage of completed recap generations that trigger a real social share action.
              </p>
            </div>
            <div className="p-4 bg-[#FFE500] text-black border-2 border-black shrink-0 text-center min-w-[160px]">
              <div className="font-display font-black text-4xl">
                {metrics.shareRate}
              </div>
              <div className="text-[11px] font-mono-code font-bold uppercase mt-0.5">
                SHARE CONVERSION
              </div>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 bg-white border-4 border-black brutal-shadow">
              <div className="font-mono-code text-[11px] font-bold text-neutral-600 uppercase mb-1">
                IMPORT COMPLETIONS
              </div>
              <div className="font-display font-black text-3xl text-black">
                {metrics.importCompletion}
              </div>
              <div className="text-[10px] text-neutral-500 font-mono-code mt-2">
                Users completing input step
              </div>
            </div>

            <div className="p-5 bg-white border-4 border-black brutal-shadow">
              <div className="font-mono-code text-[11px] font-bold text-neutral-600 uppercase mb-1">
                STORIES GENERATED
              </div>
              <div className="font-display font-black text-3xl text-[#000000]">
                {metrics.storiesGenerated}
              </div>
              <div className="text-[10px] text-neutral-500 font-mono-code mt-2">
                Total 9:16 decks created
              </div>
            </div>

            <div className="p-5 bg-white border-4 border-black brutal-shadow">
              <div className="font-mono-code text-[11px] font-bold text-neutral-600 uppercase mb-1">
                ORGANIC VISITS FROM SHARES
              </div>
              <div className="font-display font-black text-3xl text-[#00F0FF]">
                {metrics.organicVisits}
              </div>
              <div className="text-[10px] text-neutral-500 font-mono-code mt-2">
                K-factor viral referral visits
              </div>
            </div>

            <div className="p-5 bg-[#D2FF3A] border-4 border-black brutal-shadow">
              <div className="font-mono-code text-[11px] font-bold text-neutral-900 uppercase mb-1">
                PREMIUM UNLOCK CONVERSION
              </div>
              <div className="font-display font-black text-3xl text-black">
                {metrics.premiumConversionRate}
              </div>
              <div className="text-[10px] text-neutral-800 font-mono-code mt-2">
                {metrics.purchases} paid passes unlocked
              </div>
            </div>
          </div>

          {/* Event Breakdown List */}
          <div className="p-6 bg-white border-4 border-black brutal-shadow">
            <h3 className="font-display font-black text-xl text-black border-b-2 border-black pb-3 mb-4">
              All Required PRD Event Trackers
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs font-mono-code">
              {Object.entries(metrics.counts).map(([name, count]) => (
                <div key={name} className="p-3 bg-neutral-100 border-2 border-black flex items-center justify-between">
                  <span className="truncate mr-2 font-bold">{name}</span>
                  <span className="px-2 py-0.5 bg-black text-[#FFE500] font-black">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE EVENT STREAM */}
      {activeTab === 'events' && (
        <div className="p-6 bg-white border-4 border-black brutal-shadow animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
            <h3 className="font-display font-black text-xl text-black">
              Raw Event Log Stream
            </h3>
            <span className="font-mono-code text-xs text-neutral-600">
              Showing last {metrics.recentEvents.length} events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono-code text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-black bg-neutral-100">
                  <th className="p-2.5 font-bold">Event ID</th>
                  <th className="p-2.5 font-bold">Event Name</th>
                  <th className="p-2.5 font-bold">Timestamp</th>
                  <th className="p-2.5 font-bold">Metadata</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentEvents.map((ev) => (
                  <tr key={ev.id} className="border-b border-neutral-300 hover:bg-neutral-50">
                    <td className="p-2.5 text-neutral-500">#{ev.id}</td>
                    <td className="p-2.5 font-bold text-black">{ev.name}</td>
                    <td className="p-2.5 text-neutral-600">
                      {new Date(ev.timestamp).toLocaleTimeString()} · {new Date(ev.timestamp).toLocaleDateString()}
                    </td>
                    <td className="p-2.5 text-neutral-600 truncate max-w-xs">
                      {ev.metadata ? JSON.stringify(ev.metadata) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MODERATION & SAFETY */}
      {activeTab === 'reports' && (
        <div className="p-6 bg-white border-4 border-black brutal-shadow space-y-4 animate-in fade-in duration-150">
          <div className="border-b-2 border-black pb-3">
            <h3 className="font-display font-black text-xl text-black">
              User Moderation & Safety Queue
            </h3>
            <p className="text-xs text-neutral-600 mt-0.5">
              Reports from community and rate-limiting triggers. Local browser sandbox operates in zero-risk privacy mode.
            </p>
          </div>

          <div className="space-y-3">
            {reports.map((rep) => (
              <div key={rep.id} className="p-4 bg-neutral-50 border-2 border-black flex items-center justify-between gap-4">
                <div>
                  <div className="font-display font-black text-sm text-black">
                    {rep.item}
                  </div>
                  <div className="text-xs text-neutral-600 font-mono-code">
                    Reason: {rep.reason} · Date: {rep.date}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-black text-[#D2FF3A] font-mono-code font-bold text-[10px] uppercase">
                    {rep.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-[#FFE500] border-2 border-black text-xs font-mono-code flex items-center justify-between">
            <span>Safety Status: <strong>NOMINAL (100% Client-Side Privacy)</strong></span>
            <span>NO PERSONAL PII LOGGED</span>
          </div>
        </div>
      )}
    </div>
  );
};
