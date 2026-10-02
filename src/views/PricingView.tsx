import React, { useState } from 'react';
import { ViewRoute } from '../types';
import { trackEvent } from '../utils/analytics';
import { Sparkles, Check, Zap, Shield, ArrowRight } from 'lucide-react';

interface PricingViewProps {
  onNavigate: (route: ViewRoute) => void;
  isPremiumUnlocked: boolean;
  onOpenUpgradeModal: () => void;
}

export const PricingView: React.FC<PricingViewProps> = ({
  onNavigate,
  isPremiumUnlocked,
  onOpenUpgradeModal,
}) => {
  const [currency, setCurrency] = useState<'IDR' | 'USD'>('IDR');

  React.useEffect(() => {
    trackEvent('pricing_viewed');
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-block px-2.5 py-0.5 bg-black text-[#FFE500] font-mono-code font-bold text-xs uppercase">
          TRANSPARENT FREEMIUM PRICING
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-black">
          SIMPLE, HONEST UNLOCKS
        </h1>
        <p className="text-sm text-neutral-700 leading-relaxed">
          Create, view, and share your basic wrapped recap completely free. When you want full deep-dive telemetry, VIP themes, and unbranded 1080x1920 exports, unlock with a low one-time pass.
        </p>

        {/* Currency Switcher */}
        <div className="inline-flex p-1 bg-white border-2 border-black mt-4">
          <button
            onClick={() => setCurrency('IDR')}
            className={`px-3 py-1 font-mono-code text-xs font-bold ${
              currency === 'IDR' ? 'bg-black text-[#FFE500]' : 'text-black'
            }`}
          >
            IDR (Rupiah)
          </button>
          <button
            onClick={() => setCurrency('USD')}
            className={`px-3 py-1 font-mono-code text-xs font-bold ${
              currency === 'USD' ? 'bg-black text-[#FFE500]' : 'text-black'
            }`}
          >
            USD ($)
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Tier 1: Free Core */}
        <div className="p-8 bg-white border-4 border-black brutal-shadow flex flex-col justify-between">
          <div>
            <div className="inline-block px-2.5 py-0.5 bg-neutral-200 text-black font-mono-code font-bold text-xs uppercase mb-3">
              FOREVER FREE
            </div>
            <h3 className="font-display font-black text-2xl text-black mb-1">
              Core Recap
            </h3>
            <div className="font-display font-black text-4xl text-black mb-4">
              {currency === 'IDR' ? 'Rp 0' : '$0'}
            </div>
            <p className="text-xs text-neutral-600 mb-6">
              Everything you need to celebrate your year and share standout moments with friends.
            </p>

            <ul className="space-y-3 text-xs text-neutral-800 border-t-2 border-black/10 pt-4 mb-8">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-black shrink-0" />
                <span><strong>5 Core Story Slides</strong> (Intro, Metric, Top 5, Peak, Archetype)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-black shrink-0" />
                <span>5 Neo-brutalist standard color themes</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-black shrink-0" />
                <span>Interactive 9:16 mobile story viewer</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-black shrink-0" />
                <span>Public & private shareable link</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-black shrink-0" />
                <span>Standard PNG image export with subtle attribution</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => onNavigate('create')}
            className="w-full py-3.5 bg-neutral-100 hover:bg-neutral-200 border-2 border-black text-black font-display font-black text-xs uppercase tracking-wider brutal-btn"
          >
            CREATE FOR FREE
          </button>
        </div>

        {/* Tier 2: One-Time Pro Pass */}
        <div className="p-8 bg-[#FFE500] border-4 border-black brutal-shadow-lg flex flex-col justify-between relative">
          <div className="absolute -top-3 right-6 px-3 py-1 bg-black text-[#D2FF3A] font-mono-code font-bold text-xs uppercase border-2 border-black">
            RECOMMENDED EXPERIMENT
          </div>

          <div>
            <div className="inline-block px-2.5 py-0.5 bg-black text-[#FFE500] font-mono-code font-bold text-xs uppercase mb-3">
              ONE-TIME UNLOCK
            </div>
            <h3 className="font-display font-black text-2xl text-black mb-1">
              Pro Dossier Pass
            </h3>
            <div className="font-display font-black text-4xl text-black mb-4">
              {currency === 'IDR' ? 'Rp 25.000' : '$1.99'}
            </div>
            <p className="text-xs text-neutral-800 mb-6">
              Complete 8-slide story deck with monthly momentum velocity, advanced telemetry, and watermark removal.
            </p>

            <ul className="space-y-3 text-xs text-neutral-900 border-t-2 border-black/20 pt-4 mb-8">
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 bg-black text-[#D2FF3A] flex items-center justify-center font-bold shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>Full 8-Slide Story Deck</strong> (+ Monthly Chart & Deep Stats)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 bg-black text-[#D2FF3A] flex items-center justify-center font-bold shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>VIP Themes</strong> (Gold Foil & Terminal Matrix Neon)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 bg-black text-[#D2FF3A] flex items-center justify-center font-bold shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>Remove Watermark</strong> on all 1080x1920 exports</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 bg-black text-[#D2FF3A] flex items-center justify-center font-bold shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span><strong>Batch 1-Click Story Export</strong> (All slides at once)</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-4 h-4 bg-black text-[#D2FF3A] flex items-center justify-center font-bold shrink-0">
                  <Check className="w-3 h-3" />
                </div>
                <span>No recurring subscriptions. One time pay.</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onOpenUpgradeModal}
            className="w-full py-4 bg-black text-white hover:bg-neutral-900 border-2 border-black font-display font-black text-xs uppercase tracking-wider brutal-btn brutal-shadow flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-[#FFE500]" />
            {isPremiumUnlocked ? 'YOU HAVE UNLOCKED PRO PASS' : 'UNLOCK PRO PASS (Rp 25.000 / $1.99)'}
          </button>
        </div>
      </div>

      {/* FAQ / Guarantee note */}
      <div className="p-6 bg-white border-2 border-black max-w-4xl mx-auto flex items-center gap-4 text-xs text-neutral-700">
        <Shield className="w-8 h-8 text-black shrink-0" />
        <div>
          <strong className="font-bold text-black block mb-0.5">Transparent monetization policy:</strong>
          We never lock the initial shareable aha-moment behind a paywall. The free version produces high-impact 9:16 story cards without tricking users.
        </div>
      </div>
    </div>
  );
};
