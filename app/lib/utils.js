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
  forceType(type, value) {
    if (type === 'boolean') {
      if (!_.isBoolean(value)) {
        if (_.isString(value) && value.toLowerCase() === 'true') {
          return true;
        } else if (_.isString(value) && value.toLowerCase() === 'false') {
          return false;
        } else {
          return !!value;
        }
      }
    } else if (type === 'integer') {
      return parseInt(value);
    } else if (type === 'number') {
      return parseFloat(value);
    } else if (type === 'string') {
      return String(value);
    }

    return value;
  },
};
