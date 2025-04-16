import { RouterContext } from '../router-context.js';
import { FlashContext } from '../flash-context.js';
import { SlotContext } from '../slot-context.js';

export function SSRApp({ initialState, rootLayout }) {
  const push = () => {
    throw new Error('Cannot call `router.push` during SSR');
  };

  return (
    <RouterContext value={{ push }}>
      <FlashContext value={initialState.flashMessages}>
        <SlotContext value={initialState.tree}>{rootLayout}</SlotContext>
      </FlashContext>
    </RouterContext>
  );
}
