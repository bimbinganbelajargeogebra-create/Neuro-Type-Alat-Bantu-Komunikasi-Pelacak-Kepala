/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { AppTheme, ButtonSize } from '../types';
import { DwellButton } from './DwellButton';

interface WordSuggestionsProps {
  suggestions: string[];
  onSelectSuggestion: (word: string) => void;
  theme: AppTheme;
  buttonSize: ButtonSize;
  currentDwellId: string | null;
  dwellProgress: number;
  focusedSwitchId?: string;
}

export const WordSuggestions: React.FC<WordSuggestionsProps> = ({
  suggestions,
  onSelectSuggestion,
  theme,
  buttonSize,
  currentDwellId,
  dwellProgress,
  focusedSwitchId,
}) => {
  return (
    <div className="w-full my-1 sm:my-1.5">
      <div className="flex items-center gap-1 mb-0.5 sm:mb-1 px-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-cyan-400/90">
        <Sparkles className="w-3 h-3" />
        <span>Prediksi Kata:</span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3">
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
              className="!min-h-[40px] sm:!min-h-[48px] md:!min-h-[56px] font-bold !text-xs sm:!text-base md:!text-lg border-cyan-500/40 rounded-xl"
              ariaLabel={`Pilih saran kata ${word}`}
            />
          );
        })}
      </div>
    </div>
  );
};
