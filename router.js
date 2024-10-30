'use client';

import {
  createContext,
  startTransition,
  useState,
  use,
  useEffect,
} from 'react';
import { createFromFetch } from 'react-server-dom-webpack/client';
import { ErrorBoundary } from './error-boundary';

const RouterContext = createContext(null);

export function useRouter() {
  const context = use(RouterContext);
  if (context === null) {
    throw new Error('Router was not mounted');
  }
  return context;
}

const { pathname, search } = new URL(window.location.href);
const initialContent = createFromFetch(
  fetch(`${pathname}${search ? `${search}&_rsc=true` : '?_rsc=true'}`)
);

function RouterProvider() {
  const [content, setContent] = useState(initialContent);

  const update = (url) => {
    startTransition(() => {
      const { pathname, search } = new URL(url, window.location.origin);
      const nextContent = createFromFetch(
        fetch(`${pathname}${search ? `${search}&_rsc=true` : '?_rsc=true'}`)
      );
      setContent(nextContent);
    });
  };

  const push = (url) => {
    window.history.pushState(null, null, url);
    update(url);
  };

  useEffect(() => {
    const handlePopState = () => {
      const currentUrl = window.location.pathname + window.location.search;
      update(currentUrl);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <RouterContext
      value={{
        push,
      }}
    >
      {use(content)}
    </RouterContext>
  );
}

export function Router() {
  return (
    <ErrorBoundary>
      <RouterProvider />
    </ErrorBoundary>
  );
}
