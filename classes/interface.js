const _ = require('lodash');

const Validator = require('../lib/validator.js');
const Logger = require('../lib/logger.js');
const { noop } = require('../lib/utils.js');

module.exports = function interfaceBaseClass(HomeNode, interfaceConfig, instanceConfig) {
  this.id = instanceConfig.id;
  this.plugin = instanceConfig.plugin;
  this.type = instanceConfig.type;
  this.name = instanceConfig.name;
  this.config = instanceConfig.config || {};

  this.logger = new Logger();
  this.logger.addPrefix(`Interface (${this.id}):`);

  /*
  Config
   */
  const userProvidedConfig = instanceConfig.config || {};
  const deviceProvidedConfig = interfaceConfig.config || {};
  const userProvidedConfigKeys = Object.keys(userProvidedConfig);
  const configGroups = _.reduce(deviceProvidedConfig, (list, propertySettings, propertyKey) => {
    if (propertySettings.required) {
      list.required.push(propertyKey);
    } else {
      list.optional.push(propertyKey);
    }
    return list;
  }, {
    required: [],
    optional: [],
  });

  Validator.validateKeys(`Interface: ${this.id}`, userProvidedConfigKeys, configGroups.required, configGroups.optional);

  this.config = _.reduce((interfaceConfig.config || {}), (computedConfig, propertySettings, propertyKey) => {
    computedConfig[propertyKey] = userProvidedConfig[propertyKey] || propertySettings['default'] || null;
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
    return HomeNode.device(instanceConfig);
  };

  return this;
};
