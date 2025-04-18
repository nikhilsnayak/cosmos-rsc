export async function getServerFn(id, request) {
  const headers = new Headers();
  headers.append('server-function-id', id);
  headers.append('accept', 'application/json');

  const searchParams = request.searchParams.toString();

  const response = await fetch(`?${searchParams}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.json();
}
