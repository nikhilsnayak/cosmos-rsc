import { RouterContext } from '../router-context.js';
import { FlashContext } from '../flash-context.js';
import { SlotContext } from '../slot-context.js';
import { getFullPath } from '../../lib/utils.js';
import { useAppState } from '../../lib/use-app-state.js';
import { dispatchAppAction } from '../../lib/app-dispatch.js';

export function BrowserApp({ initialState, rootLayout }) {
  const appState = useAppState(initialState);

  const router = {
    push: (url) => {
      dispatchAppAction({ type: 'PUSH', payload: { url: getFullPath(url) } });
    },
  };

  const flash = {
    messages: appState.flashMessages,
    remove: (id) => {
      dispatchAppAction({
        type: 'REMOVE_FLASH_MESSAGE',
        payload: { id },
      });
    },
  };

  return (
    <RouterContext value={router}>
      <FlashContext value={flash}>
        <SlotContext value={appState.tree}>{rootLayout}</SlotContext>
      </FlashContext>
    </RouterContext>
  );
}
