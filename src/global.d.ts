// src/global.d.ts
interface Window {
  ttq?: {
    track: (event: string, data?: Record<string, unknown>) => void;
  };
}