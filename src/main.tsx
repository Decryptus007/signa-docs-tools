
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Polyfill for react-pdf
global.TextDecoder = typeof TextDecoder !== 'undefined' ? TextDecoder : null;
global.TextEncoder = typeof TextEncoder !== 'undefined' ? TextEncoder : null;

createRoot(document.getElementById("root")!).render(<App />);
