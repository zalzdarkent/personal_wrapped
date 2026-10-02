import React, { useState } from 'react';
import { WrappedData } from '../types';
import { trackEvent } from '../utils/analytics';
import { Copy, Check, Share2, X, MessageCircle, Send, Globe } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: WrappedData;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, data }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate deep-link URL (using current window location or fallback)
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#/result/${data.id}?recap=${encodeURIComponent(data.id)}`
    : `https://personalwrapped.app/#/result/${data.id}`;

  const shareText = `Check out my 2026 ${data.category.toUpperCase()} Wrapped recap: ${data.primaryMetric.value.toLocaleString()} ${data.primaryMetric.unit}! Archetype: ${data.archetype.title}. View my story:`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      trackEvent('share_clicked', { method: 'copy_link', id: data.id });
      trackEvent('share_completed', { method: 'copy_link' });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${data.userName}'s 2026 Wrapped Recap`,
          text: shareText,
          url: shareUrl,
        });
        trackEvent('share_completed', { method: 'web_share_api' });
      } catch (err) {
        // User cancelled or unsupported
      }
    } else {
      handleCopyLink();
    }
  };

  const openExternalShare = (type: 'whatsapp' | 'twitter' | 'telegram' | 'linkedin') => {
    trackEvent('share_clicked', { platform: type });
    trackEvent('share_completed', { platform: type });

    let url = '';
    const encodedText = encodeURIComponent(`${shareText} ${shareUrl}`);
    const encodedUrl = encodeURIComponent(shareUrl);

    if (type === 'whatsapp') {
      url = `https://api.whatsapp.com/send?text=${encodedText}`;
    } else if (type === 'twitter') {
      url = `https://twitter.com/intent/tweet?text=${encodedText}`;
    } else if (type === 'telegram') {
      url = `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(shareText)}`;
    } else if (type === 'linkedin') {
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white border-4 border-black brutal-shadow-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 border-2 border-black bg-white flex items-center justify-center brutal-btn hover:bg-neutral-100"
        >
          <X className="w-5 h-5 text-black" />
        </button>

        <div className="mb-5">
          <div className="inline-block px-2 py-0.5 bg-black text-[#D2FF3A] font-mono-code font-bold text-xs uppercase mb-2">
            VIRAL DISTRIBUTION
          </div>
          <h2 className="font-display font-black text-2xl text-black">
            SHARE YOUR WRAPPED
          </h2>
          <p className="text-xs text-neutral-600 mt-1">
            Let friends inspect your 2026 milestones, compare ranks, and create their own recap.
          </p>
        </div>

        {/* Copy Link Input Bar */}
        <div className="mb-5">
          <label className="block text-xs font-mono-code font-bold uppercase text-neutral-700 mb-1.5">
            Direct Recap Deep-Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 p-2.5 bg-neutral-100 border-2 border-black font-mono-code text-xs text-black truncate select-all focus:outline-hidden"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 bg-[#FFE500] border-2 border-black font-display font-black text-xs uppercase text-black brutal-btn shrink-0 flex items-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
              {copied ? 'COPIED!' : 'COPY'}
            </button>
          </div>
        </div>

        {/* 1-Click Social Share Buttons */}
        <div className="space-y-2 mb-6">
          <div className="text-xs font-mono-code font-bold uppercase text-neutral-700 mb-1">
            Fast Share to Platforms
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => openExternalShare('whatsapp')}
              className="p-3 border-2 border-black bg-emerald-50 hover:bg-emerald-100 text-black font-display font-bold text-xs flex items-center justify-center gap-2 brutal-btn"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              WhatsApp
            </button>
            <button
              onClick={() => openExternalShare('twitter')}
              className="p-3 border-2 border-black bg-neutral-100 hover:bg-neutral-200 text-black font-display font-bold text-xs flex items-center justify-center gap-2 brutal-btn"
            >
              <Globe className="w-4 h-4 text-neutral-800" />
              X / Twitter
            </button>
            <button
              onClick={() => openExternalShare('telegram')}
              className="p-3 border-2 border-black bg-sky-50 hover:bg-sky-100 text-black font-display font-bold text-xs flex items-center justify-center gap-2 brutal-btn"
            >
              <Send className="w-4 h-4 text-sky-600" />
              Telegram
            </button>
            <button
              onClick={handleNativeShare}
              className="p-3 border-2 border-black bg-[#FFE500] hover:bg-yellow-400 text-black font-display font-bold text-xs flex items-center justify-center gap-2 brutal-btn"
            >
              <Share2 className="w-4 h-4 text-black" />
              System Share
            </button>
          </div>
        </div>

        {/* Viral loop banner */}
        <div className="p-3 bg-black text-white border-2 border-black text-xs font-mono-code flex items-center justify-between">
          <span>Attribution: <strong>personalwrapped.app</strong></span>
          <span className="text-[#D2FF3A]">1-CLICK IMPORT</span>
        </div>
      </div>
    </div>
  );
};
