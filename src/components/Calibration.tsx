/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Target, CheckCircle2, RotateCcw, ArrowRight } from 'lucide-react';
import { CalibrationData, TrackerState } from '../types';

interface CalibrationProps {
  isOpen: boolean;
  onComplete: (data: CalibrationData) => void;
  onCancel: () => void;
  mediaStream: MediaStream | null;
  trackerState: TrackerState;
}

export const Calibration: React.FC<CalibrationProps> = ({
  isOpen,
  onComplete,
  onCancel,
  mediaStream,
  trackerState,
}) => {
  const [step, setStep] = useState<'intro' | 'neutral' | 'range' | 'done'>('intro');
  const [countdown, setCountdown] = useState(5);
  const [neutralSamples, setNeutralSamples] = useState<{ x: number; y: number }[]>([]);
  const [rangeData, setRangeData] = useState({
    minX: 1.0,
    maxX: 0.0,
    minY: 1.0,
    maxY: 0.0,
  });

  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // Pastikan mediaStream terhubung ke video lokal
  useEffect(() => {
    if (localVideoRef.current && mediaStream) {
      localVideoRef.current.srcObject = mediaStream;
      localVideoRef.current.play().catch((e) => console.log('Calibration video play error:', e));
    }
  }, [mediaStream, isOpen]);

  // Reset saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setStep('intro');
      setCountdown(5);
      setNeutralSamples([]);
      setRangeData({ minX: 1.0, maxX: 0.0, minY: 1.0, maxY: 0.0 });
    }
  }, [isOpen]);

  // Tahap 1: Rekam Titik Netral (Menatap Lurus)
  useEffect(() => {
    if (step === 'neutral') {
      setCountdown(5);
      setNeutralSamples([]);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setStep('range');
            return 5;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [step]);

  // Rekam sampel hidung saat menatap lurus
  useEffect(() => {
    if (step === 'neutral' && trackerState.faceDetected) {
      setNeutralSamples((prev) => [
        ...prev,
        { x: trackerState.mirroredNoseX, y: trackerState.rawNoseY },
      ]);
    }
  }, [step, trackerState.faceDetected, trackerState.mirroredNoseX, trackerState.rawNoseY]);

  // Tahap 2: Rekam Jangkauan Gerak (Kiri, Kanan, Atas, Bawah)
  useEffect(() => {
    if (step === 'range') {
      setCountdown(5);

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setStep('done');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [step]);

  // Pantau min/max saat tahap jangkauan
  useEffect(() => {
    if (step === 'range' && trackerState.faceDetected) {
      const x = trackerState.mirroredNoseX;
      const y = trackerState.rawNoseY;
      setRangeData((prev) => ({
        minX: Math.min(prev.minX, x),
        maxX: Math.max(prev.maxX, x),
        minY: Math.min(prev.minY, y),
        maxY: Math.max(prev.maxY, y),
      }));
    }
  }, [step, trackerState.faceDetected, trackerState.mirroredNoseX, trackerState.rawNoseY]);

  // Hitung hasil kalibrasi akhir
  const handleFinishCalibration = () => {
    let avgNeutralX = 0.5;
    let avgNeutralY = 0.5;

    if (neutralSamples.length > 0) {
      const sumX = neutralSamples.reduce((acc, curr) => acc + curr.x, 0);
      const sumY = neutralSamples.reduce((acc, curr) => acc + curr.y, 0);
      avgNeutralX = sumX / neutralSamples.length;
      avgNeutralY = sumY / neutralSamples.length;
    }

    const spanX = Math.max(0.04, (rangeData.maxX - rangeData.minX) / 2);
    const spanY = Math.max(0.04, (rangeData.maxY - rangeData.minY) / 2);

    const calibrationResult: CalibrationData = {
      isCalibrated: true,
      neutralX: avgNeutralX,
      neutralY: avgNeutralY,
      rangeX: spanX,
      rangeY: spanY,
    };

    onComplete(calibrationResult);
  };

  const handleSkipToDefault = () => {
    onComplete({
      isCalibrated: true,
      neutralX: 0.5,
      neutralY: 0.5,
      rangeX: 0.08,
      rangeY: 0.08,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="calib-title"
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-cyan-500/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-[0_0_50px_rgba(6,182,212,0.3)] flex flex-col items-center text-center max-h-[94dvh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2 text-cyan-400">
          <Target className="w-6 h-6 sm:w-8 sm:h-8 animate-spin-slow" />
          <h2 id="calib-title" className="text-xl sm:text-2xl md:text-3xl font-black tracking-wide text-white">
            Kalibrasi Gerakan Kepala
          </h2>
        </div>
        <p className="text-slate-300 text-xs sm:text-sm md:text-base max-w-md mb-3 sm:mb-4">
          Sesuaikan kursor dengan rentang gerak kepala Anda agar gerakan kecil sudah
          cukup menjangkau seluruh layar dengan nyaman.
        </p>

        {/* Area Video Webcam & Panduan Oval Responsif */}
        <div className="relative w-56 h-42 sm:w-72 sm:h-54 md:w-88 md:h-64 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-slate-700 bg-black shadow-inner flex items-center justify-center mb-4 sm:mb-6 shrink-0">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />

          {/* Panduan Oval Kepala */}
          <div
            className={`absolute w-36 h-42 sm:w-44 sm:h-52 md:w-52 md:h-60 rounded-[50%] border-2 sm:border-4 transition-all duration-300 pointer-events-none ${
              trackerState.faceDetected
                ? 'border-emerald-400/90 shadow-[0_0_20px_rgba(52,211,153,0.5)]'
                : 'border-rose-400/80 border-dashed animate-pulse'
            }`}
          />

          {/* Titik Ujung Hidung Terdeteksi */}
          {trackerState.faceDetected && (
            <div
              className="absolute w-5 h-5 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_10px_#22d3ee] pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75"
              style={{
                left: `${trackerState.mirroredNoseX * 100}%`,
                top: `${trackerState.rawNoseY * 100}%`,
              }}
            />
          )}

          {/* Status Wajah */}
          <div className="absolute bottom-2 inset-x-2 flex justify-center pointer-events-none">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold shadow ${
                trackerState.faceDetected
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-rose-600/90 text-white animate-pulse'
              }`}
            >
              {trackerState.faceDetected
                ? 'Wajah Terdeteksi Bagus'
                : 'Posisikan wajah di dalam oval'}
            </span>
          </div>
        </div>

        {/* Konten Tahapan Kalibrasi */}
        {step === 'intro' && (
          <div className="flex flex-col items-center">
            <p className="text-slate-300 text-sm mb-6 max-w-lg">
              Kalibrasi terdiri dari 2 langkah singkat (masing-masing 5 detik):
              <br />
              <strong className="text-cyan-300">1. Menatap lurus</strong> untuk titik netral.
              <br />
              <strong className="text-cyan-300">2. Menggerakkan kepala</strong> ke kiri, kanan,
              atas, bawah secara santai.
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep('neutral')}
                className="px-8 py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xl flex items-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                Mulai Kalibrasi <ArrowRight className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={handleSkipToDefault}
                className="px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-base transition-colors"
              >
                Gunakan Pengaturan Standar
              </button>
            </div>
          </div>
        )}

        {step === 'neutral' && (
          <div className="flex flex-col items-center">
            <div className="text-5xl font-black text-cyan-400 mb-2 font-mono">
              {countdown}s
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Langkah 1: Tatap Lurus ke Tengah Layar
            </h3>
            <p className="text-slate-300 text-sm max-w-md">
              Rileks dan jangan gerakkan kepala. Sistem sedang merekam posisi hidung
              netral Anda...
            </p>
          </div>
        )}

        {step === 'range' && (
          <div className="flex flex-col items-center">
            <div className="text-5xl font-black text-amber-400 mb-2 font-mono">
              {countdown}s
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Langkah 2: Gerakkan Kepala Santai
            </h3>
            <p className="text-slate-300 text-sm max-w-md mb-2">
              Gerakkan kepala perlahan ke <strong className="text-amber-300">kiri, kanan, atas, dan bawah</strong> sejauh yang nyaman bagi Anda.
            </p>
            <div className="text-xs text-slate-400 font-mono">
              Rentang terekam: X {(rangeData.maxX - rangeData.minX).toFixed(2)} • Y {(rangeData.maxY - rangeData.minY).toFixed(2)}
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-2 animate-bounce" />
            <h3 className="text-2xl font-black text-white mb-2">
              Kalibrasi Selesai!
            </h3>
            <p className="text-slate-300 text-sm max-w-md mb-6">
              Profil gerakan kepala Anda berhasil disimpan. Anda dapat mengkalibrasi
              ulang kapan saja lewat tombol di pojok layar.
            </p>
            <button
              type="button"
              onClick={handleFinishCalibration}
              className="px-10 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xl shadow-xl transition-transform active:scale-95"
            >
              Mulai Gunakan Neuro-Type
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
