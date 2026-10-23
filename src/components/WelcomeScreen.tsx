/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Keyboard,
  HeartHandshake,
  MousePointer,
  Video,
  Volume2,
  ChevronDown,
  ChevronUp,
  Siren,
  Droplet,
  Utensils,
  Activity,
  Bed,
  XCircle,
  Check,
  BookOpen,
} from 'lucide-react';
import { speakIndonesian, playClickSound } from '../utils/audio';

interface WelcomeScreenProps {
  onStartCamera: () => void;
  isLoading: boolean;
  loadingMessage?: string;
  error: string | null;
  onFallbackSwitchMode: () => void;
  onStartMouseSimulator: () => void;
}

// 9 Frasa Cepat untuk kebutuhan mendesak langsung
const EMERGENCY_QUICK_PHRASES = [
  {
    id: 'emg-1',
    label: 'TOLONG! Panggil Bantuan',
    text: 'Tolong! Panggilkan perawat atau bantuan sekarang!',
    icon: <Siren className="w-5 h-5 text-rose-400" />,
    borderClass: 'border-rose-500/80 bg-rose-950/30 text-rose-100 hover:bg-rose-900/50',
  },
  {
    id: 'emg-2',
    label: 'Saya Haus (Minta Minum)',
    text: 'Saya haus, tolong ambilkan minum.',
    icon: <Droplet className="w-5 h-5 text-sky-400" />,
    borderClass: 'border-sky-500/80 bg-sky-950/30 text-sky-100 hover:bg-sky-900/50',
  },
  {
    id: 'emg-3',
    label: 'Saya Lapar',
    text: 'Saya lapar, tolong siapkan makanan.',
    icon: <Utensils className="w-5 h-5 text-amber-400" />,
    borderClass: 'border-amber-500/80 bg-amber-950/30 text-amber-100 hover:bg-amber-900/50',
  },
  {
    id: 'emg-4',
    label: 'Saya Merasa Sakit',
    text: 'Saya merasa sakit sekali, tolong bantu saya.',
    icon: <Activity className="w-5 h-5 text-rose-400" />,
    borderClass: 'border-rose-500/80 bg-rose-950/30 text-rose-100 hover:bg-rose-900/50',
  },
  {
    id: 'emg-5',
    label: 'Tolong Ubah Posisi',
    text: 'Tolong ubah posisi tidur atau duduk saya, badan saya pegal.',
    icon: <Bed className="w-5 h-5 text-indigo-400" />,
    borderClass: 'border-indigo-500/80 bg-indigo-950/30 text-indigo-100 hover:bg-indigo-900/50',
  },
  {
    id: 'emg-6',
    label: 'Perlu ke Toilet',
    text: 'Saya perlu buang air, tolong bantu ke toilet atau siapkan pispot.',
    icon: <Droplet className="w-5 h-5 text-cyan-400" />,
    borderClass: 'border-cyan-500/80 bg-cyan-950/30 text-cyan-100 hover:bg-cyan-900/50',
  },
  {
    id: 'emg-7',
    label: 'YA',
    text: 'Ya.',
    icon: <Check className="w-5 h-5 text-emerald-400" />,
    borderClass: 'border-emerald-500/80 bg-emerald-950/30 text-emerald-100 hover:bg-emerald-900/50',
  },
  {
    id: 'emg-8',
    label: 'TIDAK',
    text: 'Tidak.',
    icon: <XCircle className="w-5 h-5 text-rose-400" />,
    borderClass: 'border-rose-500/80 bg-rose-950/30 text-rose-100 hover:bg-rose-900/50',
  },
  {
    id: 'emg-9',
    label: 'Terima Kasih',
    text: 'Terima kasih banyak atas bantuannya.',
    icon: <HeartHandshake className="w-5 h-5 text-pink-400" />,
    borderClass: 'border-pink-500/80 bg-pink-950/30 text-pink-100 hover:bg-pink-900/50',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartCamera,
  isLoading,
  loadingMessage,
  error,
  onFallbackSwitchMode,
  onStartMouseSimulator,
}) => {
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  const [showFullGuide, setShowFullGuide] = useState<boolean>(true);

  // Fungsi membacakan frasa mendesak secara langsung
  const handleDirectSpeak = (text: string) => {
    playClickSound();
    setSpeakingText(text);
    speakIndonesian(text, {
      rate: 1.0,
      pitch: 1.0,
      onEnd: () => setSpeakingText(null),
      onError: () => setSpeakingText(null),
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between p-3 sm:p-6 md:p-8 bg-slate-950 text-slate-100">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 md:p-10 shadow-xl flex flex-col items-center text-center my-auto">
        {/* Logo & Judul Minimalis */}
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-sky-500/10 border border-sky-400/30 text-sky-400 mb-4">
          <HeartHandshake className="w-9 h-9 sm:w-10 sm:h-10" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-2">
          Neuro-Type
        </h1>

        <p className="text-base sm:text-lg font-medium text-slate-300 max-w-2xl mb-6">
          Alat Bantu Komunikasi Mandiri Berbasis Pelacakan Kepala untuk Penyandang
          Disabilitas Motorik Berat (ALS)
        </p>

        {/* 🚨 BAGIAN KHUSUS: TOMBOL CEPAT KEBUTUHAN MENDESAK (LANGSUNG BERSUARA) */}
        <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400">
                <Siren className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-white font-bold text-base sm:text-lg">
                  Tombol Cepat Kebutuhan Mendesak
                </h2>
                <p className="text-xs text-slate-400">
                  Ucapkan langsung tanpa perlu kalibrasi kepala.
                </p>
              </div>
            </div>
            {speakingText && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                <Volume2 className="w-4 h-4" /> Sedang berbicara...
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
            {EMERGENCY_QUICK_PHRASES.map((item) => {
              const isSelected = speakingText === item.text;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleDirectSpeak(item.text)}
                  className={`p-3 rounded-xl border-2 flex items-center gap-3 text-left font-bold text-xs sm:text-sm transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-sky-500 text-slate-950 border-white ring-2 ring-sky-300 scale-[1.01]'
                      : item.borderClass
                  }`}
                  aria-label={`Ucapkan: ${item.label}`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    <span className="text-[10px] opacity-70 font-normal truncate">
                      Klik untuk bersuara
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Catatan Privasi Bersih */}
        <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6 text-left flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm sm:text-base mb-0.5">
              Jaminan Privasi Penuh (100% di Perangkat Anda)
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Kamera webcam hanya digunakan untuk mendeteksi gerakan kepala secara langsung di browser Anda via MediaPipe AI. Video <strong className="text-slate-200">tidak pernah direkam atau dikirim ke internet</strong>.
            </p>
          </div>
        </div>

        {/* Kotak Error / Notifikasi Izin Jika Kamera Gagal */}
        {error && (
          <div className="w-full bg-rose-950/40 border border-rose-500/60 rounded-2xl p-4 mb-6 text-left flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-rose-200 font-bold text-base mb-1">
                Kamera Belum Terbuka / Izin Dibatasi
              </h2>
              <p className="text-xs sm:text-sm text-rose-300/90 mb-3">{error}</p>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={onStartCamera}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow"
                >
                  <RotateCcw className="w-4 h-4" /> Coba Buka Kamera Lagi
                </button>
                <button
                  type="button"
                  onClick={onStartMouseSimulator}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow"
                >
                  <MousePointer className="w-4 h-4" /> Coba Mode Simulasi Kursor (Mouse)
                </button>
                <button
                  type="button"
                  onClick={onFallbackSwitchMode}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Keyboard className="w-4 h-4" /> Mode Switch Scanning
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State Loading Aktif */}
        {isLoading && (
          <div className="w-full bg-slate-950 border border-sky-500/40 rounded-2xl p-5 mb-6 flex flex-col items-center justify-center gap-3">
            <div className="w-7 h-7 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-white font-bold text-base">
              {loadingMessage || 'Sedang menyiapkan kamera...'}
            </span>
            <span className="text-xs text-slate-400">
              Mohon izinkan pop-up akses kamera pada peramban Anda.
            </span>
          </div>
        )}

        {/* Tombol Utama Mulai */}
        {!isLoading && !error && (
          <div className="w-full flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={onStartCamera}
                className="w-full sm:w-auto px-8 py-4 sm:py-5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xl sm:text-2xl shadow-md flex items-center justify-center gap-3 transition-all transform active:scale-95"
              >
                <Video className="w-6 h-6 sm:w-7 sm:h-7" />
                Mulai dengan Kamera (Pelacak Kepala)
              </button>

              <button
                type="button"
                onClick={onStartMouseSimulator}
                className="w-full sm:w-auto px-6 py-4 sm:py-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-bold text-base flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <MousePointer className="w-5 h-5 text-sky-400" />
                Mode Uji Coba Kursor (Mouse)
              </button>
            </div>

            <button
              type="button"
              onClick={onFallbackSwitchMode}
              className="text-xs text-slate-400 hover:text-sky-300 underline mt-1 self-center"
            >
              Atau gunakan Mode Cadangan (Switch Scanning Satu Tombol Spasi/Enter)
            </button>
          </div>
        )}

        {/* 📖 BAGIAN PETUNJUK LENGKAP PENGGUNAAN */}
        <div className="w-full mt-8 pt-6 border-t border-slate-800 text-left">
          <button
            type="button"
            onClick={() => setShowFullGuide(!showFullGuide)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-200 transition-colors mb-3"
          >
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-white">
              <BookOpen className="w-5 h-5 text-sky-400" />
              <span>Petunjuk & Panduan Penggunaan Neuro-Type</span>
            </div>
            {showFullGuide ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {showFullGuide && (
            <div className="space-y-3 text-xs sm:text-sm text-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-white block mb-1 text-sm">
                    1. Posisi Kepala & Kamera
                  </span>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Duduklah dengan santai menghadap webcam pada jarak <strong>40 – 70 cm</strong>.
                    Pastikan ruangan cukup terang. Titik ujung hidung Anda akan menggerakkan kursor layar.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-white block mb-1 text-sm">
                    2. Dwell-Click (Klik Tahan)
                  </span>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Arahkan kursor ke tombol yang diinginkan dan <strong>tahan selama 1.5 detik</strong>.
                    Cincin lingkaran akan terisi dan membunyikan klik otomatis tanpa sentuhan tangan.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="font-bold text-white block mb-1 text-sm">
                    3. Mengetik & Bicara
                  </span>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Pilih grup huruf (misal <strong>ABCD</strong>), lalu pilih huruf (misal <strong>A</strong>).
                    Manfaatkan <strong>Saran Kata</strong> atau tekan <strong>BICARA</strong> untuk membacakan kalimat.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row gap-3 items-start text-xs">
                <div className="flex-1">
                  <strong className="text-amber-300 block mb-0.5">Mode Istirahat (Jeda):</strong>
                  Jika lelah, pilih tombol <strong>JEDA</strong>. Semua tombol dinonaktifkan kecuali satu tombol besar <em>LANJUTKAN</em> agar Anda bebas beristirahat tanpa salah pencet.
                </div>
                <div className="flex-1 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3">
                  <strong className="text-sky-300 block mb-0.5">Mode Cadangan Tanpa Kamera:</strong>
                  Tersedia <strong>Simulasi Mouse Dwell</strong> dan <strong>Switch Scanning</strong> (cukup menekan tombol Spasi/Enter di keyboard).
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="w-full max-w-4xl mt-6 py-3 px-4 text-center text-xs text-slate-500 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="font-medium text-slate-400">
          Neuro-Type · Assistive Technology
        </span>
        <span className="font-semibold text-slate-300">
          © copyright Pak GuruAI
        </span>
      </footer>
    </div>
  );
};
