import {
  createFromReadableStream,
  encodeReply,
} from 'react-server-dom-webpack/client';
import { getFullPath } from './utils.js';

export async function callServer(id, args) {
  const headers = new Headers();
  headers.append('server-function-id', id);
  headers.append('accept', 'text/x-component');

  const response = await fetch(getFullPath(window.location.href), {
    method: 'POST',
    headers,
    body: await encodeReply(args),
  });

  if (!response.ok) {
    throw new Error('Failed to execute server function');
  }

  const { serverFunctionResult } = await createFromReadableStream(
    response.body,
    {
      callServer,
    }
  );

  return serverFunctionResult;
}
