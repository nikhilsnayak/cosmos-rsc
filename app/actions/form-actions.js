'use server';

import { cookies, flash } from '#cosmos-rsc/server';

export async function contactAction(formData) {
  // Simulate server processing
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');

  // Simple validation
  if (!name || !email || !message) {
    flash({ type: 'error', message: 'All fields are required' });
    return { success: false };
  }

  // Store submission timestamp in cookie
  const cookieManager = cookies();
  cookieManager.set('last_submission', new Date().toISOString(), {
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  });

  console.log('Contact form submitted:', {
    name,
    email,
    message,
  });

  // Add success flash message
  flash({
    type: 'success',
    message: `Thank you ${name}! Your message has been received.`,
  });

  return { success: true };
}
