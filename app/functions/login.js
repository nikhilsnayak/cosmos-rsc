'use server';

export async function login(prevState, formData) {
  const { email, password } = Object.fromEntries(formData);

  if (email === 'admin@gmail.com' && password === 'admin') {
    return {
      success: true,
      message: 'login successful',
      formValues: {
        email,
        password,
      },
    };
  }

  return {
    success: false,
    message: 'invalid credentials',
    formValues: {
      email,
      password,
    },
  };
}
