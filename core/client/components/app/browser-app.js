import { useActionState, useEffect, startTransition } from 'react';
import { RouterContext } from '../router-context.js';
import { FlashContext } from '../flash-context.js';
import { SlotContext } from '../slot-context.js';
import { appReducer } from '../../lib/app-reducer.js';
import { getFullPath } from '../../lib/utils.js';
import { useServerActionDispatcher } from '../../lib/call-server.js';

export function BrowserApp({ initialState, rootLayout }) {
  const [appState, dispatch] = useActionState(appReducer, initialState);

  useServerActionDispatcher(dispatch);

  useEffect(() => {
    const controller = new AbortController();

    const handlePopState = () => {
      startTransition(() => {
        dispatch({
          type: 'NAVIGATE',
          payload: { url: getFullPath(window.location.href) },
        });
      });
    };

    window.addEventListener('popstate', handlePopState, {
      signal: controller.signal,
    });

    return () => {
      controller.abort();
    };
  }, [dispatch]);

  const push = (url) => {
    startTransition(() => {
      dispatch({ type: 'PUSH', payload: { url: getFullPath(url) } });
    });
  };

  return (
    <RouterContext value={{ push }}>
      <FlashContext value={appState.flashMessages}>
        <SlotContext value={appState.tree}>{rootLayout}</SlotContext>
      </FlashContext>
    </RouterContext>
  );
}
