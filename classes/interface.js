const _ = require('lodash');

module.exports = function interfaceBaseClass(HomeNode, interfaceConfig, instanceConfig) {
  this.id = instanceConfig.id;
  this.type = instanceConfig.type;
  this.name = instanceConfig.name;
  this.config = instanceConfig.config || {};

  // TODO: Validate Config
  // TODO: Apply Config Defaults

  this.startup = interfaceConfig.startup || Promise.resolve;
  this.shutdown = interfaceConfig.shutdown || Promise.resolve;

  return this;
};
