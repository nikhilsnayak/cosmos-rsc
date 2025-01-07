const { getAppStore } = require('./app-store');

module.exports = function () {
  const { cookies } = getAppStore();

  return {
    get: function (name) {
      return cookies.get(name)?.value;
    },
    set: function (name, value, options) {
      const cookie = {
        value,
        ...options,
      };

      cookies.set(name, cookie);
    },
    remove: function (name) {
      cookies.delete(name);
    },
  };
};
