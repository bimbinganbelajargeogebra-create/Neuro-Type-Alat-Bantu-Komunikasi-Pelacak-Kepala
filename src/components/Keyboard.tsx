/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Volume2,
  Delete,
  Space,
  Pause,
  Play,
  ArrowLeft,
  MessageSquareQuote,
  CornerDownLeft,
} from 'lucide-react';
import { AppTheme, ButtonSize, KeyboardView, LetterGroup, PhraseItem } from '../types';
import { DwellButton } from './DwellButton';

// 7 Grup Huruf Terstruktur
export const LETTER_GROUPS: Record<string, LetterGroup> = {
  'group-abcd': { id: 'group-abcd', label: 'ABCD', letters: ['A', 'B', 'C', 'D'] },
  'group-efgh': { id: 'group-efgh', label: 'EFGH', letters: ['E', 'F', 'G', 'H'] },
  'group-ijkl': { id: 'group-ijkl', label: 'IJKL', letters: ['I', 'J', 'K', 'L'] },
  'group-mnop': { id: 'group-mnop', label: 'MNOP', letters: ['M', 'N', 'O', 'P'] },
  'group-qrst': { id: 'group-qrst', label: 'QRST', letters: ['Q', 'R', 'S', 'T'] },
  'group-uvwx': { id: 'group-uvwx', label: 'UVWX', letters: ['U', 'V', 'W', 'X'] },
  'group-yz': { id: 'group-yz', label: 'YZ', letters: ['Y', 'Z', '.', ',', '?', '!'] },
};

// 8 Frasa Cepat untuk Percakapan Harian
export const QUICK_PHRASES: PhraseItem[] = [
  { id: 'phrase-1', text: 'Ya', category: 'utama' },
  { id: 'phrase-2', text: 'Tidak', category: 'utama' },
  { id: 'phrase-3', text: 'Saya haus, tolong ambilkan minum', category: 'kebutuhan' },
  { id: 'phrase-4', text: 'Saya lapar', category: 'kebutuhan' },
  { id: 'phrase-5', text: 'Saya merasa sakit', category: 'kesehatan' },
  { id: 'phrase-6', text: 'Tolong panggil perawat', category: 'kesehatan' },
  { id: 'phrase-7', text: 'Terima kasih', category: 'utama' },
  { id: 'phrase-8', text: 'Tolong ubah posisi saya', category: 'kebutuhan' },
];

interface KeyboardProps {
  view: KeyboardView;
  activeGroup: LetterGroup | null;
  isPaused: boolean;
  onSelectGroup: (group: LetterGroup) => void;
  onSelectLetter: (letter: string) => void;
  onSelectPhrase: (phrase: PhraseItem) => void;
  onSpace: () => void;
  onDelete: () => void;
  onSpeak: () => void;
  onTogglePause: () => void;
  onOpenPhrases: () => void;
  onBackToMain: () => void;
  theme: AppTheme;
  buttonSize: ButtonSize;
  currentDwellId: string | null;
  dwellProgress: number;
  focusedSwitchId?: string;
  hasText: boolean;
}

export const Keyboard: React.FC<KeyboardProps> = ({
  view,
  activeGroup,
  isPaused,
  onSelectGroup,
  onSelectLetter,
  onSelectPhrase,
  onSpace,
  onDelete,
  onSpeak,
  onTogglePause,
  onOpenPhrases,
  onBackToMain,
  theme,
  buttonSize,
  currentDwellId,
  dwellProgress,
  focusedSwitchId,
  hasText,
}) => {
  // 1. TAMPILAN MODE JEDA (ISTIRAHAT)
  if (isPaused) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center p-4 sm:p-8 bg-slate-900/90 dark:bg-slate-950/90 rounded-2xl border-2 border-amber-500/60 shadow-xl backdrop-blur-sm">
        <div className="text-center mb-5 sm:mb-7 max-w-md">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-amber-500/10 text-amber-400 mb-3 border border-amber-500/40">
            <Pause className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-300 mb-2">
            Mode Istirahat Aktif
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Semua tombol dinonaktifkan agar Anda dapat mengistirahatkan mata dan kepala
            tanpa khawatir memicu tombol lain.
          </p>
        </div>

        <DwellButton
          id="btn-resume-mode"
          label="LANJUTKAN"
          subLabel="Tahan kursor untuk kembali mengetik"
          icon={<Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />}
          variant="accent"
          size="large"
          theme={theme}
          onClick={onTogglePause}
          currentDwellId={currentDwellId}
          dwellProgress={dwellProgress}
          isSwitchFocused={focusedSwitchId === 'btn-resume-mode'}
          className="w-full max-w-sm sm:max-w-md !min-h-[95px] sm:!min-h-[120px] text-2xl sm:text-3xl font-black border-2 border-white"
          ariaLabel="Lanjutkan dan aktifkan kembali keyboard"
        />
      </div>
    );
  }

  // 2. TAMPILAN MENU FRASA CEPAT
  if (view === 'phrases') {
    return (
      <div className="w-full flex-1 flex flex-col h-full min-h-0 overflow-y-auto">
        {/* Navigasi Breadcrumb & Tombol Kembali Jelas */}
        <div className="flex items-center justify-between mb-2 px-1 pb-1 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-slate-400">Navigasi:</span>
            <span className="text-xs text-slate-400">Menu Utama</span>
            <span className="text-slate-500">/</span>
            <span className="text-sm font-bold text-sky-400 flex items-center gap-1">
              <MessageSquareQuote className="w-4 h-4" /> Frasa Cepat
            </span>
          </div>

          <DwellButton
            id="btn-back-from-phrases"
            label="KEMBALI"
            subLabel="Ke Menu Utama"
            icon={<ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
            variant="secondary"
            size="small"
            theme={theme}
            onClick={onBackToMain}
            currentDwellId={currentDwellId}
            dwellProgress={dwellProgress}
            isSwitchFocused={focusedSwitchId === 'btn-back-from-phrases'}
            className="!min-h-[42px] sm:!min-h-[48px] px-4 font-bold border-2"
            ariaLabel="Kembali ke menu utama"
          />
        </div>

        {/* Grid Frasa Cepat */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5 flex-1">
          {QUICK_PHRASES.map((phrase) => {
            const isEmergency =
              phrase.id === 'phrase-5' || phrase.id === 'phrase-6';
            return (
              <DwellButton
                key={phrase.id}
                id={phrase.id}
                label={phrase.text}
                subLabel="langsung diucapkan"
                variant={isEmergency ? 'danger' : 'primary'}
                size={buttonSize}
                theme={theme}
                onClick={() => onSelectPhrase(phrase)}
                currentDwellId={currentDwellId}
                dwellProgress={dwellProgress}
                isSwitchFocused={focusedSwitchId === phrase.id}
                className="!text-xs sm:!text-sm md:!text-base font-bold p-2.5 text-center leading-snug"
                ariaLabel={`Ucapkan frasa ${phrase.text}`}
              />
            );
          })}
        </div>
      </div>
    );
  }

  // 3. TAMPILAN MENU GRUP HURUF (Setelah Memilih ABCD, dsb.)
  if (view === 'group' && activeGroup) {
    return (
      <div className="w-full flex-1 flex flex-col h-full min-h-0 overflow-y-auto">
        {/* Navigasi Breadcrumb & Tombol Kembali */}
        <div className="flex items-center justify-between mb-2 px-1 pb-1 border-b border-slate-700/50">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs uppercase font-bold text-slate-400">Pilih Huruf:</span>
            <span className="text-xs text-slate-400">Grup</span>
            <span className="text-slate-500">/</span>
            <span className="text-lg font-black text-sky-400">
              {activeGroup.label}
            </span>
          </div>

          <DwellButton
            id="btn-back-from-group"
            label="KEMBALI"
            subLabel="Ke Menu Utama"
            icon={<ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />}
            variant="secondary"
            size="small"
            theme={theme}
            onClick={onBackToMain}
            currentDwellId={currentDwellId}
            dwellProgress={dwellProgress}
            isSwitchFocused={focusedSwitchId === 'btn-back-from-group'}
            className="!min-h-[42px] sm:!min-h-[48px] px-4 font-bold border-2"
            ariaLabel="Kembali ke menu utama"
          />
        </div>

        {/* Grid Huruf Tunggal dengan Tombol Spasi dan Hapus di Dalam Subgrup */}
        <div
          className={`grid gap-2 sm:gap-2.5 flex-1 ${
            activeGroup.letters.length > 4
              ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-4'
              : 'grid-cols-2 sm:grid-cols-4 md:grid-cols-4'
          }`}
        >
          {activeGroup.letters.map((char) => {
            const charId = `char-${char}`;
            return (
              <DwellButton
                key={charId}
                id={charId}
                label={char}
                subLabel="pilih huruf"
                variant="primary"
                size={buttonSize}
                theme={theme}
                onClick={() => onSelectLetter(char)}
                currentDwellId={currentDwellId}
                dwellProgress={dwellProgress}
                isSwitchFocused={focusedSwitchId === charId}
                className="!text-3xl sm:!text-5xl md:!text-6xl font-black"
                ariaLabel={`Pilih huruf ${char}`}
              />
            );
          })}

          {/* Akses SPASI di dalam subgrup */}
          <DwellButton
            id="btn-subgroup-space"
            label="SPASI"
            icon={<Space className="w-5 h-5 sm:w-6 sm:h-6" />}
            variant="secondary"
            size={buttonSize}
            theme={theme}
            onClick={onSpace}
            currentDwellId={currentDwellId}
            dwellProgress={dwellProgress}
            isSwitchFocused={focusedSwitchId === 'btn-subgroup-space'}
            ariaLabel="Tambahkan spasi"
          />

          {/* Akses HAPUS di dalam subgrup */}
          <DwellButton
            id="btn-subgroup-delete"
            label="HAPUS"
            icon={<Delete className="w-5 h-5 sm:w-6 sm:h-6" />}
            variant="danger"
            size={buttonSize}
            theme={theme}
            onClick={onDelete}
            currentDwellId={currentDwellId}
            dwellProgress={dwellProgress}
            isSwitchFocused={focusedSwitchId === 'btn-subgroup-delete'}
            ariaLabel="Hapus satu karakter"
          />
        </div>
      </div>
    );
  }

  // 4. TAMPILAN MENU UTAMA (12 Tombol Besar Berkontras Tinggi & Proporsional)
  // Responsif: 3x4 di HP Portrait, 4x3 di Landscape Tablet / Laptop / PC
  return (
    <div className="w-full flex-1 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3 flex-1 h-full min-h-0">
      {/* 1. ABCD */}
      <DwellButton
        id="btn-group-abcd"
        label="ABCD"
        subLabel="Huruf A - D"
        size={buttonSize}
        theme={theme}
        onClick={() => onSelectGroup(LETTER_GROUPS['group-abcd'])}
        currentDwellId={currentDwellId}
        dwellProgress={dwellProgress}
        isSwitchFocused={focusedSwitchId === 'btn-group-abcd'}
      />

      {/* 2. EFGH */}
      <DwellButton
        id="btn-group-efgh"
        label="EFGH"
        subLabel="Huruf E - H"
        size={buttonSize}
        theme={theme}
        onClick={() => onSelectGroup(LETTER_GROUPS['group-efgh'])}
        currentDwellId={currentDwellId}
        dwellProgress={dwellProgress}
        isSwitchFocused={focusedSwitchId === 'btn-group-efgh'}
      />

      {/* 3. IJKL */}
      <DwellButton
        id="btn-group-ijkl"
        label="IJKL"
        subLabel="Huruf I - L"
        size={buttonSize}
        theme={theme}
        onClick={() => onSelectGroup(LETTER_GROUPS['group-ijkl'])}
        currentDwellId={currentDwellId}
        dwellProgress={dwellProgress}
        isSwitchFocused={focusedSwitchId === 'btn-group-ijkl'}
      />

      {/* 4. MNOP */}
      <DwellButton
        id="btn-group-mnop"
        label="MNOP"
        subLabel="Huruf M - P"
        size={buttonSize}
        theme={theme}
        onClick={() => onSelectGroup(LETTER_GROUPS['group-mnop'])}
        currentDwellId={currentDwellId}
        dwellProgress={dwellProgress}
        isSwitchFocused={focusedSwitchId === 'btn-group-mnop'}
      />

      {/* 5. QRST */}
      <DwellButton
        id="btn-group-qrst"
        label="QRST"
        subLabel="Huruf Q - T"
        size={buttonSize}
        theme={theme}
        onClick={() => onSelectGroup(LETTER_GROUPS['group-qrst'])}
        currentDwellId={currentDwellId}
        dwellProgress={dwellProgress}
        isSwitchFocused={focusedSwitchId === 'btn-group-qrst'}
      />

      {/* 6. UVWX */}
      <DwellButton
        id="btn-group-uvwx"
        label="UVWX"
        subLabel="Huruf U - X"
        size={buttonSize}
        theme={theme}
        onClick={() => onSelectGroup(LETTER_GROUPS['group-uvwx'])}
        currentDwellId={currentDwellId}
        dwellProgress={dwellProgress}
        isSwitchFocused={focusedSwitchId === 'btn-group-uvwx'}
      />

      {/* 7. YZ */}
      <DwellButton
        id="btn-group-yz"
        label="YZ & Tanda"
        subLabel="Y Z . , ? !"
        size={buttonSize}
        theme={theme}
        onClick={() => onSelectGroup(LETTER_GROUPS['group-yz'])}
        currentDwellId={currentDwellId}
        dwellProgress={dwellProgress}
        isSwitchFocused={focusedSwitchId === 'btn-group-yz'}
      />

      {/* 8. SPASI */}
      <DwellButton
        id="btn-main-space"
        label="SPASI"
        subLabel="Jarak kata"
        icon={<Space className="w-5 h-5 sm:w-6 sm:h-6" />}
        variant="secondary"
        size={buttonSize}
        theme={theme}
        onClick={onSpace}
        currentDwellId={currentDwellId}
        dwellProgress={dwellProgress}
        isSwitchFocused={focusedSwitchId === 'btn-main-space'}
      />

      {/* 9. HAPUS */}
      <DwellButton
        id="btn-main-delete"
        label="HAPUS"
        subLabel="Hapus 1 huruf"
        icon={<Delete className="w-5 h-5 sm:w-6 sm:h-6" />}
        variant="danger"
        size={buttonSize}
        theme={theme}
        onClick={onDelete}
        currentDwellId={currentDwellId}
        dwellProgress={dwellProgress}
        isSwitchFocused={focusedSwitchId === 'btn-main-delete'}
      />

      {/* 10. FRASA */}
      <DwellButton
        id="btn-main-phrases"
        label="FRASA"
        subLabel="Kalimat siap pakai"
        icon={<MessageSquareQuote className="w-5 h-5 sm:w-6 sm:h-6" />}
        variant="warning"
        size={buttonSize}
        theme={theme}
        onClick={onOpenPhrases}
        currentDwellId={currentDwellId}
        dwellProgress={dwellProgress}
        isSwitchFocused={focusedSwitchId === 'btn-main-phrases'}
      />

      {/* 11. BICARA */}
      <DwellButton
        id="btn-main-speak"
        label="BICARA"
        subLabel={hasText ? 'Baca seluruh teks' : 'Ketik teks dulu'}
        icon={<Volume2 className="w-5 h-5 sm:w-6 sm:h-6" />}
        variant="accent"
        size={buttonSize}
        theme={theme}
        disabled={!hasText}
        onClick={onSpeak}
        currentDwellId={currentDwellId}
        dwellProgress={dwellProgress}
        isSwitchFocused={focusedSwitchId === 'btn-main-speak'}
      />

      {/* 12. JEDA */}
      <DwellButton
        id="btn-main-pause"
        label="JEDA"
        subLabel="Mode istirahat"
        icon={<Pause className="w-5 h-5 sm:w-6 sm:h-6" />}
        variant="warning"
        size={buttonSize}
        theme={theme}
        onClick={onTogglePause}
        currentDwellId={currentDwellId}
        dwellProgress={dwellProgress}
        isSwitchFocused={focusedSwitchId === 'btn-main-pause'}
      />
    </div>
  );
};
