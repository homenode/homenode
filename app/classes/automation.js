const _ = require('lodash');

const Logger = require('../lib/logger.js');
const { noop } = require('../lib/utils.js');

module.exports = function automationClass(HomeNode, instanceConfig) {
  this.id = instanceConfig.id;
  this.startup = instanceConfig.startup || noop;

  this.logger = new Logger();
  this.logger.addPrefix(`Automation (${this.id}):`);

  this.trigger = () => {
    this.logger.log('Triggered!');
    try {
      instanceConfig.trigger();
    } catch (e) {
      this.logger.error('Crashed with error: ', e, e.stack || '');
    }
  };

  return this;
};
