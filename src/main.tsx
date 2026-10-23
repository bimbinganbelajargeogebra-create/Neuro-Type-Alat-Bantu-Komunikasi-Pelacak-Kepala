import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// TensorFlow Lite WebAssembly mencatat pesan info normal (seperti inisialisasi delegate XNNPACK CPU)
// melalui stderr, yang oleh Emscripten dialihkan ke console.error.
// Arahkan pesan berkategori "INFO:" ke console.info agar tidak memicu sistem pemantau error peramban.
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const first = args[0];
  if (
    typeof first === 'string' &&
    (first.startsWith('INFO:') ||
      first.includes('XNNPACK') ||
      first.includes('TensorFlow Lite'))
  ) {
    console.info(...args);
    return;
  }
  originalConsoleError.apply(console, args);
};

createRoot(document.getElementById('root')!).render(<App />);
