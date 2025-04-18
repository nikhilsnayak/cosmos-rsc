const { getAppStore } = require('./app-store');
const logger = require('./logger');

module.exports = function (...messages) {
  const { flashMessages, metadata } = getAppStore();
  if (metadata.renderPhase === 'SERVER_FUNCTION') {
    logger.error(`Cannot use flash messages in SERVER FUNCTION`);
    return;
  }
  flashMessages.push(
    ...messages.map((message) => ({
      ...message,
      id: crypto.randomUUID(),
    }))
  );
};
