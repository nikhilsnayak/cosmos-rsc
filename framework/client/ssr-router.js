import { RouterContext } from '#router';

export function SSRRouter({ initialState }) {
  const push = () => {
    throw new Error('Cannot call `router.push` during SSR');
  };

  return (
    <RouterContext value={{ push, isTransitioning: false }}>
      {initialState.tree}
    </RouterContext>
  );
}
