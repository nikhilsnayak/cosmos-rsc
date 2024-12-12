'use client';

import { test } from '../actions/test';

export function TestForm() {
  return (
    <form
      action={async (formData) => {
        const result = await test(formData);
        console.log(result);
      }}
    >
      <input type='text' name='name' />
      <button type='submit'>submit</button>
    </form>
  );
}
