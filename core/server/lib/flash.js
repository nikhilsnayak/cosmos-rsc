const { getAppStore } = require('./app-store');

module.exports = function (...messages) {
  const { flashMessages } = getAppStore();
  flashMessages.push(
    ...messages.map((message) => ({
      ...message,
      id: crypto.randomUUID(),
    }))
  );
};
