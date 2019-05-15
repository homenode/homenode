const _ = require('lodash');

module.exports = {
  noop: () => {
  },
  noopPromise: () => Promise.resolve(),
  safeLogString: (payload) => {
    if (_.isObject(payload)) {
      return '\n' + JSON.stringify(payload, undefined, 2);
    }

    return payload;
  },
};
