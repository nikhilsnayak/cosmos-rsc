import { hydrateRoot } from 'react-dom/client';
import { createFromReadableStream } from 'react-server-dom-webpack/client';
import { ErrorBoundary } from './components/error-boundary';
import { rscStream } from '../rsc-html-stream/client';
import { SPARouter } from './components/router/spa-router';
import { callServer } from './lib/call-server';
import { getFullPath } from './lib/utils';

async function hydrateDocument() {
  const { tree, formState, flashMessages } = await createFromReadableStream(
    rscStream,
    {
      callServer,
    }
  );

  const initialState = {
    tree,
    cache: new Map([[getFullPath(window.location.href), tree]]),
  };

  hydrateRoot(
    document,
    <ErrorBoundary>
      <SPARouter
        initialState={initialState}
        initialFlashMessages={flashMessages}
      />
    </ErrorBoundary>,
    {
      formState,
    }
  );
}

hydrateDocument();
