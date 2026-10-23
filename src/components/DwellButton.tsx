/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { AppTheme, ButtonSize } from '../types';

export interface DwellButtonProps {
  id: string;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'warning' | 'neutral';
  size?: ButtonSize;
  theme?: AppTheme;
  isSwitchFocused?: boolean;
  currentDwellId?: string | null;
  dwellProgress?: number; // 0.0 - 1.0
  className?: string;
  ariaLabel?: string;
}

export const DwellButton: React.FC<DwellButtonProps> = ({
  id,
  label,
  subLabel,
  icon,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'large',
  theme = 'dark',
  isSwitchFocused = false,
  currentDwellId = null,
  dwellProgress = 0,
  className = '',
  ariaLabel,
}) => {
  const isBeingDwelled = currentDwellId === id && dwellProgress > 0;
  const [justActivated, setJustActivated] = useState(false);
  const prevProgressRef = useRef(dwellProgress);

  // Efek animasi saat dwell selesai
  useEffect(() => {
    if (prevProgressRef.current < 0.95 && dwellProgress >= 1.0 && currentDwellId === id) {
      setJustActivated(true);
      const timer = setTimeout(() => setJustActivated(false), 300);
      return () => clearTimeout(timer);
    }
    prevProgressRef.current = dwellProgress;
  }, [dwellProgress, currentDwellId, id]);

  // Gaya berdasarkan varian dan tema
  const getVariantStyles = () => {
    if (disabled) {
      return 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border-slate-700';
    }

    if (theme === 'high-contrast') {
      if (isSwitchFocused || isBeingDwelled) {
        return 'bg-yellow-400 text-black border-2 sm:border-4 border-white font-black shadow-[0_0_15px_#facc15]';
      }
      return 'bg-black text-yellow-300 border-2 sm:border-4 border-yellow-400 font-extrabold hover:bg-yellow-950/40';
    }

    if (theme === 'light') {
      switch (variant) {
        case 'accent':
          return isBeingDwelled || isSwitchFocused
            ? 'bg-emerald-600 text-white border-2 border-emerald-400 shadow-lg scale-[1.02]'
            : 'bg-emerald-100 text-emerald-950 border-2 border-emerald-400/80 hover:bg-emerald-200';
        case 'danger':
          return isBeingDwelled || isSwitchFocused
            ? 'bg-rose-600 text-white border-2 border-rose-400 shadow-lg scale-[1.02]'
            : 'bg-rose-100 text-rose-950 border-2 border-rose-400/80 hover:bg-rose-200';
        case 'warning':
          return isBeingDwelled || isSwitchFocused
            ? 'bg-amber-600 text-white border-2 border-amber-400 shadow-lg scale-[1.02]'
            : 'bg-amber-100 text-amber-950 border-2 border-amber-400/80 hover:bg-amber-200';
        case 'secondary':
          return isBeingDwelled || isSwitchFocused
            ? 'bg-slate-300 text-slate-950 border-2 border-slate-500 shadow-lg scale-[1.02]'
            : 'bg-slate-200 text-slate-900 border-2 border-slate-400 hover:bg-slate-300';
        default:
          return isBeingDwelled || isSwitchFocused
            ? 'bg-sky-600 text-white border-2 border-sky-400 shadow-lg scale-[1.02]'
            : 'bg-white text-slate-900 border-2 border-slate-300 hover:bg-sky-50 shadow-sm';
      }
    }

    // Default Dark Theme
    switch (variant) {
      case 'accent': // e.g. BICARA / SUARA
        return isBeingDwelled || isSwitchFocused
          ? 'bg-emerald-600 text-white border-2 border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-[1.02]'
          : 'bg-emerald-950/70 text-emerald-100 border-2 border-emerald-500/60 hover:border-emerald-400 hover:bg-emerald-900/80';
      case 'danger': // e.g. HAPUS
        return isBeingDwelled || isSwitchFocused
          ? 'bg-rose-600 text-white border-2 border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.5)] scale-[1.02]'
          : 'bg-rose-950/60 text-rose-100 border-2 border-rose-600/60 hover:border-rose-400 hover:bg-rose-900/80';
      case 'warning': // e.g. JEDA
        return isBeingDwelled || isSwitchFocused
          ? 'bg-amber-600 text-white border-2 border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-[1.02]'
          : 'bg-amber-950/60 text-amber-100 border-2 border-amber-500/60 hover:border-amber-400 hover:bg-amber-900/80';
      case 'secondary': // e.g. SPASI / KEMBALI
        return isBeingDwelled || isSwitchFocused
          ? 'bg-slate-700 text-white border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-[1.02]'
          : 'bg-slate-800/80 text-slate-200 border-2 border-slate-700 hover:border-slate-500 hover:bg-slate-800';
      default: // Tombol Huruf Utama
        return isBeingDwelled || isSwitchFocused
          ? 'bg-cyan-600 text-white border-2 border-cyan-300 shadow-[0_0_22px_rgba(6,182,212,0.6)] scale-[1.02]'
          : 'bg-slate-900/90 text-cyan-50 border-2 border-slate-700/90 hover:border-cyan-500/80 hover:bg-slate-800/90';
    }
  };

  // Dimensi ukuran tombol yang responsif dari HP hingga monitor PC 4K
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'h-full min-h-[46px] sm:min-h-[58px] md:min-h-[72px] text-sm sm:text-base md:text-lg p-1.5 sm:p-2';
      case 'medium':
        return 'h-full min-h-[54px] sm:min-h-[72px] md:min-h-[90px] text-base sm:text-lg md:text-xl p-2 sm:p-2.5';
      default: // large
        return 'h-full min-h-[60px] sm:min-h-[82px] md:min-h-[100px] lg:min-h-[115px] text-lg sm:text-xl md:text-2xl lg:text-3xl p-2 sm:p-3 md:p-4';
    }
  };

  return (
    <button
      type="button"
      data-dwell-id={id}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          setJustActivated(true);
          setTimeout(() => setJustActivated(false), 250);
          onClick();
        }
      }}
      aria-label={ariaLabel || label}
      aria-pressed={isBeingDwelled}
      className={`relative select-none rounded-xl sm:rounded-2xl flex flex-col items-center justify-center font-bold tracking-wide transition-all duration-150 outline-none focus-visible:ring-4 focus-visible:ring-cyan-400 overflow-hidden ${getSizeStyles()} ${getVariantStyles()} ${
        justActivated ? 'scale-95 ring-4 ring-white' : ''
      } ${className}`}
    >
      {/* Background Fill Progress Bar (mengisi dari bawah ke atas saat ditahan) */}
      {isBeingDwelled && !disabled && (
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none transition-all duration-75 ease-linear opacity-30"
          style={{
            height: `${dwellProgress * 100}%`,
            backgroundColor:
              theme === 'high-contrast'
                ? '#ffffff'
                : variant === 'accent'
                ? '#10b981'
                : variant === 'danger'
                ? '#ef4444'
                : '#06b6d4',
          }}
          aria-hidden="true"
        />
      )}

      {/* Cincin Progres Dwell SVG di Pojok Kanan Atas */}
      {isBeingDwelled && !disabled && (
        <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 pointer-events-none" aria-hidden="true">
          <svg className="w-4 h-4 sm:w-6 sm:h-6 transform -rotate-90">
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="rgba(0,0,0,0.4)"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="2.5"
            />
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="none"
              stroke={theme === 'high-contrast' ? '#facc15' : '#38bdf8'}
              strokeWidth="3"
              strokeDasharray={2 * Math.PI * 9}
              strokeDashoffset={2 * Math.PI * 9 * (1 - dwellProgress)}
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/* Konten Tombol */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-0.5 sm:gap-1 text-center w-full px-1">
        {icon && (
          <div className="text-base sm:text-xl md:text-2xl mb-0.5 shrink-0 flex items-center justify-center">
            {icon}
          </div>
        )}
        <span className="font-extrabold tracking-wider leading-none drop-shadow-sm truncate w-full">
          {label}
        </span>
        {subLabel && (
          <span
            className={`hidden xs:inline-block sm:inline-block text-[9px] sm:text-xs md:text-sm font-semibold tracking-normal opacity-80 truncate max-w-full ${
              theme === 'high-contrast' ? 'text-yellow-200' : 'text-slate-300'
            }`}
          >
            {subLabel}
          </span>
        )}
      </div>

      {/* Indikator Fokus Scanning */}
      {isSwitchFocused && (
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-full w-full bg-cyan-500"></span>
        </span>
      )}
    </button>
  );
};
