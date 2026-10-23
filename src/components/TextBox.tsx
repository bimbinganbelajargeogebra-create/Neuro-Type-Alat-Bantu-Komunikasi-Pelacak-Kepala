/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, Trash2 } from 'lucide-react';
import { AppTheme } from '../types';

interface TextBoxProps {
  text: string;
  onClear: () => void;
  onSpeak: () => void;
  isSpeaking: boolean;
  theme: AppTheme;
  hasIndonesianVoice: boolean;
  currentDwellId: string | null;
  dwellProgress: number;
}

export const TextBox: React.FC<TextBoxProps> = ({
  text,
  onClear,
  onSpeak,
  isSpeaking,
  theme,
  hasIndonesianVoice,
  currentDwellId,
  dwellProgress,
}) => {
  const isDark = theme === 'dark';
  const isHighContrast = theme === 'high-contrast';

  return (
    <div
      className={`relative w-full rounded-xl sm:rounded-2xl p-2.5 sm:p-4 md:p-5 transition-all duration-200 border-2 shadow-lg ${
        isHighContrast
          ? 'bg-black border-yellow-400 text-yellow-300'
          : isDark
          ? 'bg-slate-900/95 border-slate-700/80 text-white'
          : 'bg-white border-slate-300 text-slate-900'
      }`}
    >
      {/* Baris Atas: Label & Status Suara */}
      <div className="flex items-center justify-between pb-1 sm:pb-2 mb-1 border-b border-white/10 text-[11px] sm:text-xs md:text-sm">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="font-bold uppercase tracking-wider text-cyan-400 text-[10px] sm:text-xs">
            Pesan Anda
          </span>
          {isSpeaking && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-500/20 text-emerald-300 animate-pulse border border-emerald-500/40">
              <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Berbicara...
            </span>
          )}
          {!hasIndonesianVoice && (
            <span
              className="hidden sm:inline text-amber-400 text-[10px] bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30 truncate max-w-[150px] sm:max-w-none"
              title="Browser tidak memiliki voice bahasa Indonesia bawaan, menggunakan voice sistem default."
            >
              Voice Default
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-mono opacity-70">
          <span>{text.trim() ? text.trim().split(/\s+/).length : 0} kata</span>
          <span>•</span>
          <span>{text.length} huruf</span>
        </div>
      </div>

      {/* Area Teks Utama: Fluid Font dari HP hingga Monitor PC */}
      <div
        className="min-h-[46px] sm:min-h-[64px] md:min-h-[80px] max-h-[110px] sm:max-h-[130px] overflow-y-auto flex items-center flex-wrap gap-1 font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight tracking-wide break-words selection:bg-cyan-500 selection:text-black pr-12 sm:pr-20"
        aria-live="polite"
        role="region"
        aria-label="Teks yang sedang diketik"
      >
        {text ? (
          <span className="break-all">{text}</span>
        ) : (
          <span className="opacity-30 italic text-sm sm:text-lg md:text-2xl font-normal select-none">
            Gerakkan kepala untuk memilih huruf...
          </span>
        )}
        {/* Kursor Berkedip */}
        <span
          className={`inline-block w-1 sm:w-1.5 h-5 sm:h-7 md:h-9 ml-0.5 animate-pulse ${
            isHighContrast
              ? 'bg-yellow-400'
              : isDark
              ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
              : 'bg-sky-600'
          }`}
          aria-hidden="true"
        />
      </div>

      {/* Tombol Bersihkan Teks Cepat */}
      {text.length > 0 && (
        <div className="absolute right-2 bottom-2 sm:right-3 sm:bottom-3 flex items-center">
          <button
            type="button"
            data-dwell-id="btn-clear-textbox"
            onClick={onClear}
            title="Bersihkan Semua Teks"
            aria-label="Bersihkan semua teks"
            className={`relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl border flex items-center gap-1 text-[11px] sm:text-xs font-bold transition-all ${
              currentDwellId === 'btn-clear-textbox'
                ? 'bg-rose-600 text-white border-white scale-105'
                : 'bg-rose-950/40 text-rose-300 border-rose-800/60 hover:bg-rose-900/60'
            }`}
          >
            {currentDwellId === 'btn-clear-textbox' && dwellProgress > 0 && (
              <span
                className="absolute inset-0 bg-white/30 rounded-lg sm:rounded-xl pointer-events-none"
                style={{ width: `${dwellProgress * 100}%` }}
              />
            )}
            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden xs:inline">Hapus</span>
          </button>
        </div>
      )}
    </div>
  );
};
