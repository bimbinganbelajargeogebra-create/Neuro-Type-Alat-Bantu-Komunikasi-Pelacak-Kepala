/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API Context singleton
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    console.warn('AudioContext gagal diinisialisasi:', e);
    return null;
  }
}

/**
 * Memainkan suara "klik" pendek yang renyah (crisp) dan nyaman didengar
 */
export function playClickSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Frekuensi turun cepat dari 950Hz ke 350Hz (karakter klik mekanik halus)
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.045);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.048);
  } catch (err) {
    console.warn('Gagal memainkan suara klik:', err);
  }
}

/**
 * Memainkan suara nada gembira/berhasil saat kalimat selesai atau frasa dibacakan
 */
export function playChimeSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      const noteStart = now + idx * 0.07;
      gain.gain.setValueAtTime(0.12, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + 0.18);
    });
  } catch (err) {
    console.warn('Gagal memainkan chime:', err);
  }
}

/**
 * Mendapatkan daftar voice Bahasa Indonesia yang tersedia di browser
 */
export function getAvailableVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        resolve(voices);
      } else {
        // Coba lagi setelah event onvoiceschanged
        window.speechSynthesis.onvoiceschanged = () => {
          resolve(window.speechSynthesis.getVoices());
        };
      }
    };

    checkVoices();
    // Timeout aman
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 600);
  });
}

/**
 * Membacakan teks dalam Bahasa Indonesia menggunakan Web Speech API
 */
export function speakIndonesian(
  text: string,
  options?: {
    rate?: number;
    pitch?: number;
    voiceURI?: string;
    onEnd?: () => void;
    onError?: (err: unknown) => void;
  }
): { success: boolean; hasIndonesianVoice: boolean } {
  if (!('speechSynthesis' in window)) {
    console.warn('Browser tidak mendukung Web Speech API');
    return { success: false, hasIndonesianVoice: false };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return { success: false, hasIndonesianVoice: false };
  }

  // Batalkan ujaran yang sedang berjalan
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(trimmed);
  utterance.lang = 'id-ID';
  utterance.rate = options?.rate ?? 1.0;
  utterance.pitch = options?.pitch ?? 1.0;

  const allVoices = window.speechSynthesis.getVoices();
  const idVoices = allVoices.filter(v => 
    v.lang.toLowerCase().startsWith('id') || 
    v.lang.toLowerCase().includes('indonesia') ||
    v.name.toLowerCase().includes('indonesia')
  );

  let chosenVoice: SpeechSynthesisVoice | undefined;

  if (options?.voiceURI) {
    chosenVoice = allVoices.find(v => v.voiceURI === options.voiceURI);
  }

  if (!chosenVoice && idVoices.length > 0) {
    chosenVoice = idVoices[0];
  }

  const hasIndonesianVoice = idVoices.length > 0;

  if (chosenVoice) {
    utterance.voice = chosenVoice;
  }

  if (options?.onEnd) {
    utterance.onend = () => options.onEnd?.();
  }
  if (options?.onError) {
    utterance.onerror = (e) => options.onError?.(e);
  }

  window.speechSynthesis.speak(utterance);
  return { success: true, hasIndonesianVoice };
}
