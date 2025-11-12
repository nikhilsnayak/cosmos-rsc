import { APP_ACTION, NAVIGATION_KIND } from './app-action.js';
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
        const { tree, serverActionResult } = await postServerAction(id, args);

        resolve(serverActionResult);
        routerCache.set(path, tree);

        return {
          ...prevState,
          tree,
        };
      } catch (error) {
        reject(error);
        return prevState;
      }
    }

    default:
      return prevState;
  }
}
