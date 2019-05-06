const _ = require('lodash');

const Logger = require('../lib/logger.js');
const { noop } = require('../lib/utils.js');

module.exports = function interfaceBaseClass(HomeNode, interfaceConfig, instanceConfig) {
  this.id = instanceConfig.id;
  this.type = instanceConfig.type;
  this.name = instanceConfig.name;
  this.config = instanceConfig.config || {};

  this.logger = new Logger();
  this.logger.addPrefix(`Interface (${this.id}):`);

  // TODO: Validate Config
  // TODO: Apply Config Defaults

  this.startup = interfaceConfig.startup || noop;
  this.shutdown = interfaceConfig.shutdown || noop;

  return this;
};
