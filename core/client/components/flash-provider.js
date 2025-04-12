import { createContext, use, useEffect, useState } from 'react';

const FlashContext = createContext(null);

export function FlashProvider({ children, initialState }) {
  const [flashMessages, setFlashMessages] = useState(initialState ?? []);

  useEffect(() => {
    const timeoutIds = [];

    const addTimeouts = (messages) => {
      messages.forEach((message) => {
        const id = setTimeout(() => {
          setFlashMessages((prevMessages) =>
            prevMessages.filter((m) => m !== message)
          );
        }, 5000);
        timeoutIds.push(id);
      });
    };

    const flash = (...messages) => {
      addTimeouts(messages);
      setFlashMessages((prevMessages) => {
        return [...prevMessages, ...messages];
      });
    };

    window.__cosmos_rsc = { ...window.__cosmos_rsc, flash };

    addTimeouts(initialState);

    return () => {
      delete window.__cosmos_rsc.flash;
      timeoutIds.forEach(clearTimeout);
    };
  }, [initialState]);

  return <FlashContext value={flashMessages}>{children}</FlashContext>;
}

export function useFlash() {
  const context = use(FlashContext);
  if (context === null) {
    throw new Error('FlashContext was not mounted');
  }
  return context;
}
