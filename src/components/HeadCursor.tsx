/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppTheme } from '../types';

interface HeadCursorProps {
  x: number;
  y: number;
  faceDetected: boolean;
  isDwellActive: boolean;
  dwellProgress: number; // 0.0 - 1.0
  isCooldown: boolean;
  theme: AppTheme;
}

export const HeadCursor: React.FC<HeadCursorProps> = ({
  x,
  y,
  faceDetected,
  isDwellActive,
  dwellProgress,
  isCooldown,
  theme,
}) => {
  // Ukuran kursor: diameter 36px
  const cursorSize = 36;
  const radius = cursorSize / 2;
  const strokeWidth = 3.5;
  const normalizedRadius = radius - strokeWidth;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - dwellProgress * circumference;

  // Warna sesuai tema
  const ringColor =
    theme === 'high-contrast'
      ? '#facc15'
      : isCooldown
      ? '#94a3b8'
      : isDwellActive
      ? '#06b6d4'
      : '#38bdf8';

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-[9999] transition-opacity duration-200"
      style={{
        transform: `translate3d(${x - radius}px, ${y - radius}px, 0)`,
        opacity: faceDetected ? 1 : 0.15,
        willChange: 'transform',
      }}
      aria-hidden="true"
    >
      <div className="relative flex items-center justify-center">
        {/* SVG Cincin Progres Dwell & Kontur Tebal */}
        <svg
          height={cursorSize}
          width={cursorSize}
          className="transform -rotate-90 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]"
        >
          {/* Lingkaran Luar Kontras Hitam */}
          <circle
            stroke="#000000"
            fill="rgba(15, 23, 42, 0.45)"
            strokeWidth={strokeWidth + 2.5}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Lingkaran Jalur Netral Putih */}
          <circle
            stroke="rgba(255, 255, 255, 0.75)"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Cincin Progres Dwell Aktif */}
          {dwellProgress > 0 && !isCooldown && (
            <circle
              stroke={ringColor}
              fill="transparent"
              strokeWidth={strokeWidth + 1}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{
                strokeDashoffset,
                transition: 'stroke-dashoffset 20ms linear',
              }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          )}
        </svg>

        {/* Titik Pusat Presisi */}
        <div
          className={`absolute w-2.5 h-2.5 rounded-full ${
            isCooldown
              ? 'bg-amber-400'
              : isDwellActive
              ? 'bg-cyan-400 scale-125'
              : 'bg-white'
          } shadow-[0_0_6px_rgba(0,0,0,0.9)] transition-transform duration-100`}
        />

        {/* Indikator Cooldown */}
        {isCooldown && (
          <div className="absolute -top-6 whitespace-nowrap bg-black/90 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded shadow border border-amber-400/50">
            Jeda
          </div>
        )}
      </div>
    </div>
  );
};
