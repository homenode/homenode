const _ = require('lodash');

const Logger = require('../lib/logger.js');
const { noop } = require('../lib/utils.js');

module.exports = function interfaceClass(Plugin, interfaceConfig, instanceConfig) {
  this.id = instanceConfig.id;
  this.plugin = instanceConfig.plugin;
  this.type = instanceConfig.type;
  this.name = instanceConfig.name;

  this.logger = new Logger();
  this.logger.addPrefix(`Interface (${this.id}):`);

  /*
  Config
   */
  const userProvidedConfig = instanceConfig.config || {};
  const interfaceProvidedConfig = interfaceConfig.config || {};

  // Fill in defaults
  this.config = _.reduce(interfaceProvidedConfig, (computedConfig, propertySettings, propertyKey) => {
    computedConfig[propertyKey] = userProvidedConfig[propertyKey] || propertySettings.default || null;
    return computedConfig;
  }, {});

  this.getConfig = (id) => {
    if (!_.has(this.config, id)) {
      throw new Error(`Unknown getConfig() key (${id})`);
    }
    return this.config[id];
  };

  this.startup = interfaceConfig.startup || noop;
  this.shutdown = interfaceConfig.shutdown || noop;

  this.device = (instanceConfig) => {
    instanceConfig.plugin = this.plugin;
    instanceConfig.interface_id = this.id;
    return Plugin.device(instanceConfig);
  };

  return this;
};
