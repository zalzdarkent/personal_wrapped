import React, { useState } from 'react';
import { Sparkles, Check, X, ShieldCheck, Lock, Zap } from 'lucide-react';
import { trackEvent } from '../utils/analytics';
import { playAchievementSound } from '../utils/sound';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<'IDR' | 'USD'>('IDR');

  if (!isOpen) return null;

  const handleStartCheckout = () => {
    trackEvent('checkout_started', {
      plan: 'one_time_unlock',
      price: selectedCurrency === 'IDR' ? 25000 : 1.99,
      currency: selectedCurrency,
    });
    setIsProcessing(true);

    // Simulated seamless instant checkout response
    setTimeout(() => {
      trackEvent('purchase_completed', {
        plan: 'one_time_unlock',
        price: selectedCurrency === 'IDR' ? 25000 : 1.99,
      });
      playAchievementSound();
      setIsProcessing(false);
      onSuccess();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white border-4 border-black brutal-shadow-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 border-2 border-black bg-white flex items-center justify-center brutal-btn hover:bg-neutral-100"
        >
          <X className="w-5 h-5 text-black" />
        </button>

        <div className="mb-4">
          <div className="inline-block px-2.5 py-0.5 bg-black text-[#D2FF3A] font-mono-code font-bold text-xs uppercase mb-2">
            INSTANT PASS UNLOCK
          </div>
          <h2 className="font-display font-black text-2xl text-black">
            UPGRADE TO PRO DOSSIER
          </h2>
          <p className="text-xs text-neutral-600 mt-1">
            Unlock the full 8-slide deep-dive experience, VIP themes, and unbranded 1080x1920 exports.
          </p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setSelectedCurrency('IDR')}
            className={`px-3 py-1 text-xs font-mono-code font-bold border-2 border-black ${
              selectedCurrency === 'IDR' ? 'bg-black text-[#FFE500]' : 'bg-white text-black'
            }`}
          >
            IDR (Rp 25.000)
          </button>
          <button
            onClick={() => setSelectedCurrency('USD')}
            className={`px-3 py-1 text-xs font-mono-code font-bold border-2 border-black ${
              selectedCurrency === 'USD' ? 'bg-black text-[#FFE500]' : 'bg-white text-black'
            }`}
          >
            USD ($1.99)
          </button>
        </div>

        {/* Price Card */}
        <div className="p-4 bg-[#FFE500] border-3 border-black brutal-shadow-sm mb-5">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="font-mono-code text-[11px] font-bold text-neutral-900 uppercase">
                ONE-TIME RECAP PASS
              </div>
              <div className="font-display font-black text-3xl text-black">
                {selectedCurrency === 'IDR' ? 'Rp 25.000' : '$1.99'}
              </div>
            </div>
            <span className="px-2 py-1 bg-black text-white text-[11px] font-mono-code font-bold uppercase">
              LIFETIME ACCESS
            </span>
          </div>
        </div>

        {/* Feature List */}
        <div className="space-y-2.5 mb-6 text-xs text-neutral-800">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-black text-[#D2FF3A] flex items-center justify-center font-bold shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span><strong>Full 8-Slide Story Deck</strong> (adds Monthly Breakdown & Deep Telemetry)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-black text-[#D2FF3A] flex items-center justify-center font-bold shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span><strong>Exclusive VIP Themes</strong> (Gold Foil & Matrix Neon Terminal)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-black text-[#D2FF3A] flex items-center justify-center font-bold shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span><strong>Unbranded 1080x1920 PNG Exports</strong> with zero watermarks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-black text-[#D2FF3A] flex items-center justify-center font-bold shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
            <span><strong>Batch 1-Click Story Export</strong> for Instagram & TikTok</span>
          </div>
        </div>

        {/* Checkout Trigger */}
        <button
          onClick={handleStartCheckout}
          disabled={isProcessing}
          className="w-full py-3.5 bg-black text-white border-2 border-black font-display font-black text-sm uppercase tracking-wider brutal-btn brutal-shadow flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            'AUTHENTICATING TRANSACTION...'
          ) : (
            <>
              <Zap className="w-4 h-4 text-[#FFE500]" />
              INSTANT UNLOCK ({selectedCurrency === 'IDR' ? 'Rp 25.000' : '$1.99'})
            </>
          )}
        </button>

        <div className="mt-3 text-center text-[10px] font-mono-code text-neutral-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Simulated one-time unlock experiment. No recurring subscription.</span>
        </div>
      </div>
    </div>
  );
};
