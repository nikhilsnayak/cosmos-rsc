import { RouterContext } from '#cosmos-rsc/router';
import { FlashProvider } from './flash-context.js';

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
