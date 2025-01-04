import { createContext, use } from 'react';

export const RouterContext = createContext(null);

export function useRouter() {
  const context = use(RouterContext);
  if (typeof window !== 'undefined' && context === null) {
    throw new Error('Router was not mounted');
  }
  return context;
}
