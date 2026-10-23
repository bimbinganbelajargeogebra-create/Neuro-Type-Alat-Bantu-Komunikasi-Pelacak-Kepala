/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import { AppSettings, CalibrationData, TrackerState } from '../types';

interface UseCameraAndFaceTrackerProps {
  settings: AppSettings;
  calibration: CalibrationData;
}

export function useCameraAndFaceTracker({
  settings,
  calibration,
}: UseCameraAndFaceTrackerProps) {
  const [state, setState] = useState<TrackerState>({
    isReady: false,
    isLoading: false,
    loadingMessage: '',
    error: null,
    faceDetected: false,
    rawNoseX: 0.5,
    rawNoseY: 0.5,
    mirroredNoseX: 0.5,
    cursorX: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    cursorY: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
    fps: 0,
  });

  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

  // Video master yang terpasang di viewport agar peramban tidak menonaktifkan rendering frame
  const masterVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Buffer untuk smoothing dan kalkulasi FPS
  const currentCursorRef = useRef({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
  });
  const targetCursorRef = useRef({
    x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500,
    y: typeof window !== 'undefined' ? window.innerHeight / 2 : 400,
  });
  const frameCountRef = useRef<number>(0);
  const fpsTimerRef = useRef<number>(performance.now());
  const lastVideoTimeRef = useRef<number>(-1);

  // Pasang elemen video master di DOM dengan visibilitas minimal agar browser tidak men-throttle frame
  useEffect(() => {
    if (!masterVideoRef.current && typeof document !== 'undefined') {
      const v = document.createElement('video');
      v.autoplay = true;
      v.playsInline = true;
      v.muted = true;
      v.setAttribute('aria-hidden', 'true');
      v.style.position = 'fixed';
      v.style.bottom = '0px';
      v.style.right = '0px';
      v.style.width = '120px';
      v.style.height = '90px';
      v.style.opacity = '0.001';
      v.style.pointerEvents = 'none';
      v.style.zIndex = '-100';
      document.body.appendChild(v);
      masterVideoRef.current = v;
    }

    return () => {
      if (masterVideoRef.current && masterVideoRef.current.parentNode) {
        masterVideoRef.current.parentNode.removeChild(masterVideoRef.current);
        masterVideoRef.current = null;
      }
    };
  }, []);

  // Inisialisasi MediaPipe FaceLandmarker
  const initMediaPipe = useCallback(async () => {
    if (landmarkerRef.current) return landmarkerRef.current;

    setState((prev) => ({
      ...prev,
      loadingMessage: 'Mengunduh model pelacak wajah MediaPipe...',
    }));

    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    );

    let faceLandmarker: FaceLandmarker;

    // Coba delegasi GPU terlebih dahulu; jika tidak didukung, beralih ke CPU
    try {
      faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        outputFaceBlendshapes: false,
        runningMode: 'VIDEO',
        numFaces: 1,
      });
    } catch (gpuErr) {
      console.info('Menggunakan delegasi CPU untuk pemrosesan wajah MediaPipe');
      faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'CPU',
        },
        outputFaceBlendshapes: false,
        runningMode: 'VIDEO',
        numFaces: 1,
      });
    }

    landmarkerRef.current = faceLandmarker;
    return faceLandmarker;
  }, []);

  // Mulai kamera dengan konfirmasi izin langsung
  const startCamera = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      loadingMessage: 'Membuka izin webcam peramban...',
      error: null,
    }));

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'Peramban atau lingkungan Anda tidak mendukung API akses kamera (getUserMedia).'
        );
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });
      } catch (err) {
        console.warn('getUserMedia ideal gagal, mencoba opsi video standar:', err);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setMediaStream(stream);

      // Pasang stream ke master video
      if (masterVideoRef.current) {
        masterVideoRef.current.srcObject = stream;
        try {
          await masterVideoRef.current.play();
        } catch (playErr) {
          console.warn('masterVideo.play() warning:', playErr);
        }
      }

      // Siapkan model MediaPipe
      await initMediaPipe();

      setState((prev) => ({
        ...prev,
        isReady: true,
        isLoading: false,
        loadingMessage: '',
        error: null,
      }));
    } catch (err: unknown) {
      console.warn('Peringatan saat menyalakan kamera:', err);
      let errorMsg = 'Terjadi kendala saat membuka kamera.';

      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMsg =
            'Izin akses kamera ditolak oleh peramban atau iframe. Klik ikon gembok/kamera di baris alamat URL peramban Anda untuk mengizinkan kamera, lalu klik "Coba Buka Kamera Lagi".';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMsg =
            'Perangkat webcam tidak ditemukan. Pastikan kamera terpasang pada komputer/laptop Anda.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMsg =
            'Kamera sedang dipakai oleh aplikasi lain (seperti Zoom, Google Meet). Harap tutup aplikasi tersebut dan coba lagi.';
        }
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }

      setState((prev) => ({
        ...prev,
        isReady: false,
        isLoading: false,
        loadingMessage: '',
        error: errorMsg,
      }));
    }
  }, [initMediaPipe]);

  // Hentikan kamera
  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setMediaStream(null);
    if (masterVideoRef.current) {
      masterVideoRef.current.srcObject = null;
    }
    setState((prev) => ({ ...prev, isReady: false }));
  }, []);

  // Mode Simulasi Mouse: Gerakkan kursor langsung dengan mouse/touchpad
  useEffect(() => {
    if (settings.controlMode !== 'mouse_simulator') return;

    const handleMouseMove = (e: MouseEvent) => {
      const rawTargetX = e.clientX;
      const rawTargetY = e.clientY;

      targetCursorRef.current = { x: rawTargetX, y: rawTargetY };

      const alpha = Math.max(0.1, Math.min(0.8, settings.smoothing * 1.5));
      const smoothedX =
        currentCursorRef.current.x * (1 - alpha) + targetCursorRef.current.x * alpha;
      const smoothedY =
        currentCursorRef.current.y * (1 - alpha) + targetCursorRef.current.y * alpha;

      currentCursorRef.current = { x: smoothedX, y: smoothedY };

      setState((prev) => ({
        ...prev,
        faceDetected: true,
        cursorX: smoothedX,
        cursorY: smoothedY,
        fps: 60,
      }));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [settings.controlMode, settings.smoothing]);

  // Loop deteksi frame per frame MediaPipe
  useEffect(() => {
    if (!state.isReady || settings.controlMode === 'mouse_simulator') return;

    let isMounted = true;

    const processFrame = () => {
      if (!isMounted) return;

      const video = masterVideoRef.current;
      const landmarker = landmarkerRef.current;

      if (video && landmarker) {
        if (video.paused) {
          video.play().catch(() => {});
        }

        if (video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
          lastVideoTimeRef.current = video.currentTime;
          const startTimeMs = performance.now();

          try {
            const results = landmarker.detectForVideo(video, startTimeMs);

            // Hitung FPS
            frameCountRef.current += 1;
            const now = performance.now();
            if (now - fpsTimerRef.current >= 1000) {
              const currentFps = Math.round(
                (frameCountRef.current * 1000) / (now - fpsTimerRef.current)
              );
              frameCountRef.current = 0;
              fpsTimerRef.current = now;
              setState((prev) => ({ ...prev, fps: currentFps }));
            }

            if (results.faceLandmarks && results.faceLandmarks.length > 0) {
              // Indeks 1: Ujung Hidung (Nose Tip)
              const nose = results.faceLandmarks[0][1];
              const rawX = nose.x;
              const rawY = nose.y;

              // Cermin sumbu X
              const mirroredX = 1.0 - rawX;

              // Simpangan dari titik netral hasil kalibrasi
              const neutralX = calibration.neutralX || 0.5;
              const neutralY = calibration.neutralY || 0.5;
              const rangeX = Math.max(0.02, calibration.rangeX || 0.08);
              const rangeY = Math.max(0.02, calibration.rangeY || 0.08);

              const deltaX = mirroredX - neutralX;
              const deltaY = rawY - neutralY;

              // Petakan dengan penguatan sensitivitas
              const gain = settings.sensitivity;
              const normX = (deltaX / rangeX) * gain;
              const normY = (deltaY / rangeY) * gain;

              const screenW = window.innerWidth;
              const screenH = window.innerHeight;

              const rawTargetX = screenW * (0.5 + 0.5 * normX);
              const rawTargetY = screenH * (0.5 + 0.5 * normY);

              const clampedTargetX = Math.max(10, Math.min(screenW - 10, rawTargetX));
              const clampedTargetY = Math.max(10, Math.min(screenH - 10, rawTargetY));

              // Terapkan Dead-Zone (anti getar saat kepala diam)
              const dist = Math.hypot(
                clampedTargetX - currentCursorRef.current.x,
                clampedTargetY - currentCursorRef.current.y
              );

              if (dist > settings.deadZone) {
                targetCursorRef.current = {
                  x: clampedTargetX,
                  y: clampedTargetY,
                };
              }

              // Exponential Moving Average (EMA) Smoothing
              const alpha = Math.max(0.05, Math.min(0.6, settings.smoothing));
              const smoothedX =
                currentCursorRef.current.x * (1 - alpha) +
                targetCursorRef.current.x * alpha;
              const smoothedY =
                currentCursorRef.current.y * (1 - alpha) +
                targetCursorRef.current.y * alpha;

              currentCursorRef.current = { x: smoothedX, y: smoothedY };

              setState((prev) => ({
                ...prev,
                faceDetected: true,
                rawNoseX: rawX,
                rawNoseY: rawY,
                mirroredNoseX: mirroredX,
                cursorX: smoothedX,
                cursorY: smoothedY,
              }));
            } else {
              // Wajah tidak terdeteksi
              setState((prev) => ({
                ...prev,
                faceDetected: false,
              }));
            }
          } catch (e) {
            console.warn('Peringatan saat memproses frame pelacak:', e);
          }
        }
      }

      animFrameIdRef.current = requestAnimationFrame(processFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(processFrame);

    return () => {
      isMounted = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [
    state.isReady,
    settings.controlMode,
    calibration.neutralX,
    calibration.neutralY,
    calibration.rangeX,
    calibration.rangeY,
    settings.sensitivity,
    settings.smoothing,
    settings.deadZone,
  ]);

  // Bersihkan saat unmount
  useEffect(() => {
    return () => {
      stopCamera();
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
        landmarkerRef.current = null;
      }
    };
  }, [stopCamera]);

  return {
    state,
    mediaStream,
    startCamera,
    stopCamera,
    currentCursor: currentCursorRef.current,
  };
}
