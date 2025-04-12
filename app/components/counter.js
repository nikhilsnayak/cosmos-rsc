'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);

  return (
    <div className='bg-background flex flex-col items-center justify-center space-y-4 rounded-lg p-4 shadow-md'>
      <h2 className='text-foreground text-2xl font-bold'>Counter</h2>
      <p className='text-primary text-4xl font-semibold'>{count}</p>
      <div className='flex space-x-2'>
        <button onClick={decrement}>-</button>
        <button onClick={increment}>+</button>
      </div>
    </div>
  );
}
