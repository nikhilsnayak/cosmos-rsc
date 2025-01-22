'use server';

import cookies from '#cookies';

export async function logOnServer(formData) {
  const jar = cookies();
  jar.set('message', formData.get('message'), {
    domain: 'localhost',
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
  });
  console.log(Object.fromEntries(formData));
}
