const { noop } = require('../lib/utils.js');

const LoggingMixin = require('./mixins/logging.js');

module.exports = function automationClass(HomeNode, instanceConfig) {
  this.id = instanceConfig.id;
  this.startup = instanceConfig.startup || noop;

  LoggingMixin(this, 'Automation');

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
