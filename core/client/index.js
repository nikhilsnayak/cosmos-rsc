import { hydrateRoot } from 'react-dom/client';
import { createFromReadableStream } from 'react-server-dom-webpack/client';
import { ErrorBoundary } from './components/error-boundary';
import { rscStream } from '../rsc-html-stream/client';
import { BrowserApp } from './components/app/browser-app';
import { callServer } from './lib/call-server';
import { getFullPath } from './lib/utils';
import { StrictMode } from 'react';

async function hydrateDocument() {
  const { rootLayout, tree, formState, flashMessages } =
    await createFromReadableStream(rscStream, {
      callServer,
    });

  const initialState = {
    tree,
    flashMessages,
    cache: new Map([[getFullPath(window.location.href), tree]]),
  };

  const app = (
    <StrictMode>
      <ErrorBoundary>
        <BrowserApp rootLayout={rootLayout} initialState={initialState} />
      </ErrorBoundary>
    </StrictMode>
  );

  hydrateRoot(document, app, {
    formState,
  });
}

hydrateDocument();
