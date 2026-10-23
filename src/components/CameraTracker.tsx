/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { Video, VideoOff, Maximize2, Minimize2 } from 'lucide-react';
import { TrackerState } from '../types';

interface CameraTrackerProps {
  mediaStream: MediaStream | null;
  trackerState: TrackerState;
  showPreview: boolean;
  onTogglePreview: () => void;
  onOpenCalibration: () => void;
}

export const CameraTracker: React.FC<CameraTrackerProps> = ({
  mediaStream,
  trackerState,
  showPreview,
  onTogglePreview,
  onOpenCalibration,
}) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (localVideoRef.current && mediaStream && showPreview && !isMinimized) {
      localVideoRef.current.srcObject = mediaStream;
      localVideoRef.current.play().catch((e) => console.log('CameraTracker play error:', e));
    }
  }, [mediaStream, showPreview, isMinimized]);

  if (!showPreview) {
    return (
      <button
        type="button"
        onClick={onTogglePreview}
        title="Tampilkan Pratinjau Kamera"
        aria-label="Tampilkan pratinjau kamera"
        className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-40 p-2 sm:p-2.5 rounded-full bg-slate-900/90 text-slate-300 border border-slate-700 shadow-lg hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 text-xs font-semibold"
      >
        <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
        <span className="hidden sm:inline">Kamera</span>
      </button>
    );
  }

  // Jika di-minimize (terutama berguna di layar HP agar tidak menutupi tombol keyboard)
  if (isMinimized) {
    return (
      <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-40 flex items-center gap-1 bg-slate-900/95 border border-slate-700 rounded-full px-2.5 py-1 shadow-lg text-[10px] text-slate-200">
        <span
          className={`w-2 h-2 rounded-full ${
            trackerState.faceDetected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
          }`}
        />
        <span>{trackerState.faceDetected ? 'Wajah Terkunci' : 'Mencari...'}</span>
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="p-1 text-cyan-400 hover:text-cyan-300 rounded ml-1"
          title="Perbesar Kamera"
        >
          <Maximize2 className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-40 bg-slate-900/95 border-2 border-slate-700/80 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-2xl backdrop-blur-md flex flex-col items-center w-32 sm:w-44 md:w-52 overflow-hidden">
      {/* Header Kecil */}
      <div className="w-full flex items-center justify-between px-1 pb-1 border-b border-slate-800 text-[9px] sm:text-[11px] font-semibold text-slate-300">
        <span className="flex items-center gap-1 truncate max-w-[80px] sm:max-w-none">
          <span
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${
              trackerState.faceDetected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className="truncate">{trackerState.faceDetected ? 'Terkunci' : 'Mencari'}</span>
        </span>
        <div className="flex items-center gap-1">
          {/* Tombol Perkecil / Minimize */}
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            title="Kecilkan Kamera"
            aria-label="Kecilkan kamera"
            className="p-0.5 hover:text-white rounded text-slate-400"
          >
            <Minimize2 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onTogglePreview}
            title="Sembunyikan Pratinjau"
            aria-label="Sembunyikan pratinjau kamera"
            className="p-0.5 hover:text-white rounded text-slate-400"
          >
            <VideoOff className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Frame Video */}
      <div className="relative w-full h-20 sm:h-28 md:h-36 rounded-lg sm:rounded-xl overflow-hidden bg-black mt-1 border border-slate-800">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform -scale-x-100"
        />

        {/* Titik Ujung Hidung */}
        {trackerState.faceDetected && (
          <div
            className="absolute w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-cyan-400 border border-white shadow-[0_0_8px_#22d3ee] pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${trackerState.mirroredNoseX * 100}%`,
              top: `${trackerState.rawNoseY * 100}%`,
            }}
          />
        )}
      </div>

      {/* Footer Aksi Kalibrasi Ulang Cepat */}
      <div className="w-full mt-1 sm:mt-1.5 flex items-center justify-between text-[8px] sm:text-[10px] text-slate-400 px-0.5">
        <span>FPS: {trackerState.fps || 30}</span>
        <button
          type="button"
          onClick={onOpenCalibration}
          className="text-cyan-400 hover:text-cyan-300 font-bold underline"
        >
          Kalibrasi
        </button>
      </div>
    </div>
  );
};
