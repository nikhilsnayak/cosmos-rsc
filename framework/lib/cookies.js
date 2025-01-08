const { getAppStore } = require('./app-store');

module.exports = function () {
  const { cookies } = getAppStore();

  return {
    get: function (name) {
      return (
        cookies.incoming.get(name)?.value ??
        cookies.outgoing.get(name)?.value ??
        null
      );
    },
    set: function (name, value, options) {
      const cookie = {
        value,
        ...options,
      };

      cookies.outgoing.set(name, cookie);
      cookies.incoming.delete(name);
    },
    remove: function (name) {
      cookies.delete(name);
    },
  };
};
