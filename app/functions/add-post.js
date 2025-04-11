'use server';

import { flash } from '#cosmos-rsc/server';

export async function addPost(formData) {
  const { title, content } = Object.fromEntries(formData);

  console.log('Post:', JSON.stringify({ title, content }, null, 2));

  flash(`Post added with title: ${title}`);
}
