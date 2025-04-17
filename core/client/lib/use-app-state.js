import { startTransition, useActionState, useEffect } from 'react';
import { appReducer } from './app-reducer.js';
import { getFullPath } from './utils.js';
import { useAppDispatch } from './app-dispatch.js';

export function useAppState(initialState) {
  const [appState, dispatch] = useActionState(appReducer, initialState);

  useAppDispatch(dispatch);

  useEffect(() => {
    const handlePopState = () => {
      startTransition(() => {
        dispatch({
          type: 'NAVIGATE',
          payload: { url: getFullPath(window.location.href) },
        });
      });
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    initialState.flashMessages.forEach((message) => {
      setTimeout(() => {
        startTransition(() => {
          dispatch({
            type: 'REMOVE_FLASH_MESSAGE',
            payload: { id: message.id },
          });
        });
      }, 5000);
    });
  }, [initialState.flashMessages]);

  return appState;
}
