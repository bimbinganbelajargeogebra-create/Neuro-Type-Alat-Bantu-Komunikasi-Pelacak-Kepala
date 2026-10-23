/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Settings as SettingsIcon,
  Target,
  Volume2,
  AlertCircle,
  Video,
  MousePointer,
  Keyboard as KeyboardIcon,
} from 'lucide-react';
import {
  AppSettings,
  CalibrationData,
  KeyboardView,
  LetterGroup,
  PhraseItem,
} from './types';
import { useCameraAndFaceTracker } from './hooks/useCameraAndFaceTracker';
import { HeadCursor } from './components/HeadCursor';
import { TextBox } from './components/TextBox';
import { WordSuggestions } from './components/WordSuggestions';
import { Keyboard } from './components/Keyboard';
import { WelcomeScreen } from './components/WelcomeScreen';
import { Calibration } from './components/Calibration';
import { CameraTracker } from './components/CameraTracker';
import { SettingsPanel } from './components/SettingsPanel';
import { DebugPanel } from './components/DebugPanel';
import { getWordSuggestions } from './utils/dictionary';
import { playClickSound, playChimeSound, speakIndonesian } from './utils/audio';

// Konfigurasi Default Pengaturan
const DEFAULT_SETTINGS: AppSettings = {
  dwellTime: 1.5, // 1.5 detik default
  sensitivity: 2.2, // gain penguat gerakan kepala
  smoothing: 0.22, // alpha moving average
  deadZone: 4, // dead-zone anti getar
  speechRate: 1.0,
  speechPitch: 1.0,
  voiceURI: '',
  buttonSize: 'large',
  theme: 'dark',
  showCameraPreview: true,
  switchScanningEnabled: false,
  scanSpeed: 1.8,
  controlMode: 'head_tracker',
};

// Konfigurasi Default Kalibrasi
const DEFAULT_CALIBRATION: CalibrationData = {
  isCalibrated: false,
  neutralX: 0.5,
  neutralY: 0.5,
  rangeX: 0.08,
  rangeY: 0.08,
};

export default function App() {
  // 1. Inisialisasi Pengaturan & Kalibrasi dari LocalStorage
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('neuro_type_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [calibration, setCalibration] = useState<CalibrationData>(() => {
    try {
      const saved = localStorage.getItem('neuro_type_calibration');
      return saved ? { ...DEFAULT_CALIBRATION, ...JSON.parse(saved) } : DEFAULT_CALIBRATION;
    } catch {
      return DEFAULT_CALIBRATION;
    }
  });

  // Simpan ke localStorage saat berubah
  useEffect(() => {
    try {
      localStorage.setItem('neuro_type_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Gagal menyimpan settings:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('neuro_type_calibration', JSON.stringify(calibration));
    } catch (e) {
      console.warn('Gagal menyimpan calibration:', e);
    }
  }, [calibration]);

  // 2. State Aplikasi Utama
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isCalibrating, setIsCalibrating] = useState<boolean>(false);
  const [text, setText] = useState<string>('');
  const [keyboardView, setKeyboardView] = useState<KeyboardView>('main');
  const [activeGroup, setActiveGroup] = useState<LetterGroup | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [hasIndonesianVoice, setHasIndonesianVoice] = useState<boolean>(true);

  // 3. Hook Pelacak Kepala MediaPipe
  const {
    state: trackerState,
    mediaStream,
    startCamera,
    stopCamera,
  } = useCameraAndFaceTracker({
    settings,
    calibration,
  });

  // 4. State Dwell Engine (Klik Tahan)
  const [currentDwellId, setCurrentDwellId] = useState<string | null>(null);
  const [dwellProgress, setDwellProgress] = useState<number>(0);
  const [isCooldown, setIsCooldown] = useState<boolean>(false);

  const dwellTargetRef = useRef<string | null>(null);
  const dwellStartTimeRef = useRef<number | null>(null);
  const lastTargetExitTimeRef = useRef<number | null>(null);
  const cooldownTimerRef = useRef<number | null>(null);
  const isCooldownRef = useRef<boolean>(false);

  // 5. State Switch Scanning (Mode Cadangan Satu Tombol)
  const [focusedSwitchId, setFocusedSwitchId] = useState<string | undefined>(undefined);
  const switchIndexRef = useRef<number>(0);

  // Mulai kamera saat pertama kali pengguna menekan Mulai
  const handleStartCamera = async () => {
    setSettings((prev) => ({
      ...prev,
      controlMode: 'head_tracker',
      switchScanningEnabled: false,
    }));
    await startCamera();
    setHasStarted(true);
    if (!calibration.isCalibrated) {
      setIsCalibrating(true);
    }
  };

  // Mulai dengan Mode Simulasi Mouse (Langsung jalan tanpa kamera)
  const handleStartMouseSimulator = () => {
    setSettings((prev) => ({
      ...prev,
      controlMode: 'mouse_simulator',
      switchScanningEnabled: false,
      showCameraPreview: false,
    }));
    setHasStarted(true);
  };

  // Masuk ke Mode Cadangan (Switch Scanning Satu Tombol)
  const handleStartFallbackSwitch = () => {
    setSettings((prev) => ({
      ...prev,
      controlMode: 'switch_scanning',
      switchScanningEnabled: true,
      showCameraPreview: false,
    }));
    setHasStarted(true);
  };

  // Dapatkan prefix kata yang sedang diketik (kata terakhir)
  const currentPrefix = useMemo(() => {
    if (!text) return '';
    const parts = text.split(/\s+/);
    return parts[parts.length - 1] || '';
  }, [text]);

  // Dapatkan 3 saran kata berdasarkan prefix
  const suggestions = useMemo(() => {
    return getWordSuggestions(currentPrefix);
  }, [currentPrefix]);

  // Aksi Pengetikan
  const handleSelectLetter = useCallback((letter: string) => {
    setText((prev) => prev + letter);
    // Setelah huruf dipilih, huruf masuk ke teks dan kembali ke menu utama otomatis
    setKeyboardView('main');
    setActiveGroup(null);
  }, []);

  const handleSelectGroup = useCallback((group: LetterGroup) => {
    setActiveGroup(group);
    setKeyboardView('group');
  }, []);

  const handleSpace = useCallback(() => {
    setText((prev) => (prev ? prev + ' ' : ''));
  }, []);

  const handleDelete = useCallback(() => {
    setText((prev) => (prev.length > 0 ? prev.slice(0, -1) : ''));
  }, []);

  const handleClear = useCallback(() => {
    setText('');
  }, []);

  const handleSelectSuggestion = useCallback((word: string) => {
    setText((prev) => {
      if (!prev.trim()) {
        return word + ' ';
      }
      const words = prev.trimEnd().split(/\s+/);
      words[words.length - 1] = word;
      return words.join(' ') + ' ';
    });
  }, []);

  // Pembacaan Teks Bicara
  const handleSpeak = useCallback(
    (customText?: string) => {
      const textToSpeak = customText || text;
      if (!textToSpeak.trim()) return;

      setIsSpeaking(true);
      const res = speakIndonesian(textToSpeak, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
        voiceURI: settings.voiceURI,
        onEnd: () => {
          setIsSpeaking(false);
          playChimeSound();
        },
        onError: () => {
          setIsSpeaking(false);
        },
      });

      setHasIndonesianVoice(res.hasIndonesianVoice);
    },
    [text, settings.speechRate, settings.speechPitch, settings.voiceURI]
  );

  // Pemilihan Frasa Cepat (Langsung diucapkan)
  const handleSelectPhrase = useCallback(
    (phrase: PhraseItem) => {
      handleSpeak(phrase.text);
      setKeyboardView('main');
    },
    [handleSpeak]
  );

  // Toggle Mode Jeda (Istirahat)
  const handleTogglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Selesai Kalibrasi
  const handleCalibrationComplete = useCallback((newCalib: CalibrationData) => {
    setCalibration(newCalib);
    setIsCalibrating(false);
  }, []);

  // Cooldown Manager (Jeda Pendinginan 800 ms agar tidak terpilih dua kali)
  const triggerCooldown = useCallback(() => {
    isCooldownRef.current = true;
    setIsCooldown(true);
    dwellTargetRef.current = null;
    dwellStartTimeRef.current = null;
    lastTargetExitTimeRef.current = null;
    setCurrentDwellId(null);
    setDwellProgress(0);

    if (cooldownTimerRef.current) {
      window.clearTimeout(cooldownTimerRef.current);
    }

    cooldownTimerRef.current = window.setTimeout(() => {
      isCooldownRef.current = false;
      setIsCooldown(false);
    }, 800);
  }, []);

  // DWELL ENGINE: Mengevaluasi posisi kursor setiap frame
  useEffect(() => {
    if (!hasStarted || isCalibrating || settings.switchScanningEnabled) {
      return;
    }

    // Jika wajah tidak terdeteksi (dan bukan mode mouse simulator), hentikan hitungan dwell
    if (!trackerState.faceDetected && settings.controlMode !== 'mouse_simulator') {
      if (dwellTargetRef.current !== null) {
        dwellTargetRef.current = null;
        dwellStartTimeRef.current = null;
        setCurrentDwellId(null);
        setDwellProgress(0);
      }
      return;
    }

    // Jika sedang dalam masa pendinginan (cooldown 800ms), abaikan dwell
    if (isCooldownRef.current) {
      return;
    }

    const { cursorX, cursorY } = trackerState;
    const now = performance.now();

    // Deteksi elemen di bawah kursor
    const hoveredEl = document.elementFromPoint(cursorX, cursorY);
    const dwellButtonEl = hoveredEl
      ? (hoveredEl.closest('[data-dwell-id]') as HTMLElement | null)
      : null;
    const targetId = dwellButtonEl ? dwellButtonEl.getAttribute('data-dwell-id') : null;

    if (targetId) {
      // Jika kursor berada di atas tombol
      if (dwellTargetRef.current === targetId) {
        if (dwellStartTimeRef.current !== null) {
          const elapsed = (now - dwellStartTimeRef.current) / 1000;
          const progress = Math.min(1.0, elapsed / settings.dwellTime);
          setDwellProgress(progress);

          // Klik Dwell tercapai! (progress >= 1.0)
          if (progress >= 1.0) {
            playClickSound();
            dwellButtonEl?.click();
            triggerCooldown();
          }
        }
      } else {
        // Tombol baru terdeteksi
        dwellTargetRef.current = targetId;
        dwellStartTimeRef.current = now;
        lastTargetExitTimeRef.current = null;
        setCurrentDwellId(targetId);
        setDwellProgress(0);
      }
    } else {
      // Kursor berada di luar tombol: toleransi keluar-masuk 150 ms
      if (dwellTargetRef.current !== null) {
        if (lastTargetExitTimeRef.current === null) {
          lastTargetExitTimeRef.current = now;
        } else if (now - lastTargetExitTimeRef.current > 150) {
          dwellTargetRef.current = null;
          dwellStartTimeRef.current = null;
          lastTargetExitTimeRef.current = null;
          setCurrentDwellId(null);
          setDwellProgress(0);
        }
      }
    }
  }, [
    hasStarted,
    isCalibrating,
    settings.switchScanningEnabled,
    settings.controlMode,
    settings.dwellTime,
    trackerState.cursorX,
    trackerState.cursorY,
    trackerState.faceDetected,
    triggerCooldown,
  ]);

  // SWITCH SCANNING ENGINE (Mode Cadangan Satu Tombol)
  useEffect(() => {
    if (!settings.switchScanningEnabled || !hasStarted || isCalibrating) {
      setFocusedSwitchId(undefined);
      return;
    }

    const interval = setInterval(() => {
      const dwellButtons = Array.from(
        document.querySelectorAll<HTMLElement>('[data-dwell-id]:not([disabled])')
      );
      if (dwellButtons.length === 0) return;

      switchIndexRef.current = (switchIndexRef.current + 1) % dwellButtons.length;
      const targetBtn = dwellButtons[switchIndexRef.current];
      const targetId = targetBtn.getAttribute('data-dwell-id') || undefined;
      setFocusedSwitchId(targetId);
    }, settings.scanSpeed * 1000);

    return () => clearInterval(interval);
  }, [
    settings.switchScanningEnabled,
    settings.scanSpeed,
    hasStarted,
    isCalibrating,
    keyboardView,
    isPaused,
  ]);

  // Tangani Tombol Keyboard Spasi / Enter untuk Mode Cadangan (Switch Scanning)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (settings.switchScanningEnabled && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        if (focusedSwitchId) {
          const el = document.querySelector<HTMLElement>(
            `[data-dwell-id="${focusedSwitchId}"]`
          );
          if (el) {
            playClickSound();
            el.click();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.switchScanningEnabled, focusedSwitchId]);

  // Tema Visual CSS
  const themeClass =
    settings.theme === 'high-contrast'
      ? 'bg-black text-yellow-300'
      : settings.theme === 'light'
      ? 'bg-slate-100 text-slate-900'
      : 'bg-slate-950 text-slate-100';

  // Layar Awal Onboarding
  if (!hasStarted) {
    return (
      <WelcomeScreen
        onStartCamera={handleStartCamera}
        isLoading={trackerState.isLoading}
        loadingMessage={trackerState.loadingMessage}
        error={trackerState.error}
        onFallbackSwitchMode={handleStartFallbackSwitch}
        onStartMouseSimulator={handleStartMouseSimulator}
      />
    );
  }

  return (
    <div
      className={`h-[100dvh] max-h-[100dvh] w-full flex flex-col justify-between p-1.5 sm:p-3 md:p-4 lg:p-5 select-none transition-colors duration-200 overflow-hidden ${themeClass}`}
    >
      {/* Kursor Kepala / Mouse Dwell Berkontur Kontras Tinggi */}
      {!settings.switchScanningEnabled && (
        <HeadCursor
          x={trackerState.cursorX}
          y={trackerState.cursorY}
          faceDetected={
            settings.controlMode === 'mouse_simulator' ? true : trackerState.faceDetected
          }
          isDwellActive={currentDwellId !== null}
          dwellProgress={dwellProgress}
          isCooldown={isCooldown}
          theme={settings.theme}
        />
      )}

      {/* Peringatan Apabila Wajah Tidak Terlihat di Mode Kamera */}
      {!trackerState.faceDetected &&
        settings.controlMode === 'head_tracker' &&
        !settings.switchScanningEnabled && (
          <div
            role="alert"
            aria-live="assertive"
            className="fixed top-2 inset-x-0 mx-auto w-fit z-50 px-5 py-2 rounded-full bg-rose-600/95 text-white font-bold text-sm sm:text-base flex items-center gap-2 shadow-2xl border-2 border-white animate-pulse"
          >
            <AlertCircle className="w-5 h-5" />
            <span>Wajah tidak terlihat. Mohon posisikan kepala menghadap webcam.</span>
          </div>
        )}

      {/* Baris Atas: Header & Aksi Cepat (Dwellable) */}
      <header className="w-full flex items-center justify-between gap-3 mb-2 px-1">
        <div className="flex items-center gap-2">
          <span className="font-black text-xl sm:text-2xl tracking-tight text-cyan-400">
            Neuro-Type
          </span>
          {/* Badge Mode Aktif */}
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            {settings.controlMode === 'head_tracker' ? (
              <>
                <Video className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pelacak Kepala</span>
              </>
            ) : settings.controlMode === 'mouse_simulator' ? (
              <>
                <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
                <span>Simulasi Mouse Dwell</span>
              </>
            ) : (
              <>
                <KeyboardIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Switch Scanning</span>
              </>
            )}
          </span>
        </div>

        {/* Tombol Aksi Pengaturan & Kalibrasi (Bisa di-dwell oleh kepala!) */}
        <div className="flex items-center gap-2">
          {/* Tombol Kalibrasi Ulang (Khusus mode pelacak kepala) */}
          {settings.controlMode === 'head_tracker' && (
            <button
              type="button"
              data-dwell-id="btn-top-recalibrate"
              onClick={() => setIsCalibrating(true)}
              aria-label="Buka Kalibrasi Ulang Gerakan Kepala"
              className={`relative px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                currentDwellId === 'btn-top-recalibrate'
                  ? 'bg-cyan-600 text-white border-white scale-105'
                  : 'bg-slate-900/90 text-cyan-300 border-slate-700 hover:bg-slate-800'
              }`}
            >
              {currentDwellId === 'btn-top-recalibrate' && dwellProgress > 0 && (
                <span
                  className="absolute inset-0 bg-white/30 rounded-xl pointer-events-none"
                  style={{ width: `${dwellProgress * 100}%` }}
                />
              )}
              <Target className="w-4 h-4" />
              <span className="hidden md:inline">Kalibrasi Ulang</span>
            </button>
          )}

          {/* Tombol Pengaturan */}
          <button
            type="button"
            data-dwell-id="btn-top-settings"
            onClick={() => setIsSettingsOpen(true)}
            aria-label="Buka Menu Pengaturan"
            className={`relative px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentDwellId === 'btn-top-settings'
                ? 'bg-cyan-600 text-white border-white scale-105'
                : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:bg-slate-800'
            }`}
          >
            {currentDwellId === 'btn-top-settings' && dwellProgress > 0 && (
              <span
                className="absolute inset-0 bg-white/30 rounded-xl pointer-events-none"
                style={{ width: `${dwellProgress * 100}%` }}
              />
            )}
            <SettingsIcon className="w-4 h-4 text-cyan-400" />
            <span className="hidden md:inline">Pengaturan</span>
          </button>
        </div>
      </header>

      {/* Bagian Atas: Kotak Teks Besar (Font ≥ 40px) */}
      <section className="w-full mb-1">
        <TextBox
          text={text}
          onClear={handleClear}
          onSpeak={() => handleSpeak()}
          isSpeaking={isSpeaking}
          theme={settings.theme}
          hasIndonesianVoice={hasIndonesianVoice}
          currentDwellId={currentDwellId}
          dwellProgress={dwellProgress}
        />
      </section>

      {/* Baris Saran Kata / Prediksi (3 Tombol Dwellable) */}
      <section className="w-full">
        <WordSuggestions
          suggestions={suggestions}
          onSelectSuggestion={handleSelectSuggestion}
          theme={settings.theme}
          buttonSize={settings.buttonSize}
          currentDwellId={currentDwellId}
          dwellProgress={dwellProgress}
          focusedSwitchId={focusedSwitchId}
        />
      </section>

      {/* Keyboard Dua Tahap Utama (Grid Responsif: 3x4 di HP portrait, 4x3 di landscape/tablet/PC) */}
      <main className="w-full flex-1 flex flex-col justify-center min-h-0 overflow-hidden my-1">
        <Keyboard
          view={keyboardView}
          activeGroup={activeGroup}
          isPaused={isPaused}
          onSelectGroup={handleSelectGroup}
          onSelectLetter={handleSelectLetter}
          onSelectPhrase={handleSelectPhrase}
          onSpace={handleSpace}
          onDelete={handleDelete}
          onSpeak={() => handleSpeak()}
          onTogglePause={handleTogglePause}
          onOpenPhrases={() => setKeyboardView('phrases')}
          onBackToMain={() => {
            setKeyboardView('main');
            setActiveGroup(null);
          }}
          theme={settings.theme}
          buttonSize={settings.buttonSize}
          currentDwellId={currentDwellId}
          dwellProgress={dwellProgress}
          focusedSwitchId={focusedSwitchId}
          hasText={text.trim().length > 0}
        />
      </main>

      {/* Footer Hak Cipta */}
      <footer className="w-full mt-1 pt-1.5 text-center text-[10px] sm:text-xs text-slate-500 border-t border-slate-800/40 flex items-center justify-between px-1 shrink-0">
        <span>Neuro-Type • Assistive Head Tracking</span>
        <span className="font-semibold text-cyan-400/80">© copyright Pak GuruAI</span>
      </footer>
      {/* Pratinjau Video Kamera di Sudut */}
      {settings.controlMode === 'head_tracker' && (
        <CameraTracker
          mediaStream={mediaStream}
          trackerState={trackerState}
          showPreview={settings.showCameraPreview}
          onTogglePreview={() =>
            setSettings((prev) => ({
              ...prev,
              showCameraPreview: !prev.showCameraPreview,
            }))
          }
          onOpenCalibration={() => setIsCalibrating(true)}
        />
      )}

      {/* Modal Kalibrasi 5 Detik */}
      <Calibration
        isOpen={isCalibrating}
        onComplete={handleCalibrationComplete}
        onCancel={() => setIsCalibrating(false)}
        mediaStream={mediaStream}
        trackerState={trackerState}
      />

      {/* Modal Pengaturan Lengkap */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newVals) =>
          setSettings((prev) => ({ ...prev, ...newVals }))
        }
        onResetSettings={() => setSettings(DEFAULT_SETTINGS)}
        onOpenCalibration={() => setIsCalibrating(true)}
        currentDwellId={currentDwellId}
        dwellProgress={dwellProgress}
      />

      {/* Panel Telemetri Debug (Disembunyikan default, bisa dibuka penguji) */}
      <DebugPanel
        trackerState={trackerState}
        currentDwellId={currentDwellId}
        dwellProgress={dwellProgress}
        isCooldown={isCooldown}
        calibration={calibration}
      />
    </div>
  );
}
