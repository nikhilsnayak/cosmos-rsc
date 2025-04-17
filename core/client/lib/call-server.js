import { useEffect } from 'react';

let serverActionDispatcher = null;

export function useServerActionDispatcher(dispatch) {
  useEffect(() => {
    serverActionDispatcher = dispatch;
  }, [dispatch]);
}

export async function callServer(id, args) {
  if (!serverActionDispatcher) {
    throw new Error('Server action dispatcher is not set');
  }

  const { promise, resolve, reject } = Promise.withResolvers();

  serverActionDispatcher({
    type: 'SERVER_ACTION',
    payload: { id, args },
    resolve,
    reject,
  });

  return promise;
}
