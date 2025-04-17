import { dispatchAppAction } from './app-dispatch.js';
import { getRSCPayload } from './get-rsc-payload.js';
import { postServerAction } from './post-server-action.js';
import { getFullPath } from './utils.js';

export async function appReducer(prevState, action) {
  switch (action.type) {
    case 'UPDATE': {
      const { tree } = action.payload;

      const cache = new Map(prevState.cache);
      cache.set(getFullPath(window.location.href), tree);

      return { ...prevState, tree, cache };
    }

    case 'NAVIGATE': {
      const { url } = action.payload;

      if (prevState.cache.has(url)) {
        return {
          ...prevState,
          tree: prevState.cache.get(url),
        };
      }

      const tree = await getRSCPayload(url);
      const cache = new Map(prevState.cache);
      cache.set(url, tree);

      return { ...prevState, tree, cache };
    }

    case 'PUSH': {
      const { url } = action.payload;
      const tree = await getRSCPayload(url);

      const cache = new Map(prevState.cache);
      cache.set(url, tree);

      window.history.pushState(null, null, url);

      return { ...prevState, tree, cache };
    }

    case 'SERVER_ACTION': {
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

        const cache = new Map(prevState.cache);
        cache.set(path, tree);

        newFlashMessages.forEach((message) => {
          setTimeout(() => {
            dispatchAppAction({
              type: 'REMOVE_FLASH_MESSAGE',
              payload: { id: message.id },
            });
          }, 5000);
        });

        const flashMessages = [...prevState.flashMessages, ...newFlashMessages];

        return {
          ...prevState,
          tree,
          cache,
          flashMessages,
        };
      } catch (error) {
        reject(error);
        return prevState;
      }
    }

    case 'REMOVE_FLASH_MESSAGE': {
      const { id } = action.payload;
      const flashMessages = prevState.flashMessages.filter(
        (msg) => msg.id !== id
      );
      return { ...prevState, flashMessages };
    }

    default:
      return prevState;
  }
}
