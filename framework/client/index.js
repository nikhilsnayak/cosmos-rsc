import { hydrateRoot } from 'react-dom/client';
import { createFromReadableStream } from 'react-server-dom-webpack/client';
import { ErrorBoundary } from './error-boundary';
import { rscStream } from '../rsc-html-stream/client';
import { SPARouter } from './spa-router';
import { callServer } from './call-server';
import { getFullPath } from './utils';

async function hydrateDocument() {
  const { tree } = await createFromReadableStream(rscStream, {
    callServer,
  });

  const initialState = {
    tree,
    cache: new Map([[getFullPath(window.location.href), tree]]),
  };

  hydrateRoot(
    document,
    <ErrorBoundary>
      <SPARouter initialState={initialState} />
    </ErrorBoundary>
  );
}

hydrateDocument();
