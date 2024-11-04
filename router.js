'use client';

import {
  createContext,
  useActionState,
  use,
  useEffect,
  startTransition,
} from 'react';
import { createFromFetch } from 'react-server-dom-webpack/client';
import { ErrorBoundary } from './error-boundary';

function getFullPath(url) {
  const { pathname, search } = new URL(url, window.location.origin);
  return `${pathname}${search ? `${search}&_rsc=true` : '?_rsc=true'}`;
}

async function getRSCPayload(url) {
  const path = getFullPath(url);
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error('Failed to fetch RSC Payload');
  }
  const rscPayload = await createFromFetch(Promise.resolve(response));
  return { path, rscPayload };
}

async function routerReducer(prevState, action) {
  if (action.type !== 'PUSH' && action.type !== 'NAVIGATE') {
    return prevState;
  }

  const { url } = action.payload;
  const fullPath = getFullPath(url);

  if (action.type === 'NAVIGATE' && prevState.cache.has(fullPath)) {
    return {
      ...prevState,
      routerState: prevState.cache.get(fullPath),
    };
  }

  const { path, rscPayload } = await getRSCPayload(url);
  const cache = new Map(prevState.cache);
  cache.set(path, rscPayload);

  if (action.type === 'PUSH') {
    window.history.pushState(null, null, url);
  }

  return {
    routerState: rscPayload,
    cache,
  };
}

const RouterContext = createContext(null);

export function useRouter() {
  const context = use(RouterContext);
  if (context === null) {
    throw new Error('Router was not mounted');
  }
  return context;
}

function RouterProvider({ initialState }) {
  const [{ routerState }, dispatch, isTransitioning] = useActionState(
    routerReducer,
    initialState
  );

  const createDispatcher = (type) => (url) => {
    startTransition(() => {
      dispatch({ type, payload: { url } });
    });
  };

  const navigate = createDispatcher('NAVIGATE');
  const push = createDispatcher('PUSH');

  useEffect(() => {
    const handlePopState = () => navigate(window.location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <RouterContext value={{ push, isTransitioning }}>
      {routerState}
    </RouterContext>
  );
}

const initialRSCPayloadPromise = getRSCPayload(window.location.href);

export function Router() {
  const { path, rscPayload } = use(initialRSCPayloadPromise);
  const initialState = {
    routerState: rscPayload,
    cache: new Map([[path, rscPayload]]),
  };

  return (
    <ErrorBoundary>
      <RouterProvider initialState={initialState} />
    </ErrorBoundary>
  );
}
