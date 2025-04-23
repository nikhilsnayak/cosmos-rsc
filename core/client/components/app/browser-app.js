import { useLayoutEffect } from 'react';
import { RouterContext } from '../router-context.js';
import { FlashContext } from '../flash-context.js';
import { SlotContext } from '../slot-context.js';
import { getFullPath } from '../../lib/utils.js';
import { useAppState } from '../../lib/use-app-state.js';
import { dispatchAppAction } from '../../lib/app-dispatch.js';
import { APP_ACTION, NAVIGATION_KIND } from '../../lib/app-action.js';

export function BrowserApp({ initialState, rootLayout }) {
  const appState = useAppState(initialState);

  useLayoutEffect(() => {
    if (appState.navigationKind === NAVIGATION_KIND.ROUTER_PUSH) {
      window.history.pushState(null, null, appState.path);
    }
  }, [appState.path, appState.navigationKind]);

  const router = {
    push: (url) => {
      dispatchAppAction({
        type: APP_ACTION.ROUTER_PUSH,
        payload: { path: getFullPath(url) },
      });
    },
  };

  const flash = {
    messages: appState.flashMessages,
    remove: (id) => {
      dispatchAppAction({
        type: APP_ACTION.REMOVE_FLASH_MESSAGE,
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
