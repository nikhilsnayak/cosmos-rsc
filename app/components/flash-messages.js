'use client';

import { useFlash } from '#cosmos-rsc/client';
import { useEffect, useState } from 'react';

export function FlashMessages() {
  const flashMessages = useFlash();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (flashMessages.length > 0) {
      const messagesWithIds = flashMessages.map((msg) => ({
        ...msg,
        id: `${msg.message}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      }));

      setMessages((prev) => [...prev, ...messagesWithIds]);

      messagesWithIds.forEach((msg) => {
        setTimeout(() => {
          setMessages((prev) => prev.filter((m) => m.id !== msg.id));
        }, 5000);
      });
    }
  }, [flashMessages]);

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
      {messages.map((msg) => (
        <div
          key={msg.id}
          role='alert'
          className={`translate-x-0 transform rounded-lg border-l-4 p-4 opacity-100 shadow-lg transition-all delay-100 duration-300 ease-out ${getStyles(msg.type)}`}
        >
          <div className='flex items-start justify-between'>
            <span>{msg.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
