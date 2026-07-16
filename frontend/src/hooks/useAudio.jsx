import React, { createContext, useContext } from 'react';
import useCyberAudio from './useCyberAudio';

const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const value = useCyberAudio();
  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
}

export function useAudio() {
  const ctx = useContext(AudioContext);
  if (!ctx) {
    // Non-throwing fallback for components rendered outside the provider
    return { muted: true, toggleMute: () => {}, click: () => {}, started: false };
  }
  return ctx;
}
