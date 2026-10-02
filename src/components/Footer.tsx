import React from 'react';
import { ViewRoute } from '../types';

interface FooterProps {
  onNavigate: (route: ViewRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-black text-white border-t-2 border-black mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <h3 className="font-display font-black text-xl text-[#FFE500] tracking-tight mb-2">
              PERSONAL YEAR WRAPPED
            </h3>
            <p className="text-sm text-neutral-300 max-w-md leading-relaxed mb-4">
              Transform your annual milestones, coding hours, gaming conquests, reading logs, and fitness triumphs into bold neo-brutalist 9:16 recap stories built for sharing.
            </p>
            <p className="text-xs text-neutral-400 font-mono-code">
              Notice: Archetypes and rankings are computed for entertainment and celebration purposes.
            </p>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-3">
              Explore Recaps
            </h4>
            <ul className="space-y-2 text-sm text-neutral-300 font-medium">
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-[#FFE500] transition-colors">
                  GitHub Dev Wrapped
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-[#FFE500] transition-colors">
                  Spotify Audio Recap
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-[#FFE500] transition-colors">
                  Steam & Gaming Wrapped
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-[#FFE500] transition-colors">
                  Goodreads 52 Books
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('explore')} className="hover:text-[#FFE500] transition-colors">
                  Runner & Strava Recap
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-3">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-neutral-300 font-medium">
              <li>
                <button onClick={() => onNavigate('create')} className="hover:text-[#FFE500] transition-colors">
                  Recap Builder
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-[#FFE500] transition-colors">
                  Pricing & Freemium
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('profile')} className="hover:text-[#FFE500] transition-colors">
                  My Saved Recaps
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-[#FFE500] transition-colors">
                  Admin & Analytics
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div>
            © {new Date().getFullYear()} Personal Year Wrapped. No unauthorized tracking. Your data stays in your browser.
          </div>
          <div className="flex items-center gap-4 font-mono-code">
            <span>9:16 SOCIAL FORMAT</span>
            <span>·</span>
            <span>NEO-BRUTALIST ENGINE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
