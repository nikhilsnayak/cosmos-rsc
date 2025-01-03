import { hydrateRoot } from 'react-dom/client';
import { Router } from './router';
import { ErrorBoundary } from './error-boundary';

hydrateRoot(
  document,
  <ErrorBoundary>
    <Router />
  </ErrorBoundary>
);
