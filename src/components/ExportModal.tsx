import React, { useState } from 'react';
import { StorySlide, ThemeConfig, WrappedData } from '../types';
import { downloadSlidePNG, downloadAllSlidesAsZip } from '../utils/exportImage';
import { trackEvent } from '../utils/analytics';
import { Download, X, Check, Lock, Sparkles, FolderArchive, FileArchive } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides: StorySlide[];
  data: WrappedData;
  activeTheme: ThemeConfig;
  isPremiumUnlocked: boolean;
  onOpenUpgradeModal: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  slides,
  data,
  activeTheme,
  isPremiumUnlocked,
  onOpenUpgradeModal,
}) => {
  const [selectedSlideId, setSelectedSlideId] = useState(slides[0]?.id || '');
  const [isExportingSingle, setIsExportingSingle] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState<{ current: number; total: number } | null>(null);

  if (!isOpen) return null;

  const currentSlide = slides.find((s) => s.id === selectedSlideId) || slides[0];

  const handleDownloadSingle = async () => {
    try {
      setIsExportingSingle(true);
      await downloadSlidePNG(currentSlide, data, activeTheme, isPremiumUnlocked);
      trackEvent('export_completed', { slideType: currentSlide.type, isPremium: isPremiumUnlocked });
      if (isPremiumUnlocked) {
        trackEvent('premium-export-conversion');
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExportingSingle(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!isPremiumUnlocked) {
      onOpenUpgradeModal();
      return;
    }

    try {
      setIsExportingZip(true);
      setZipProgress({ current: 1, total: slides.length });

      await downloadAllSlidesAsZip(
        slides,
        data,
        activeTheme,
        isPremiumUnlocked,
        (current, total) => {
          setZipProgress({ current, total });
        }
      );

      trackEvent('export_completed', { type: 'zip_all_slides', count: slides.length });
    } catch (err) {
      console.error('ZIP export error:', err);
    } finally {
      setIsExportingZip(false);
      setZipProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white border-4 border-black brutal-shadow-xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 border-2 border-black bg-white flex items-center justify-center brutal-btn hover:bg-neutral-100"
        >
          <X className="w-5 h-5 text-black" />
        </button>

        <div className="mb-6">
          <div className="inline-block px-2.5 py-0.5 bg-black text-[#FFE500] font-mono-code font-bold text-xs uppercase mb-2">
            9:16 SOCIAL EXPORT
          </div>
          <h2 className="font-display font-black text-2xl text-black">
            EXPORT STORY SLIDES
          </h2>
          <p className="text-xs text-neutral-600 mt-1">
            Crisp 1080x1920 PNG format ready for Instagram Stories, TikTok, Twitter/X, and WhatsApp Status.
          </p>
        </div>

        {/* Slide Selector */}
        <div className="mb-5">
          <label className="block text-xs font-mono-code font-bold uppercase text-neutral-700 mb-2">
            Select Slide to Export Individually
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setSelectedSlideId(s.id)}
                className={`p-2 border-2 border-black text-left transition-all ${
                  selectedSlideId === s.id
                    ? 'bg-black text-[#FFE500] brutal-shadow-sm'
                    : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                <div className="font-mono-code text-[10px] opacity-70">
                  SLIDE 0{idx + 1}
                </div>
                <div className="font-display font-black text-xs truncate">
                  {s.type.replace('_', ' ')}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Watermark Notice */}
        <div className="p-3 mb-5 border-2 border-black bg-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono-code text-xs font-bold text-neutral-800">
              Attribution
            </span>
            <span className="text-[10px] font-mono-code text-neutral-600">
              {isPremiumUnlocked ? 'Clean (VIP Watermark Removed)' : 'Included: personalwrapped.app'}
            </span>
          </div>

          {!isPremiumUnlocked && (
            <button
              onClick={() => {
                onClose();
                onOpenUpgradeModal();
              }}
              className="text-xs font-bold text-black underline flex items-center gap-1 hover:text-amber-600"
            >
              <Lock className="w-3 h-3" />
              Remove
            </button>
          )}
        </div>

        {/* Primary Download Actions */}
        <div className="space-y-3">
          {/* Download Single PNG */}
          <button
            onClick={handleDownloadSingle}
            disabled={isExportingSingle || isExportingZip}
            className="w-full py-3.5 bg-[#FFE500] border-2 border-black text-black font-display font-black text-sm uppercase tracking-wider brutal-btn brutal-shadow flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isExportingSingle ? 'RENDERING 1080x1920...' : 'DOWNLOAD SELECTED SLIDE (PNG)'}
          </button>

          {/* Download All as ZIP */}
          <button
            onClick={handleDownloadZip}
            disabled={isExportingSingle || isExportingZip}
            className={`w-full py-3.5 border-3 border-black font-display font-black text-xs sm:text-sm uppercase tracking-wider brutal-btn flex items-center justify-center gap-2 ${
              isPremiumUnlocked
                ? 'bg-[#D2FF3A] text-black brutal-shadow'
                : 'bg-white text-neutral-800 hover:bg-neutral-50'
            }`}
          >
            {isExportingZip ? (
              <>
                <FileArchive className="w-4 h-4 animate-spin" />
                <span>
                  PACKAGING ZIP ARCHIVE ({zipProgress?.current || 1}/{zipProgress?.total || slides.length})...
                </span>
              </>
            ) : isPremiumUnlocked ? (
              <>
                <FolderArchive className="w-4 h-4" />
                <span>DOWNLOAD ALL {slides.length} SLIDES (ZIP ARCHIVE)</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>DOWNLOAD ALL SLIDES AS .ZIP (PRO ONLY)</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-3 text-center text-[10px] font-mono-code text-neutral-500">
          ZIP archive includes numbered files (01_intro.png to 08_final_card.png) ready for social stories.
        </div>
      </div>
    </div>
  );
};
