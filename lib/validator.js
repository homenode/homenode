const _ = require('lodash');

module.exports = {
  validateKeys(name, keys, required, optional) {
    const all = optional.concat(required);
    const missing = _.difference(required, keys);
    const extra = _.difference(keys, all);

    if (missing.length) {
      throw new Error(`ERROR: Missing required config properties (${missing.join(', ')}) for ${name}`);
    }

    if (extra.length) {
      throw new Error(`ERROR: Extra config properties (${extra.join(', ')}) for ${name}`);
    }
  },
};
