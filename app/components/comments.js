'use client';

import { ServerFunctionRequest } from '#cosmos-rsc';
import { useState } from 'react';

export function Comments({ getComments }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className='space-y-4'>
      <h2 className='text-2xl font-semibold text-gray-800'>Comments</h2>
      <button
        onClick={() => {
          setLoading(true);
          const request = new ServerFunctionRequest({
            searchParams: new URLSearchParams({
              commentId: '1',
            }),
          });

          getComments(request)
            .then((data) => {
              setComments(data ?? []);
            })
            .catch((error) => {
              console.error('Error fetching comments:', error);
            })
            .finally(() => {
              setLoading(false);
            });
        }}
        className='rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600 disabled:opacity-50'
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Load Comments'}
      </button>
      <ul className='space-y-2'>
        {loading ? (
          <li className='animate-pulse rounded-lg bg-gray-100 p-4'>
            Loading...
          </li>
        ) : (
          comments.map((comment) => (
            <li
              key={comment.id}
              className='rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md'
            >
              {comment.text}
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
