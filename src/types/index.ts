/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AppTheme = 'dark' | 'light' | 'high-contrast';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ControlMode = 'head_tracker' | 'mouse_simulator' | 'switch_scanning';

export interface AppSettings {
  dwellTime: number; // detik (0.8 - 4.0)
  sensitivity: number; // gain (1.0 - 4.5)
  smoothing: number; // alpha (0.05 - 0.5, lower = smoother)
  deadZone: number; // pixel radius (0 - 15)
  speechRate: number; // 0.7 - 1.4
  speechPitch: number; // 0.8 - 1.2
  voiceURI: string; // voice pilihan
  buttonSize: ButtonSize;
  theme: AppTheme;
  showCameraPreview: boolean;
  switchScanningEnabled: boolean;
  scanSpeed: number; // detik per lompatan switch (1.0 - 3.0)
  controlMode: ControlMode;
}

export interface CalibrationData {
  isCalibrated: boolean;
  neutralX: number; // posisi hidung rileks (0.0 - 1.0)
  neutralY: number; // posisi hidung rileks (0.0 - 1.0)
  rangeX: number; // jangkauan horizontal
  rangeY: number; // jangkauan vertikal
}

export type KeyboardView = 'main' | 'group' | 'phrases';

export interface LetterGroup {
  id: string;
  label: string;
  letters: string[];
}

export interface PhraseItem {
  id: string;
  text: string;
  category?: 'utama' | 'kesehatan' | 'kebutuhan';
}

export interface TrackerState {
  isReady: boolean;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  faceDetected: boolean;
  rawNoseX: number;
  rawNoseY: number;
  mirroredNoseX: number;
  cursorX: number;
  cursorY: number;
  fps: number;
}
