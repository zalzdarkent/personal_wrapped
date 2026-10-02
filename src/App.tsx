/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeConfig, ViewRoute, WrappedData } from './types';
import { SAMPLE_PRESETS } from './data/samplePresets';
import { THEMES } from './data/themes';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingView } from './views/LandingView';
import { ExploreView } from './views/ExploreView';
import { CreateView } from './views/CreateView';
import { ResultView } from './views/ResultView';
import { PricingView } from './views/PricingView';
import { ProfileView } from './views/ProfileView';
import { AdminView } from './views/AdminView';
import { ExportModal } from './components/ExportModal';
import { ShareModal } from './components/ShareModal';
import { UpgradeModal } from './components/UpgradeModal';
import { generateStorySlides } from './utils/recapEngine';
import { trackEvent } from './utils/analytics';

const STORAGE_SAVED_RECAPS = 'pyw_saved_recaps';
const STORAGE_PRO_UNLOCKED = 'pyw_pro_unlocked';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<ViewRoute>('landing');
  const [activeRecap, setActiveRecap] = useState<WrappedData>(SAMPLE_PRESETS.github);
  const [presetToCustomize, setPresetToCustomize] = useState<WrappedData | null>(null);
  const [activeTheme, setActiveTheme] = useState<ThemeConfig>(THEMES[0]);
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_PRO_UNLOCKED) === 'true';
    } catch {
      return false;
    }
  });

  const [savedRecaps, setSavedRecaps] = useState<WrappedData[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SAVED_RECAPS);
      if (raw) return JSON.parse(raw);
      // Seed with initial presets so user profile is not empty
      return [SAMPLE_PRESETS.github, SAMPLE_PRESETS.spotify];
    } catch {
      return [SAMPLE_PRESETS.github];
    }
  });

  // Modals state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  // Sync hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      const [path, query] = hash.split('?');

      if (path.startsWith('result/')) {
        const id = path.replace('result/', '');
        const matched = savedRecaps.find((r) => r.id === id) || SAMPLE_PRESETS[id] || Object.values(SAMPLE_PRESETS).find(p => p.id === id);
        if (matched) {
          setActiveRecap(matched);
        }
        setCurrentRoute('result');
      } else if (['landing', 'explore', 'create', 'pricing', 'profile', 'admin'].includes(path)) {
        setCurrentRoute(path as ViewRoute);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [savedRecaps]);

  const navigateTo = (route: ViewRoute) => {
    setCurrentRoute(route);
    window.location.hash = `#/${route}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectRecap = (recap: WrappedData) => {
    setActiveRecap(recap);
    window.location.hash = `#/result/${recap.id}`;
  };

  const handleCustomizePreset = (preset: WrappedData) => {
    setPresetToCustomize(preset);
    navigateTo('create');
  };

  const handleSaveAndReveal = (newRecap: WrappedData, selectedTheme: ThemeConfig) => {
    setActiveTheme(selectedTheme);
    setActiveRecap(newRecap);
    const updated = [newRecap, ...savedRecaps.filter((r) => r.id !== newRecap.id)];
    setSavedRecaps(updated);
    try {
      localStorage.setItem(STORAGE_SAVED_RECAPS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage save error:', e);
    }
    navigateTo('result');
  };

  const handleDeleteRecap = (id: string) => {
    const updated = savedRecaps.filter((r) => r.id !== id);
    setSavedRecaps(updated);
    try {
      localStorage.setItem(STORAGE_SAVED_RECAPS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage delete error:', e);
    }
  };

  const handleUpgradeSuccess = () => {
    setIsPremiumUnlocked(true);
    try {
      localStorage.setItem(STORAGE_PRO_UNLOCKED, 'true');
    } catch (e) {
      console.warn('Upgrade storage error:', e);
    }
    trackEvent('purchase_completed');
  };

  const slides = generateStorySlides(isPremiumUnlocked);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-neutral-900 selection:bg-black selection:text-[#FFE500]">
      {/* Neo-brutalist Top Bar */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={navigateTo}
        isPremiumUnlocked={isPremiumUnlocked}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentRoute === 'landing' && (
          <LandingView
            onNavigate={navigateTo}
            onSelectRecap={handleSelectRecap}
            isPremiumUnlocked={isPremiumUnlocked}
            onOpenUpgradeModal={() => setIsUpgradeOpen(true)}
            onOpenExportModal={() => setIsExportOpen(true)}
            onOpenShareModal={() => setIsShareOpen(true)}
          />
        )}

        {currentRoute === 'explore' && (
          <ExploreView
            onNavigate={navigateTo}
            onSelectRecap={handleSelectRecap}
            onCustomizePreset={handleCustomizePreset}
          />
        )}

        {currentRoute === 'create' && (
          <CreateView
            onNavigate={navigateTo}
            onSaveAndReveal={handleSaveAndReveal}
            initialPreset={presetToCustomize}
          />
        )}

        {currentRoute === 'result' && (
          <ResultView
            data={activeRecap}
            theme={activeTheme}
            onThemeChange={setActiveTheme}
            isPremiumUnlocked={isPremiumUnlocked}
            onNavigate={navigateTo}
            onOpenUpgradeModal={() => setIsUpgradeOpen(true)}
            onOpenExportModal={() => setIsExportOpen(true)}
            onOpenShareModal={() => setIsShareOpen(true)}
          />
        )}

        {currentRoute === 'pricing' && (
          <PricingView
            onNavigate={navigateTo}
            isPremiumUnlocked={isPremiumUnlocked}
            onOpenUpgradeModal={() => setIsUpgradeOpen(true)}
          />
        )}

        {currentRoute === 'profile' && (
          <ProfileView
            onNavigate={navigateTo}
            onSelectRecap={handleSelectRecap}
            savedRecaps={savedRecaps}
            onDeleteRecap={handleDeleteRecap}
            onOpenShareModal={() => setIsShareOpen(true)}
          />
        )}

        {currentRoute === 'admin' && (
          <AdminView onNavigate={navigateTo} />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={navigateTo} />

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        slides={slides}
        data={activeRecap}
        activeTheme={activeTheme}
        isPremiumUnlocked={isPremiumUnlocked}
        onOpenUpgradeModal={() => setIsUpgradeOpen(true)}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        data={activeRecap}
      />

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        onSuccess={handleUpgradeSuccess}
      />
    </div>
  );
}
