import { useActionState, useEffect, startTransition, useCallback } from 'react';
import { RouterContext } from '#router';
import { routerReducer } from './router-reducer';
import { getFullPath } from './utils';

export function SPARouter({ initialState }) {
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

    window.__cosmos_rsc = { updateTree };

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
      window.__cosmos_rsc = null;
    };
  }, []);

  const push = useCallback((url) => {
    startTransition(() => {
      dispatch({ type: 'PUSH', payload: { url: getFullPath(url) } });
    });
  }, []);

  return (
    <RouterContext value={{ push, isTransitioning }}>
      {routerState.tree}
    </RouterContext>
  );
}
