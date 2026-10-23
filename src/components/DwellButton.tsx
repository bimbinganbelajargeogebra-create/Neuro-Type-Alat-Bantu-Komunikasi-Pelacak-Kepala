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

  // Animasi tactile sederhana saat aktivasi selesai
  useEffect(() => {
    if (prevProgressRef.current < 0.95 && dwellProgress >= 1.0 && currentDwellId === id) {
      setJustActivated(true);
      const timer = setTimeout(() => setJustActivated(false), 200);
      return () => clearTimeout(timer);
    }
    prevProgressRef.current = dwellProgress;
  }, [dwellProgress, currentDwellId, id]);

  // Gaya varian dengan kontras tinggi (WCAG AA/AAA) dan estetika minimalis
  const getVariantStyles = () => {
    if (disabled) {
      return 'opacity-35 cursor-not-allowed bg-slate-800 text-slate-500 border-slate-700/60';
    }

    // 1. TEMA HIGH-CONTRAST (WCAG AAA - Hitam & Kuning Kontras Maksimal)
    if (theme === 'high-contrast') {
      if (isSwitchFocused || isBeingDwelled) {
        return 'bg-yellow-400 text-black border-3 border-white font-black shadow-[0_0_0_2px_#000] scale-[1.01]';
      }
      return 'bg-black text-yellow-300 border-3 border-yellow-400 font-black hover:bg-yellow-950/40';
    }

    // 2. TEMA LIGHT (Minimalis & Bersih - Latar Putih/Abu Lembut, Teks Pekat)
    if (theme === 'light') {
      switch (variant) {
        case 'accent': // BICARA
          return isBeingDwelled || isSwitchFocused
            ? 'bg-emerald-600 text-white border-2 border-emerald-700 shadow-md scale-[1.01]'
            : 'bg-emerald-50 text-emerald-950 border-2 border-emerald-500/70 hover:bg-emerald-100 hover:border-emerald-600';
        case 'danger': // HAPUS
          return isBeingDwelled || isSwitchFocused
            ? 'bg-rose-600 text-white border-2 border-rose-700 shadow-md scale-[1.01]'
            : 'bg-rose-50 text-rose-950 border-2 border-rose-500/70 hover:bg-rose-100 hover:border-rose-600';
        case 'warning': // JEDA / FRASA
          return isBeingDwelled || isSwitchFocused
            ? 'bg-amber-600 text-white border-2 border-amber-700 shadow-md scale-[1.01]'
            : 'bg-amber-50 text-amber-950 border-2 border-amber-500/70 hover:bg-amber-100 hover:border-amber-600';
        case 'secondary': // SPASI / KEMBALI
          return isBeingDwelled || isSwitchFocused
            ? 'bg-slate-800 text-white border-2 border-slate-900 shadow-md scale-[1.01]'
            : 'bg-slate-100 text-slate-900 border-2 border-slate-300 hover:bg-slate-200 hover:border-slate-400';
        default: // Tombol Huruf Utama
          return isBeingDwelled || isSwitchFocused
            ? 'bg-sky-600 text-white border-2 border-sky-700 shadow-md scale-[1.01]'
            : 'bg-white text-slate-950 border-2 border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm';
      }
    }

    // 3. TEMA DARK (Minimalis Modern - Latar Gelap Tenang, Kontras Tajam)
    switch (variant) {
      case 'accent': // BICARA
        return isBeingDwelled || isSwitchFocused
          ? 'bg-emerald-500 text-slate-950 border-2 border-white shadow-lg scale-[1.01]'
          : 'bg-emerald-950/50 text-emerald-100 border-2 border-emerald-500/60 hover:border-emerald-400 hover:bg-emerald-900/60';
      case 'danger': // HAPUS
        return isBeingDwelled || isSwitchFocused
          ? 'bg-rose-500 text-white border-2 border-white shadow-lg scale-[1.01]'
          : 'bg-rose-950/50 text-rose-100 border-2 border-rose-500/60 hover:border-rose-400 hover:bg-rose-900/60';
      case 'warning': // JEDA / FRASA
        return isBeingDwelled || isSwitchFocused
          ? 'bg-amber-500 text-slate-950 border-2 border-white shadow-lg scale-[1.01]'
          : 'bg-amber-950/50 text-amber-100 border-2 border-amber-500/60 hover:border-amber-400 hover:bg-amber-900/60';
      case 'secondary': // SPASI / KEMBALI
        return isBeingDwelled || isSwitchFocused
          ? 'bg-cyan-500 text-slate-950 border-2 border-white shadow-lg scale-[1.01]'
          : 'bg-slate-800/90 text-slate-100 border-2 border-slate-600/80 hover:border-slate-400 hover:bg-slate-800';
      default: // Tombol Huruf Utama
        return isBeingDwelled || isSwitchFocused
          ? 'bg-sky-500 text-slate-950 border-2 border-white shadow-lg scale-[1.01]'
          : 'bg-slate-900/90 text-slate-50 border-2 border-slate-700/80 hover:border-sky-400 hover:bg-slate-850';
    }
  };

  // Ukuran tombol yang proporsional & nyaman untuk pengguna disabilitas motorik
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'h-full min-h-[48px] sm:min-h-[60px] md:min-h-[72px] text-sm sm:text-base md:text-lg p-1.5 sm:p-2';
      case 'medium':
        return 'h-full min-h-[58px] sm:min-h-[76px] md:min-h-[92px] text-base sm:text-lg md:text-xl p-2 sm:p-2.5';
      default: // large (standar ergonomis)
        return 'h-full min-h-[66px] sm:min-h-[86px] md:min-h-[104px] lg:min-h-[118px] text-xl sm:text-2xl md:text-3xl lg:text-4xl p-2 sm:p-3 md:p-4';
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
          setTimeout(() => setJustActivated(false), 200);
          onClick();
        }
      }}
      aria-label={ariaLabel || label}
      aria-pressed={isBeingDwelled}
      className={`relative select-none rounded-xl sm:rounded-2xl flex flex-col items-center justify-center font-bold tracking-tight transition-all duration-150 outline-none focus-visible:ring-4 focus-visible:ring-sky-400 overflow-hidden ${getSizeStyles()} ${getVariantStyles()} ${
        justActivated ? 'scale-[0.97] ring-4 ring-white' : ''
      } ${className}`}
    >
      {/* Pengisian Bar Progres Dwell Bersih dari Bawah */}
      {isBeingDwelled && !disabled && (
        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none transition-all duration-75 ease-linear opacity-25"
          style={{
            height: `${dwellProgress * 100}%`,
            backgroundColor:
              theme === 'high-contrast'
                ? '#ffffff'
                : variant === 'accent'
                ? '#10b981'
                : variant === 'danger'
                ? '#f43f5e'
                : variant === 'warning'
                ? '#f59e0b'
                : '#0284c7',
          }}
          aria-hidden="true"
        />
      )}

      {/* Cincin Progres Dwell SVG di Pojok Kanan Atas dengan Kontras Ganda */}
      {isBeingDwelled && !disabled && (
        <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 pointer-events-none" aria-hidden="true">
          <svg className="w-4 h-4 sm:w-6 sm:h-6 transform -rotate-90">
            {/* Latar Belakang Cincin */}
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="rgba(0,0,0,0.5)"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2.5"
            />
            {/* Busur Progres Mengisi */}
            <circle
              cx="12"
              cy="12"
              r="9"
              fill="none"
              stroke={theme === 'high-contrast' ? '#facc15' : '#38bdf8'}
              strokeWidth="3.5"
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
          <div className="text-lg sm:text-2xl md:text-3xl shrink-0 flex items-center justify-center mb-0.5">
            {icon}
          </div>
        )}
        <span className="font-extrabold tracking-normal leading-none truncate w-full">
          {label}
        </span>
        {subLabel && (
          <span
            className={`hidden xs:inline-block sm:inline-block text-[10px] sm:text-xs md:text-sm font-medium tracking-normal truncate max-w-full ${
              theme === 'high-contrast'
                ? 'text-yellow-200'
                : theme === 'light'
                ? 'text-slate-600'
                : 'text-slate-300'
            }`}
          >
            {subLabel}
          </span>
        )}
      </div>

      {/* Indikator Fokus Switch Scanning */}
      {isSwitchFocused && (
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-full w-full bg-sky-500 ring-2 ring-white"></span>
        </span>
      )}
    </button>
  );
};
