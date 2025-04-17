import { RouterContext } from '../router-context.js';
import { FlashContext } from '../flash-context.js';
import { SlotContext } from '../slot-context.js';

export function SSRApp({ initialState, rootLayout }) {
  const router = {
    push: () => {
      throw new Error('Cannot call `router.push` during SSR');
    },
  };

  const flash = {
    messages: initialState.flashMessages,
    remove: () => {
      throw new Error('Cannot call `flash.remove` during SSR');
    },
  };

  return (
    <RouterContext value={router}>
      <FlashContext value={flash}>
        <SlotContext value={initialState.tree}>{rootLayout}</SlotContext>
      </FlashContext>
    </RouterContext>
  );
}
