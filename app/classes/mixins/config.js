const _ = require('lodash');

/**
 * This function will extend the passed in object with a config api.
 *
 * @param obj - Object instance that is being extended
 */
module.exports = function ConfigMixin(obj) {
  const userProvidedConfig = obj.options.config || {};
  const pluginProvidedConfig = obj.structure.config || {};

  // Fill in defaults
  obj.config = _.reduce(pluginProvidedConfig, (computedConfig, propertySettings, propertyKey) => {
    computedConfig[propertyKey] = userProvidedConfig[propertyKey] || propertySettings.default || null;
    return computedConfig;
  }, {});

  obj.getConfig = (id) => {
    if (!_.has(obj.config, id)) {
      throw new Error(`Unknown getConfig() key (${id})`);
    }
    return obj.config[id];
  };
};
