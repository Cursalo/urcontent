import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { measureWebVitals, trackBundleLoading } from './lib/performance.ts' // Initialize performance monitoring in development
if (import.meta.env.DEV) { measureWebVitals(); trackBundleLoading();
} createRoot(document.getElementById("root")!).render(<App />);
