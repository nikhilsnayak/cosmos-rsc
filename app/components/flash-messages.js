'use client';

import { useFlash } from '#cosmos-rsc/client';

export function FlashMessages() {
  const flash = useFlash();

  const getStyles = (type) => {
    switch (type) {
      case 'error':
        return 'border-red-500 bg-red-50 text-red-800';
      case 'success':
        return 'border-green-500 bg-green-50 text-green-800';
      default:
        return 'border-blue-500 bg-blue-50 text-blue-800';
    }
  };

  return (
    <div className='fixed top-4 right-4 z-50 flex max-w-sm flex-col gap-2'>
      {flash.messages.map((msg) => (
        <div
          key={msg.id}
          role='alert'
          className={`translate-x-0 transform rounded-lg border-l-4 p-4 opacity-100 shadow-lg transition-all delay-100 duration-300 ease-out ${getStyles(msg.type)}`}
        >
          <div className='flex items-start justify-between'>
            <span>{msg.message}</span>
            <button
              className='ml-2 text-gray-500 hover:text-gray-700'
              onClick={() => flash.remove(msg.id)}
              aria-label='Close'
            >
              ❌
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
