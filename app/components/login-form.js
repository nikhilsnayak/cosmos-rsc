'use client';

import { useActionState } from 'react';

export function LoginForm({ action }) {
  const [state, formAction] = useActionState(action, null);

  return (
    <section>
      <h2>
        Login Form with <code>useActionState</code> Progressive Enhancement
      </h2>
      <p>{state?.message}</p>
      <form action={formAction}>
        <label>
          <span>Email</span>
          <input
            type='email'
            name='email'
            defaultValue={state?.formValues?.email}
          />
        </label>
        <label>
          <span>Password</span>
          <input
            type='password'
            name='password'
            defaultValue={state?.formValues?.password}
          />
        </label>
        <button type='submit'>Login</button>
      </form>
    </section>
  );
}
