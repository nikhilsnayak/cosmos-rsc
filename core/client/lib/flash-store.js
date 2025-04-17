import { useSyncExternalStore } from 'react';

function createFlashStore(initialMessages) {
  const subscribers = new Set();
  const timeouts = new Map();
  let messages = initialMessages;
  return {
    subscribe(callback) {
      subscribers.add(callback);
      return () => {
        subscribers.delete(callback);
      };
    },
    getSnapshot() {
      return messages;
    },
    getServerSnapshot() {
      return messages;
    },
    push(...newMessages) {
      if (newMessages.length === 0) return;
      const messagesWithIds = newMessages.map((msg) => ({
        ...msg,
        id: `${msg.message}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      }));

      messages = [...messages, ...messagesWithIds];
      this.notify();

      messagesWithIds.forEach((msg) => {
        const timerId = setTimeout(() => {
          this.remove(msg.id);
        }, 5000);
        timeouts.set(msg.id, timerId);
      });
    },
    remove(id) {
      if (timeouts.has(id)) {
        clearTimeout(timeouts.get(id));
        timeouts.delete(id);
      }
      messages = messages.filter((m) => m.id !== id);
      this.notify();
    },
    notify() {
      subscribers.forEach((subscriber) => subscriber());
    },
  };
}

export const flashStore = createFlashStore();

export function useFlashStore() {
  const flashMessages = useSyncExternalStore(
    flashStore.subscribe,
    flashStore.getSnapshot,
    flashStore.getServerSnapshot
  );

  const removeMessage = (id) => {
    flashStore.remove(id);
  };

  return { flashMessages, removeMessage };
}
