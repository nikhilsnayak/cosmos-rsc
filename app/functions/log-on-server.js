'use server';

export async function logOnServer(formData) {
  console.log(Object.fromEntries(formData));
}
