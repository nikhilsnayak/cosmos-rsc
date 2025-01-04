import { Suspense } from 'react';

async function fetchData(id) {
  await new Promise((resolve) => setTimeout(resolve, id * 1000));
  return `Data loaded after ${id} second${id > 1 ? 's' : ''}`;
}

async function AsyncDataComponent({ id }) {
  const data = await fetchData(id);
  return (
    <div>
      <h2>Content {id}</h2>
      <p>{data}</p>
    </div>
  );
}

function LoadingCard({ id }) {
  return (
    <div>
      <h2>Content {id}</h2>
      <p>Loading...</p>
    </div>
  );
}

export default function Streaming() {
  return (
    <div>
      <h1>Streaming Demo with Server Components</h1>
      <Suspense fallback={<LoadingCard id={1} />}>
        <AsyncDataComponent id={1} />
        <Suspense fallback={<LoadingCard id={2} />}>
          <AsyncDataComponent id={2} />
          <Suspense fallback={<LoadingCard id={3} />}>
            <AsyncDataComponent id={3} />
            <Suspense fallback={<LoadingCard id={4} />}>
              <AsyncDataComponent id={4} />
              <Suspense fallback={<LoadingCard id={5} />}>
                <AsyncDataComponent id={5} />
                <Suspense fallback={<LoadingCard id={6} />}>
                  <AsyncDataComponent id={6} />
                  <Suspense fallback={<LoadingCard id={7} />}>
                    <AsyncDataComponent id={7} />
                    <Suspense fallback={<LoadingCard id={8} />}>
                      <AsyncDataComponent id={8} />
                      <Suspense fallback={<LoadingCard id={9} />}>
                        <AsyncDataComponent id={9} />
                        <Suspense fallback={<LoadingCard id={10} />}>
                          <AsyncDataComponent id={10} />
                        </Suspense>
                      </Suspense>
                    </Suspense>
                  </Suspense>
                </Suspense>
              </Suspense>
            </Suspense>
          </Suspense>
        </Suspense>
      </Suspense>
    </div>
  );
}
