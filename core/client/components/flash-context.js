import { createContext, use } from 'react';

export const FlashContext = createContext(null);

export function useFlash() {
  const context = use(FlashContext);
  if (context === null) {
    throw new Error('FlashContext was not mounted');
  }
  return context;
}
