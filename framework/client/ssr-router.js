import { RouterContext } from './router.js';

export function SSRRouter({ initialState }) {
  const replace = () => {
    throw new Error('Cannot call replace during SSR');
  };

  return (
    <RouterContext value={{ replace, isTransitioning: false }}>
      {initialState.tree}
    </RouterContext>
  );
}
