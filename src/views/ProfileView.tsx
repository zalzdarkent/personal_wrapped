import React, { useState, useEffect } from 'react';
import { ViewRoute, WrappedData } from '../types';
import { SAMPLE_PRESETS } from '../data/samplePresets';
import { Plus, Trash2, Play, Share2, Sparkles, Calendar, Trophy } from 'lucide-react';

interface ProfileViewProps {
  onNavigate: (route: ViewRoute) => void;
  onSelectRecap: (data: WrappedData) => void;
  savedRecaps: WrappedData[];
  onDeleteRecap: (id: string) => void;
  onOpenShareModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onNavigate,
  onSelectRecap,
  savedRecaps,
  onDeleteRecap,
  onOpenShareModal,
}) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="border-b-2 border-black pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-block px-2.5 py-0.5 bg-black text-[#FFE500] font-mono-code font-bold text-xs uppercase mb-2">
            LOCAL STORAGE HISTORY
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-black">
            MY WRAPPED RECORDER
          </h1>
          <p className="text-xs text-neutral-600 mt-1">
            All your generated wrapped dossiers saved privately in this browser session.
          </p>
        </div>

        <button
          onClick={() => onNavigate('create')}
          className="px-5 py-3 bg-[#FFE500] border-2 border-black text-black font-display font-black text-xs uppercase tracking-wider brutal-btn brutal-shadow flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          CREATE NEW WRAPPED
        </button>
      </div>

      {/* Recaps List */}
      {savedRecaps.length === 0 ? (
        <div className="p-12 bg-white border-4 border-black brutal-shadow text-center space-y-4 max-w-xl mx-auto">
          <div className="w-12 h-12 bg-black text-[#FFE500] border-2 border-black flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-display font-black text-xl text-black">
            NO RECATIVE DOSSIERS YET
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            You haven't generated a wrapped recap yet. Create one from scratch or load one of our realistic sample presets to test the experience.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => onNavigate('create')}
              className="px-4 py-2.5 bg-[#FFE500] border-2 border-black text-black font-display font-black text-xs uppercase brutal-btn"
            >
              CREATE NOW
            </button>
            <button
              onClick={() => {
                onSelectRecap(SAMPLE_PRESETS.github);
                onNavigate('result');
              }}
              className="px-4 py-2.5 bg-white border-2 border-black text-black font-display font-bold text-xs uppercase brutal-btn hover:bg-neutral-50"
            >
              LOAD GITHUB DEMO
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedRecaps.map((recap) => (
            <div
              key={recap.id}
              className="p-5 bg-white border-4 border-black brutal-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                  <span className="font-mono-code font-bold text-xs uppercase text-neutral-800">
                    {recap.category} · {recap.year}
                  </span>
                  <button
                    onClick={() => onDeleteRecap(recap.id)}
                    className="p-1 text-neutral-400 hover:text-red-600 transition-colors"
                    title="Delete saved recap"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="font-display font-black text-xl text-black mb-1">
                  {recap.title}
                </h3>
                <div className="font-mono-code text-xs text-neutral-600 mb-3">
                  {recap.userName} ({recap.handle})
                </div>

                {/* Metric pill */}
                <div className="p-3 bg-neutral-100 border border-black mb-3">
                  <div className="font-mono-code text-[10px] text-neutral-600 uppercase">
                    {recap.primaryMetric.label}
                  </div>
                  <div className="font-display font-black text-xl text-black">
                    {recap.primaryMetric.value.toLocaleString()} {recap.primaryMetric.unit}
                  </div>
                </div>

                <div className="text-xs text-neutral-700 font-mono-code flex items-center gap-1.5 mb-4">
                  <Trophy className="w-3.5 h-3.5 text-black" />
                  <span>{recap.archetype.title}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 pt-2 border-t-2 border-black">
                <button
                  onClick={() => {
                    onSelectRecap(recap);
                    onNavigate('result');
                  }}
                  className="flex-1 py-2 bg-[#FFE500] border-2 border-black text-black font-display font-black text-xs uppercase brutal-btn flex items-center justify-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  PLAY
                </button>
                <button
                  onClick={() => {
                    onSelectRecap(recap);
                    onOpenShareModal();
                  }}
                  className="p-2 border-2 border-black bg-white hover:bg-neutral-100 brutal-btn"
                  title="Share"
                >
                  <Share2 className="w-3.5 h-3.5 text-black" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
