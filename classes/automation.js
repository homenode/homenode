const _ = require('lodash');

const Logger = require('../lib/logger.js');
const { noop } = require('../lib/utils.js');

module.exports = function automationBaseClass(HomeNode, instanceConfig) {
  this.id = instanceConfig.id;
  this.startup = instanceConfig.startup || noop;

  this.logger = new Logger();
  this.logger.addPrefix(`Automation (${this.id}):`);

  this.trigger = () => {
    this.logger.log('Triggered!');
    instanceConfig.trigger();
  };

  return this;
};
