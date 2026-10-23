/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  X,
  RotateCcw,
  Volume2,
  Sliders,
  Palette,
  Eye,
  Keyboard as KeyboardIcon,
  Video,
  MousePointer,
} from 'lucide-react';
import { AppSettings, AppTheme, ButtonSize, ControlMode } from '../types';
import { getAvailableVoices } from '../utils/audio';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onResetSettings: () => void;
  onOpenCalibration: () => void;
  currentDwellId: string | null;
  dwellProgress: number;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
  onOpenCalibration,
  currentDwellId,
  dwellProgress,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    getAvailableVoices().then((v) => setVoices(v));
  }, []);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl my-auto text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <SettingsIcon className="w-7 h-7 text-cyan-400" />
            <h2 id="settings-dialog-title" className="text-2xl font-black tracking-wide">
              Pengaturan Neuro-Type
            </h2>
          </div>
          {/* Tombol Tutup (Dwellable) */}
          <button
            type="button"
            data-dwell-id="btn-close-settings"
            onClick={onClose}
            aria-label="Tutup Pengaturan"
            className={`relative p-3 rounded-2xl border transition-all flex items-center gap-2 font-bold ${
              currentDwellId === 'btn-close-settings'
                ? 'bg-rose-600 text-white border-white scale-105'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {currentDwellId === 'btn-close-settings' && dwellProgress > 0 && (
              <span
                className="absolute inset-0 bg-white/20 rounded-2xl pointer-events-none"
                style={{ width: `${dwellProgress * 100}%` }}
              />
            )}
            <X className="w-5 h-5" />
            <span className="text-sm">Tutup</span>
          </button>
        </div>

        <div className="space-y-6">
          {/* Bagian 0: Mode Pengendalian */}
          <section className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <h3 className="text-base font-bold text-cyan-300 mb-3 flex items-center gap-2">
              <MousePointer className="w-5 h-5" /> Metode Pengendalian Utama
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    controlMode: 'head_tracker',
                    switchScanningEnabled: false,
                  })
                }
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  settings.controlMode === 'head_tracker' && !settings.switchScanningEnabled
                    ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200 ring-2 ring-cyan-400'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <Video className="w-4 h-4 text-cyan-400" />
                  <span>Pelacak Kepala</span>
                </div>
                <span className="text-[11px] opacity-75">
                  Gerakkan kepala di depan webcam (MediaPipe).
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    controlMode: 'mouse_simulator',
                    switchScanningEnabled: false,
                  })
                }
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  settings.controlMode === 'mouse_simulator' && !settings.switchScanningEnabled
                    ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200 ring-2 ring-cyan-400'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <MousePointer className="w-4 h-4 text-cyan-400" />
                  <span>Simulasi Mouse</span>
                </div>
                <span className="text-[11px] opacity-75">
                  Gerakkan kursor dengan mouse/touchpad untuk simulasi dwell.
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    controlMode: 'switch_scanning',
                    switchScanningEnabled: true,
                  })
                }
                className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  settings.switchScanningEnabled
                    ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200 ring-2 ring-cyan-400'
                    : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <KeyboardIcon className="w-4 h-4 text-cyan-400" />
                  <span>Switch Scanning</span>
                </div>
                <span className="text-[11px] opacity-75">
                  Sorotan otomatis + tombol Spasi/Enter.
                </span>
              </button>
            </div>
          </section>

          {/* Bagian 1: Pengendalian Pelacakan & Dwell */}
          <section className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <h3 className="text-base font-bold text-cyan-300 mb-3 flex items-center gap-2">
              <Sliders className="w-5 h-5" /> Waktu Tahan (Dwell) & Sensitivitas
            </h3>

            {/* Durasi Dwell */}
            <div className="mb-4">
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span>Durasi Tahan (Dwell Time):</span>
                <span className="text-cyan-400 font-mono font-bold">
                  {settings.dwellTime.toFixed(1)} detik
                </span>
              </div>
              <input
                type="range"
                min="0.8"
                max="4.0"
                step="0.1"
                value={settings.dwellTime}
                onChange={(e) => onUpdateSettings({ dwellTime: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="text-xs text-slate-400">
                Waktu kursor harus menetap di atas tombol sebelum otomatis terpilih.
              </span>
            </div>

            {/* Sensitivitas Gerak (Gain) */}
            <div className="mb-4">
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span>Sensitivitas Gerak Kepala (Gain):</span>
                <span className="text-cyan-400 font-mono font-bold">
                  {settings.sensitivity.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="4.5"
                step="0.2"
                value={settings.sensitivity}
                onChange={(e) => onUpdateSettings({ sensitivity: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="text-xs text-slate-400">
                Tingkat penguatan gerakan. Nilai lebih tinggi memungkinkan jangkauan layar penuh dengan sedikit gerakan kepala.
              </span>
            </div>

            {/* Kehalusan Kursor (Smoothing) */}
            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span>Kehalusan Kursor (Peredam Getar):</span>
                <span className="text-cyan-400 font-mono font-bold">
                  {Math.round((1 - settings.smoothing) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.08"
                max="0.45"
                step="0.02"
                value={settings.smoothing}
                onChange={(e) => onUpdateSettings({ smoothing: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
              <span className="text-xs text-slate-400">
                Peredam getaran kepala saat diam (Exponential Moving Average).
              </span>
            </div>
          </section>

          {/* Bagian 2: Suara & Ucapan (TTS) */}
          <section className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <h3 className="text-base font-bold text-emerald-300 mb-3 flex items-center gap-2">
              <Volume2 className="w-5 h-5" /> Suara & Pembacaan Teks
            </h3>

            {/* Pilihan Voice */}
            <div className="mb-4">
              <label htmlFor="voice-select" className="block text-sm font-semibold mb-1">
                Pilihan Suara (Voice):
              </label>
              <select
                id="voice-select"
                value={settings.voiceURI}
                onChange={(e) => onUpdateSettings({ voiceURI: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="">Otomatis (Utamakan Bahasa Indonesia)</option>
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            {/* Kecepatan Suara */}
            <div>
              <div className="flex justify-between text-sm font-semibold mb-1">
                <span>Kecepatan Berbicara:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {settings.speechRate.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.4"
                step="0.1"
                value={settings.speechRate}
                onChange={(e) => onUpdateSettings({ speechRate: parseFloat(e.target.value) })}
                className="w-full accent-emerald-400 h-2 bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>
          </section>

          {/* Bagian 3: Tampilan & Aksesibilitas */}
          <section className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
            <h3 className="text-base font-bold text-amber-300 mb-3 flex items-center gap-2">
              <Palette className="w-5 h-5" /> Tampilan & Tema
            </h3>

            {/* Pilihan Tema */}
            <div className="mb-4">
              <span className="block text-sm font-semibold mb-2">Tema Visual:</span>
              <div className="grid grid-cols-3 gap-2">
                {(['dark', 'light', 'high-contrast'] as AppTheme[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onUpdateSettings({ theme: t })}
                    className={`p-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                      settings.theme === t
                        ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 ring-2 ring-cyan-400'
                        : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {t === 'dark' ? 'Gelap' : t === 'light' ? 'Terang' : 'Kontras Tinggi'}
                  </button>
                ))}
              </div>
            </div>

            {/* Ukuran Tombol & Font */}
            <div className="mb-4">
              <span className="block text-sm font-semibold mb-2">Ukuran Tombol Keyboard:</span>
              <div className="grid grid-cols-3 gap-2">
                {(['small', 'medium', 'large'] as ButtonSize[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onUpdateSettings({ buttonSize: s })}
                    className={`p-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                      settings.buttonSize === s
                        ? 'border-amber-400 bg-amber-950/60 text-amber-300 ring-2 ring-amber-400'
                        : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    {s === 'small' ? 'Kecil' : s === 'medium' ? 'Sedang' : 'Besar (Standar)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Pratinjau Kamera */}
            <div className="flex items-center justify-between py-2 border-t border-slate-700/60">
              <div className="flex flex-col">
                <span className="text-sm font-semibold">Tampilkan Video Kamera di Pojok</span>
                <span className="text-xs text-slate-400">
                  Pratinjau visual kecil webcam untuk memantau posisi kepala
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.showCameraPreview}
                onChange={(e) => onUpdateSettings({ showCameraPreview: e.target.checked })}
                className="w-5 h-5 accent-cyan-400 cursor-pointer"
              />
            </div>
          </section>

          {/* Bagian 4: Aksi Bawah */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onResetSettings}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset Pengaturan Awal
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCalibration();
                }}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-md transition-transform active:scale-95"
              >
                Kalibrasi Ulang Kepala
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
