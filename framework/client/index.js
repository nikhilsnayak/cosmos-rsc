import { useActionState, useEffect, startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import {
  createFromReadableStream,
  encodeReply,
} from 'react-server-dom-webpack/client';
import { RouterContext } from './router';
import { ErrorBoundary } from './error-boundary';

function getFullPath(url) {
  const { pathname, search } = new URL(url, window.location.origin);
  return `${pathname}${search}`;
}

let updateRouterState;

async function callServer(id, args) {
  const path = getFullPath(window.location.href);

  const headers = new Headers();
  headers.append('server-function-id', id);
  headers.append('accept', 'text/x-component');

  const response = await fetch(path, {
    method: 'POST',
    headers,
    body: await encodeReply(args),
  });

  if (!response.ok) {
    throw new Error('Failed to execute server function');
  }

  const { rscPayload, serverFunctionResult } = await createFromReadableStream(
    response.body,
    {
      callServer,
    }
  );

  updateRouterState?.(rscPayload);

  return serverFunctionResult;
}

async function getRSCPayload(url) {
  const path = getFullPath(url);

  const headers = new Headers();
  headers.append('accept', 'text/x-component');

  const response = await fetch(path, { headers });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message ?? 'Failed to fetch RSC Payload');
  }
  const { rscPayload } = await createFromReadableStream(response.body, {
    callServer,
  });
  return { path, rscPayload };
}

async function routerReducer(prevState, action) {
  switch (action.type) {
    case 'UPDATE': {
      const path = getFullPath(window.location.href);
      const cache = new Map(prevState.cache);
      cache.set(path, action.payload);
      return {
        routerState: action.payload,
        cache,
      };
    }

    case 'NAVIGATE': {
      const { url } = action.payload;
      const fullPath = getFullPath(url);

      if (prevState.cache.has(fullPath)) {
        return {
          ...prevState,
          routerState: prevState.cache.get(fullPath),
        };
      }

      const { path, rscPayload } = await getRSCPayload(url);
      const cache = new Map(prevState.cache);
      cache.set(path, rscPayload);

      return {
        routerState: rscPayload,
        cache,
      };
    }

    case 'PUSH': {
      const { url } = action.payload;
      const { path, rscPayload } = await getRSCPayload(url);
      const cache = new Map(prevState.cache);
      cache.set(path, rscPayload);

      window.history.pushState(null, null, url);

      return {
        routerState: rscPayload,
        cache,
      };
    }

    default:
      return prevState;
  }
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

  updateRouterState = (routerState) => {
    startTransition(() => {
      dispatch({ type: 'UPDATE', payload: routerState });
    });
  };

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

export function Router({ routerState }) {
  const path = getFullPath(window.location.href);
  const initialState = {
    routerState,
    cache: new Map([[path, routerState]]),
  };

  return <RouterProvider initialState={initialState} />;
}

async function hydrateDocument() {
  let streamController;
  const encoder = new TextEncoder();
  const rscStream = new ReadableStream({
    start(controller) {
      let handleChunk = (chunk) => {
        if (typeof chunk === 'string') {
          controller.enqueue(encoder.encode(chunk));
        } else {
          controller.enqueue(chunk);
        }
      };
      window.__RSC_PAYLOAD ||= [];
      window.__RSC_PAYLOAD.forEach(handleChunk);
      window.__RSC_PAYLOAD.push = (chunk) => {
        handleChunk(chunk);
      };
      streamController = controller;
    },
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      streamController?.close();
    });
  } else {
    streamController?.close();
  }

  const { rscPayload, formState } = await createFromReadableStream(rscStream, {
    callServer,
  });

  hydrateRoot(
    document,
    <ErrorBoundary>
      <Router routerState={rscPayload} />
    </ErrorBoundary>,
    {
      formState,
    }
  );
}

hydrateDocument();
