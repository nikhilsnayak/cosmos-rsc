import { dispatchAppAction } from './app-dispatch';

export async function callServer(id, args) {
  const { promise, resolve, reject } = Promise.withResolvers();

  dispatchAppAction({
    type: 'SERVER_ACTION',
    payload: { id, args },
    resolve,
    reject,
  });

  return promise;
}
