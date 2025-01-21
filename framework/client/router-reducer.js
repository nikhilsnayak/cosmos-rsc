import { getRSCPayload } from './get-rsc-payload';

export async function routerReducer(prevState, action) {
  switch (action.type) {
    case 'UPDATE': {
      const { tree } = action.payload;

      const cache = new Map(prevState.cache);
      cache.set(window.location.href, action.payload);

      return { tree, cache };
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

      return { tree, cache };
    }

    case 'PUSH': {
      const { url } = action.payload;
      const tree = await getRSCPayload(url);

      const cache = new Map(prevState.cache);
      cache.set(url, tree);

      window.history.pushState(null, null, url);

      return { tree, cache };
    }

    default:
      return prevState;
  }
}
