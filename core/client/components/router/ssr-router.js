import { RouterContext } from './index.js';
import { FlashProvider } from '../flash-provider.js';
import { SlotContext } from '../slot-provider.js';

export function SSRRouter({ initialState, flashMessages, rootLayout }) {
  const push = () => {
    throw new Error('Cannot call `router.push` during SSR');
  };

  return (
    <RouterContext value={{ push, isTransitioning: false }}>
      <FlashProvider initialState={flashMessages}>
        <SlotContext value={initialState.tree}>{rootLayout}</SlotContext>
      </FlashProvider>
    </RouterContext>
  );
}
