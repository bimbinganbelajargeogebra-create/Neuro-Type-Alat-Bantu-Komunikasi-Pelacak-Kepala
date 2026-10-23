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
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 bg-slate-950/90 backdrop-blur-sm overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl my-auto text-slate-100 max-h-[92dvh] overflow-y-auto">
        {/* Header Bersih */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-sky-400" />
            <h2 id="settings-dialog-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Pengaturan Neuro-Type
            </h2>
          </div>
          {/* Tombol Tutup (Dwellable) */}
          <button
            type="button"
            data-dwell-id="btn-close-settings"
            onClick={onClose}
            aria-label="Tutup Pengaturan"
            className={`relative px-3.5 py-2 rounded-xl border-2 transition-all flex items-center gap-1.5 font-bold text-xs ${
              currentDwellId === 'btn-close-settings'
                ? 'bg-rose-600 text-white border-white scale-105'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {currentDwellId === 'btn-close-settings' && dwellProgress > 0 && (
              <span
                className="absolute inset-0 bg-white/20 rounded-xl pointer-events-none"
                style={{ width: `${dwellProgress * 100}%` }}
              />
            )}
            <X className="w-4 h-4" />
            <span>Tutup</span>
          </button>
        </div>

        <div className="space-y-5">
          {/* Bagian 0: Mode Pengendalian */}
          <section className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-sky-400" /> Metode Pengendalian Utama
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    controlMode: 'head_tracker',
                    switchScanningEnabled: false,
                  })
                }
                className={`p-3 rounded-xl border-2 text-left flex flex-col gap-1 transition-all ${
                  settings.controlMode === 'head_tracker' && !settings.switchScanningEnabled
                    ? 'border-sky-400 bg-sky-950/50 text-white ring-1 ring-sky-400'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <Video className="w-4 h-4 text-emerald-400" />
                  <span>Pelacak Kepala</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Kamera webcam melacak ujung hidung.
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
                className={`p-3 rounded-xl border-2 text-left flex flex-col gap-1 transition-all ${
                  settings.controlMode === 'mouse_simulator' && !settings.switchScanningEnabled
                    ? 'border-sky-400 bg-sky-950/50 text-white ring-1 ring-sky-400'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <MousePointer className="w-4 h-4 text-sky-400" />
                  <span>Simulasi Mouse</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Gerakkan kursor dengan mouse/touchpad.
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
                className={`p-3 rounded-xl border-2 text-left flex flex-col gap-1 transition-all ${
                  settings.switchScanningEnabled
                    ? 'border-sky-400 bg-sky-950/50 text-white ring-1 ring-sky-400'
                    : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-sm">
                  <KeyboardIcon className="w-4 h-4 text-amber-400" />
                  <span>Switch Scanning</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Sorot otomatis + tombol Spasi/Enter.
                </span>
              </button>
            </div>
          </section>

          {/* Bagian 1: Pengendalian Pelacakan & Dwell */}
          <section className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" /> Waktu Tahan (Dwell) & Sensitivitas
            </h3>

            {/* Durasi Dwell */}
            <div className="mb-4">
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
                <span>Durasi Tahan (Dwell Time):</span>
                <span className="text-white font-mono font-bold">
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
                className="w-full accent-sky-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] text-slate-400">
                Durasi kursor menetap di atas tombol sebelum otomatis terpilih.
              </span>
            </div>

            {/* Sensitivitas Gerak (Gain) */}
            <div className="mb-4">
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
                <span>Sensitivitas Gerak Kepala (Gain):</span>
                <span className="text-white font-mono font-bold">
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
                className="w-full accent-sky-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] text-slate-400">
                Tingkat penguatan gerak. Semakin tinggi, sedikit gerakan kepala menjangkau layar penuh.
              </span>
            </div>

            {/* Kehalusan Kursor (Smoothing) */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
                <span>Kehalusan Kursor (Peredam Getar):</span>
                <span className="text-white font-mono font-bold">
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
                className="w-full accent-sky-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] text-slate-400">
                Peredam getaran kepala saat diam agar kursor tetap tenang.
              </span>
            </div>
          </section>

          {/* Bagian 2: Suara & Ucapan (TTS) */}
          <section className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" /> Suara & Pembacaan Teks
            </h3>

            {/* Pilihan Voice */}
            <div className="mb-4">
              <label htmlFor="voice-select" className="block text-xs font-semibold mb-1 text-slate-300">
                Pilihan Suara (Voice):
              </label>
              <select
                id="voice-select"
                value={settings.voiceURI}
                onChange={(e) => onUpdateSettings({ voiceURI: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-400"
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
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
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
                className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </section>

          {/* Bagian 3: Tampilan & Aksesibilitas */}
          <section className="bg-slate-950 border border-slate-800 p-4 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" /> Tampilan & Tema (Aksesibilitas Kontras)
            </h3>

            {/* Pilihan Tema */}
            <div className="mb-4">
              <span className="block text-xs font-semibold mb-2 text-slate-300">Pilihan Tema:</span>
              <div className="grid grid-cols-3 gap-2">
                {(['dark', 'light', 'high-contrast'] as AppTheme[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onUpdateSettings({ theme: t })}
                    className={`p-2.5 rounded-xl border-2 text-xs font-bold capitalize transition-all ${
                      settings.theme === t
                        ? 'border-sky-400 bg-sky-950/60 text-white ring-1 ring-sky-400'
                        : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {t === 'dark' ? 'Gelap' : t === 'light' ? 'Terang' : 'Kontras Tinggi'}
                  </button>
                ))}
              </div>
            </div>

            {/* Ukuran Tombol & Font */}
            <div className="mb-4">
              <span className="block text-xs font-semibold mb-2 text-slate-300">Ukuran Tombol Keyboard:</span>
              <div className="grid grid-cols-3 gap-2">
                {(['small', 'medium', 'large'] as ButtonSize[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onUpdateSettings({ buttonSize: s })}
                    className={`p-2.5 rounded-xl border-2 text-xs font-bold capitalize transition-all ${
                      settings.buttonSize === s
                        ? 'border-amber-400 bg-amber-950/60 text-white ring-1 ring-amber-400'
                        : 'border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {s === 'small' ? 'Kecil' : s === 'medium' ? 'Sedang' : 'Besar (Standar)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Pratinjau Kamera */}
            <div className="flex items-center justify-between py-2 border-t border-slate-800">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Tampilkan Pratinjau Kamera di Layar</span>
                <span className="text-[11px] text-slate-400">
                  Pratinjau visual kecil webcam di pojok layar
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.showCameraPreview}
                onChange={(e) => onUpdateSettings({ showCameraPreview: e.target.checked })}
                className="w-4 h-4 accent-sky-400 cursor-pointer"
              />
            </div>
          </section>

          {/* Bagian 4: Aksi Bawah */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onResetSettings}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Pengaturan Awal
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCalibration();
                }}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow transition-all active:scale-95"
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
