import { RouterContext } from './index.js';
import { FlashProvider } from '../flash-provider.js';

export function SSRRouter({ initialState }) {
  const push = () => {
    throw new Error('Cannot call `router.push` during SSR');
  };

  return (
    <RouterContext value={{ push, isTransitioning: false }}>
      <FlashProvider initialState={initialState.flashMessages}>
        {initialState.tree}
      </FlashProvider>
    </RouterContext>
  );
}
