import React from 'react';
import { Sparkles, Volume2, VolumeX, Shield, Compass, Plus, CreditCard, History } from 'lucide-react';
import { ViewRoute } from '../types';
import { isSoundEnabled, setSoundEnabled } from '../utils/sound';

interface NavbarProps {
  currentRoute: ViewRoute;
  onNavigate: (route: ViewRoute) => void;
  isPremiumUnlocked?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  isPremiumUnlocked = false,
}) => {
  const [soundOn, setSoundOn] = React.useState(isSoundEnabled());

  const toggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8F7F4] border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="text-left font-display font-black text-lg sm:text-xl tracking-tight text-black hover:opacity-80 transition-opacity truncate"
        >
          PERSONAL YEAR WRAPPED
        </button>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-neutral-800">
          <button
            onClick={() => onNavigate('explore')}
            className={`flex items-center gap-1.5 transition-colors hover:text-black ${
              currentRoute === 'explore' ? 'text-black underline underline-offset-4 decoration-2 decoration-black' : ''
            }`}
          >
            <Compass className="w-4 h-4" />
            Explore
          </button>
          <button
            onClick={() => onNavigate('create')}
            className={`flex items-center gap-1.5 transition-colors hover:text-black ${
              currentRoute === 'create' ? 'text-black underline underline-offset-4 decoration-2 decoration-black' : ''
            }`}
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
          <button
            onClick={() => onNavigate('profile')}
            className={`flex items-center gap-1.5 transition-colors hover:text-black ${
              currentRoute === 'profile' ? 'text-black underline underline-offset-4 decoration-2 decoration-black' : ''
            }`}
          >
            <History className="w-4 h-4" />
            My Recaps
          </button>
          <button
            onClick={() => onNavigate('pricing')}
            className={`flex items-center gap-1.5 transition-colors hover:text-black ${
              currentRoute === 'pricing' ? 'text-black underline underline-offset-4 decoration-2 decoration-black' : ''
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Pricing
            {isPremiumUnlocked && (
              <span className="text-[10px] bg-black text-[#D2FF3A] px-1 py-0.5 font-mono-code uppercase font-bold">
                PRO
              </span>
            )}
          </button>
          <button
            onClick={() => onNavigate('admin')}
            className={`flex items-center gap-1.5 transition-colors hover:text-black ${
              currentRoute === 'admin' ? 'text-black underline underline-offset-4 decoration-2 decoration-black' : ''
            }`}
          >
            <Shield className="w-4 h-4" />
            Admin
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleSound}
            aria-label={soundOn ? 'Disable Sound Effects' : 'Enable Sound Effects'}
            title={soundOn ? 'Sound On' : 'Sound Muted'}
            className="w-10 h-10 border-2 border-black bg-white flex items-center justify-center brutal-btn brutal-shadow-sm text-black"
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-neutral-400" />}
          </button>

          <button
            onClick={() => onNavigate('create')}
            className="h-10 px-4 bg-[#FFE500] border-2 border-black text-black font-display font-black text-xs sm:text-sm tracking-wide flex items-center gap-1.5 brutal-btn brutal-shadow whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">CREATE YOUR</span> WRAPPED
          </button>
        </div>
      </div>
    </header>
  );
};
