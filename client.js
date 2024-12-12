import { createRoot } from 'react-dom/client';
import { Router } from './router';
import { ErrorBoundary } from './error-boundary';

const root = createRoot(document.getElementById('root'));

root.render(
  <ErrorBoundary>
    <Router />
  </ErrorBoundary>
);
