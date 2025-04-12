import { useActionState, useEffect, startTransition, useCallback } from 'react';
import { RouterContext } from './index.js';
import { routerReducer } from '../../lib/router-reducer.js';
import { getFullPath } from '../../lib/utils.js';
import { FlashProvider } from '../flash-provider.js';

export function SPARouter({ initialState, initialFlashMessages }) {
  const [routerState, dispatch, isTransitioning] = useActionState(
    routerReducer,
    initialState
  );

  useEffect(() => {
    const controller = new AbortController();

    const updateTree = (tree) => {
      startTransition(() => {
        dispatch({ type: 'UPDATE', payload: { tree } });
      });
    };

    window.__cosmos_rsc = { ...window.__cosmos_rsc, updateTree };

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
      delete window.__cosmos_rsc.updateTree;
    };
  }, [dispatch]);

  const push = useCallback(
    (url) => {
      startTransition(() => {
        dispatch({ type: 'PUSH', payload: { url: getFullPath(url) } });
      });
    },
    [dispatch]
  );

  return (
    <RouterContext value={{ push, isTransitioning }}>
      <FlashProvider initialState={initialFlashMessages}>
        {routerState.tree}
      </FlashProvider>
    </RouterContext>
  );
}
