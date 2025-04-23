import { dispatchAppAction } from './app-dispatch';
import { getServerFn } from './get-server-fn';
import { ServerFunctionRequest } from '../../common/server-function-request';
import { APP_ACTION } from './app-action';

export function callServer(id, args) {
  if (args[0] && args[0] instanceof ServerFunctionRequest) {
    return getServerFn(id, args[0]);
  }

  const { promise, resolve, reject } = Promise.withResolvers();

  dispatchAppAction({
    type: APP_ACTION.SERVER_ACTION,
    payload: { id, args },
    resolve,
    reject,
  });

  return promise;
}
