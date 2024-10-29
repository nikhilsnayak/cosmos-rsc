'use client';
import { createContext, startTransition, useState, use } from 'react';
import { createFromFetch } from 'react-server-dom-webpack/client';

const { pathname, search } = new URL(window.location.href);

const initialContent = createFromFetch(
  fetch(`${pathname}${search ? `${search}&_rsc=true` : '?_rsc=true'}`)
);

const RouterContext = createContext(null);

export function Router() {
  const [content, setContent] = useState(initialContent);

  const push = (url) => {
    startTransition(() => {
      window.history.pushState(null, null, url);
      const { pathname, search } = new URL(url, window.location.origin);
      const nextContent = createFromFetch(
        fetch(`${pathname}${search ? `${search}&_rsc=true` : '?_rsc=true'}`)
      );
      setContent(nextContent);
    });
  };

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

export function useRouter() {
  const context = use(RouterContext);
  if (context === null) {
    throw new Error('Router was not mounted');
  }

  return context;
}
