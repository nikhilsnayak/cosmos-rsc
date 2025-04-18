'use server';

import { ServerFunctionResponse } from '#cosmos-rsc';

export async function getComments(request) {
  console.log({ searchParams: request.searchParams.toString() });

  await new Promise((resolve) => setTimeout(resolve, 5000));

  return new ServerFunctionResponse({
    json: [
      { id: 1, text: 'This is the first comment' },
      { id: 2, text: 'This is the second comment' },
      { id: 3, text: 'This is the third comment' },
    ],
  });
}
