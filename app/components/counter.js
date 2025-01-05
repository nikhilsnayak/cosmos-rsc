'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => setCount((prev) => prev + 1);
  const decrement = () => setCount((prev) => prev - 1);

  return (
    <div className='flex flex-col items-center justify-center space-y-4 p-4 bg-background rounded-lg shadow-md'>
      <h2 className='text-2xl font-bold text-foreground'>Counter</h2>
      <p className='text-4xl font-semibold text-primary'>{count}</p>
      <div className='flex space-x-2'>
        <button onClick={decrement}>-</button>
        <button onClick={increment}>+</button>
      </div>
    </div>
  );
}
