'use client';

import { useFlash } from '#cosmos-rsc/client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function Toaster() {
  const flashMessages = useFlash();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const children = (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '350px',
        width: '100%',
      }}
    >
      {flashMessages.map((message, index) => {
        const baseStyle = {
          padding: '12px 16px',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          marginBottom: '8px',
          animation: 'slideIn 0.3s ease-out forwards',
          position: 'relative',
          overflow: 'hidden',
          color: '#fff',
          fontSize: '14px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        };

        const typeStyle =
          message.type === 'error'
            ? { backgroundColor: '#ef4444' }
            : message.type === 'success'
            ? { backgroundColor: '#10b981' }
            : message.type === 'warning'
            ? { backgroundColor: '#f59e0b' }
            : { backgroundColor: '#3b82f6' };

        return (
          <div key={index} style={{ ...baseStyle, ...typeStyle }}>
            {message.content || message}
          </div>
        );
      })}
    </div>
  );

  const animationStyle = (
    <style>
      {`
      @keyframes slideIn {
        from { 
          transform: translateX(100%);
          opacity: 0;
        }
        to { 
          transform: translateX(0);
          opacity: 1;
        }
      }
    `}
    </style>
  );

  return (
    <>
      {animationStyle}
      {createPortal(children, document.body)}
    </>
  );
}
