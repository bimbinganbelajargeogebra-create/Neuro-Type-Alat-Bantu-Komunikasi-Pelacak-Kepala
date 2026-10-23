/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Activity, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { CalibrationData, TrackerState } from '../types';

interface DebugPanelProps {
  trackerState: TrackerState;
  currentDwellId: string | null;
  dwellProgress: number;
  isCooldown: boolean;
  calibration: CalibrationData;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  trackerState,
  currentDwellId,
  dwellProgress,
  isCooldown,
  calibration,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Tombol Toggle Debug */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Panel Debug"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-md text-xs font-mono transition-colors"
      >
        <Bug className="w-3.5 h-3.5 text-cyan-400" />
        <span>Debug</span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {/* Konten Debug */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-950/95 border-2 border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-xs font-mono text-slate-200 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-cyan-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" /> Telemetri Kursor
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                trackerState.faceDetected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {trackerState.faceDetected ? 'Wajah Terdeteksi' : 'Tidak Ada Wajah'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400">FPS:</span>{' '}
              <span className="font-bold text-white">{trackerState.fps || 30}</span>
            </div>
            <div>
              <span className="text-slate-400">Cooldown:</span>{' '}
              <span className={isCooldown ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                {isCooldown ? 'Aktif' : 'Siap'}
              </span>
            </div>
          </div>

          <div className="space-y-1 bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-[10px]">
            <div className="text-cyan-300 font-bold">Koordinat Hidung (Ujung Hidung #1):</div>
            <div>
              Raw (Webcam): X: {trackerState.rawNoseX.toFixed(3)}, Y:{' '}
              {trackerState.rawNoseY.toFixed(3)}
            </div>
            <div>
              Dicerminkan (Mirrored): X: {trackerState.mirroredNoseX.toFixed(3)}
            </div>
            <div>
              Kursor Layar: X: {Math.round(trackerState.cursorX)}px, Y:{' '}
              {Math.round(trackerState.cursorY)}px
            </div>
          </div>

          <div className="space-y-1 bg-slate-900/80 p-2 rounded-lg border border-slate-800 text-[10px]">
            <div className="text-amber-300 font-bold">Status Dwell:</div>
            <div>
              Target Aktif:{' '}
              <span className="text-white font-bold">{currentDwellId || 'Tidak Ada'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Progres:</span>
              <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full transition-all duration-75"
                  style={{ width: `${Math.round(dwellProgress * 100)}%` }}
                />
              </div>
              <span className="font-bold">{Math.round(dwellProgress * 100)}%</span>
            </div>
          </div>

          <div className="space-y-0.5 text-[10px] text-slate-400">
            <div>
              Kalibrasi: Netral ({calibration.neutralX.toFixed(2)},{' '}
              {calibration.neutralY.toFixed(2)})
            </div>
            <div>
              Rentang: ({calibration.rangeX.toFixed(2)}, {calibration.rangeY.toFixed(2)})
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
