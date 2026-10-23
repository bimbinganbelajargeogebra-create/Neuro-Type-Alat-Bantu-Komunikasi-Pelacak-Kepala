/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2 } from 'lucide-react';
import { AppTheme, ButtonSize } from '../types';
import { DwellButton } from './DwellButton';

interface WordSuggestionsProps {
  suggestions: string[];
  onSelectSuggestion: (word: string) => void;
  onSpeak: () => void;
  isSpeaking: boolean;
  hasText: boolean;
  theme: AppTheme;
  buttonSize: ButtonSize;
  currentDwellId: string | null;
  dwellProgress: number;
  focusedSwitchId?: string;
}

export const WordSuggestions: React.FC<WordSuggestionsProps> = ({
  suggestions,
  onSelectSuggestion,
  onSpeak,
  isSpeaking,
  hasText,
  theme,
  buttonSize,
  currentDwellId,
  dwellProgress,
  focusedSwitchId,
}) => {
  return (
    <div className="w-full my-1 sm:my-1.5">
      {/* Header Baris Saran & Indikator */}
      <div className="flex items-center justify-between px-1 mb-1 text-[11px] sm:text-xs font-semibold text-slate-400">
        <span className="uppercase tracking-wider">Saran Kata & Aksi Suara</span>
        {isSpeaking ? (
          <span className="text-emerald-400 font-bold flex items-center gap-1 animate-pulse">
            <Volume2 className="w-3.5 h-3.5" /> Sedang berbicara...
          </span>
        ) : (
          <span className="opacity-70 text-[10px] hidden xs:inline">
            Tahan kursor untuk memilih kata atau langsung bicara
          </span>
        )}
      </div>

      {/* Grid 4 Kolom: 3 Tombol Saran Kata + 1 Tombol BICARA Cepat */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5 md:gap-3">
        {/* 3 Tombol Prediksi Kata */}
        {suggestions.map((word, index) => {
          const btnId = `suggestion-${index}`;
          return (
            <DwellButton
              key={btnId}
              id={btnId}
              label={word}
              size="small"
              variant="secondary"
              theme={theme}
              onClick={() => onSelectSuggestion(word)}
              currentDwellId={currentDwellId}
              dwellProgress={dwellProgress}
              isSwitchFocused={focusedSwitchId === btnId}
              className="!min-h-[44px] sm:!min-h-[50px] md:!min-h-[58px] font-bold !text-xs sm:!text-base md:!text-lg border-2"
              ariaLabel={`Pilih saran kata ${word}`}
            />
          );
        })}

        {/* Tombol BICARA Cepat di Bagian Atas */}
        <DwellButton
          id="btn-quick-top-speak"
          label="BICARA"
          subLabel="Ucapkan pesan"
          icon={<Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />}
          size="small"
          variant="accent"
          theme={theme}
          disabled={!hasText}
          onClick={onSpeak}
          currentDwellId={currentDwellId}
          dwellProgress={dwellProgress}
          isSwitchFocused={focusedSwitchId === 'btn-quick-top-speak'}
          className="!min-h-[44px] sm:!min-h-[50px] md:!min-h-[58px] font-bold !text-xs sm:!text-base md:!text-lg border-2 shadow-sm"
          ariaLabel={hasText ? 'Ucapkan kalimat sekarang' : 'Ketik kalimat terlebih dahulu untuk bersuara'}
        />
      </div>
    </div>
  );
};
