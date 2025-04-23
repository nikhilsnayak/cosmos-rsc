import { APP_ACTION, NAVIGATION_KIND } from './app-action.js';
import { dispatchAppAction } from './app-dispatch.js';
import { getRSCPayload } from './get-rsc-payload.js';
import { postServerAction } from './post-server-action.js';
import { routerCache } from './router-cache.js';
import { getFullPath } from './utils.js';

export async function appReducer(prevState, action) {
  switch (action.type) {
    case APP_ACTION.BROWSER_NAVIGATION: {
      const { path } = action.payload;

      if (routerCache.has(path)) {
        return {
          ...prevState,
          tree: routerCache.get(path),
        };
      }

      const tree = await getRSCPayload(path);
      routerCache.set(path, tree);

      return {
        ...prevState,
        tree,
        path,
        navigationKind: NAVIGATION_KIND.BROWSER_NAVIGATION,
      };
    }

    case APP_ACTION.ROUTER_PUSH: {
      const { path } = action.payload;
      const tree = await getRSCPayload(path);
      routerCache.set(path, tree);

      return {
        ...prevState,
        tree,
        path,
        navigationKind: NAVIGATION_KIND.ROUTER_PUSH,
      };
    }

    case APP_ACTION.SERVER_ACTION: {
      const { id, args } = action.payload;
      const { resolve, reject } = action;

      const path = getFullPath(window.location.href);
      try {
        const {
          tree,
          serverActionResult,
          flashMessages: newFlashMessages,
        } = await postServerAction(id, args);

        resolve(serverActionResult);
        routerCache.set(path, tree);
        newFlashMessages.forEach((message) => {
          setTimeout(() => {
            dispatchAppAction({
              type: APP_ACTION.REMOVE_FLASH_MESSAGE,
              payload: { id: message.id },
            });
          }, 5000);
        });

        const flashMessages = [...prevState.flashMessages, ...newFlashMessages];

        return {
          ...prevState,
          tree,
          flashMessages,
        };
      } catch (error) {
        reject(error);
        return prevState;
      }
    }

    case APP_ACTION.REMOVE_FLASH_MESSAGE: {
      const { id } = action.payload;
      const flashMessages = prevState.flashMessages.filter((msg) => {
        return msg.id !== id;
      });
      return { ...prevState, flashMessages };
    }

    default:
      return prevState;
  }
}
