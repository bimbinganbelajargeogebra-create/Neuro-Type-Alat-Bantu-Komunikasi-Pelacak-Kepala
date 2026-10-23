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
      className={`relative w-full rounded-2xl p-3 sm:p-4 md:p-5 transition-all duration-150 border-2 shadow-sm ${
        isHighContrast
          ? 'bg-black border-3 border-yellow-400 text-yellow-300'
          : isDark
          ? 'bg-slate-900 border-slate-700/90 text-white'
          : 'bg-white border-slate-300 text-slate-950'
      }`}
    >
      {/* Baris Atas: Label & Metadata Bersih Tanpa Pill Candy */}
      <div className="flex items-center justify-between pb-1.5 sm:pb-2 mb-1.5 border-b border-slate-800/20 dark:border-white/10 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <span
            className={`font-bold uppercase tracking-wider text-[11px] sm:text-xs ${
              isHighContrast
                ? 'text-yellow-400'
                : isDark
                ? 'text-sky-400'
                : 'text-sky-700'
            }`}
          >
            Pesan Anda
          </span>

          {isSpeaking && (
            <span className="flex items-center gap-1 font-semibold text-emerald-500 text-xs animate-pulse">
              <Volume2 className="w-3.5 h-3.5" /> Sedang berbicara...
            </span>
          )}

          {!hasIndonesianVoice && (
            <span
              className={`text-[11px] font-medium ${
                isHighContrast ? 'text-yellow-300' : 'text-amber-500'
              }`}
            >
              (Voice Default)
            </span>
          )}
        </div>

        {/* Metadata Angka: Clean Unboxed Text dengan Separator Titik Tengah */}
        <div className="flex items-center gap-1.5 text-xs font-mono opacity-80 tabular-nums">
          <span>{text.trim() ? text.trim().split(/\s+/).length : 0} kata</span>
          <span aria-hidden="true" className="opacity-50">·</span>
          <span>{text.length} huruf</span>
        </div>
      </div>

      {/* Area Teks Utama: Font Besar, Tegas & Kursor Berkedip Terang */}
      <div
        className="min-h-[48px] sm:min-h-[64px] md:min-h-[82px] max-h-[110px] sm:max-h-[135px] overflow-y-auto flex items-center flex-wrap gap-1 font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-snug tracking-tight break-words selection:bg-sky-500 selection:text-white pr-14 sm:pr-24"
        aria-live="polite"
        role="region"
        aria-label="Teks yang sedang diketik"
      >
        {text ? (
          <span className="break-all">{text}</span>
        ) : (
          <span className="opacity-35 italic text-base sm:text-xl md:text-2xl font-normal select-none">
            Arahkan kursor kepala ke tombol huruf untuk mulai mengetik...
          </span>
        )}
        {/* Kursor Berkedip Presisi */}
        <span
          className={`inline-block w-1.5 sm:w-2 h-6 sm:h-8 md:h-10 ml-0.5 animate-pulse ${
            isHighContrast
              ? 'bg-yellow-400'
              : isDark
              ? 'bg-sky-400'
              : 'bg-sky-600'
          }`}
          aria-hidden="true"
        />
      </div>

      {/* Tombol Bersihkan Teks Cepat */}
      {text.length > 0 && (
        <div className="absolute right-2.5 bottom-2.5 sm:right-3.5 sm:bottom-3.5 flex items-center">
          <button
            type="button"
            data-dwell-id="btn-clear-textbox"
            onClick={onClear}
            title="Bersihkan Semua Teks"
            aria-label="Bersihkan semua teks"
            className={`relative px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
              currentDwellId === 'btn-clear-textbox'
                ? 'bg-rose-600 text-white border-white scale-105'
                : isHighContrast
                ? 'bg-black text-yellow-300 border-yellow-400 hover:bg-yellow-950/40'
                : isDark
                ? 'bg-rose-950/50 text-rose-200 border-rose-800/80 hover:bg-rose-900/60'
                : 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100'
            }`}
          >
            {currentDwellId === 'btn-clear-textbox' && dwellProgress > 0 && (
              <span
                className="absolute inset-0 bg-white/25 rounded-xl pointer-events-none"
                style={{ width: `${dwellProgress * 100}%` }}
              />
            )}
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Kosongkan</span>
          </button>
        </div>
      )}
    </div>
  );
};
