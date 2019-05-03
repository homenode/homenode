const _ = require('lodash');

const noop = () => {};
const noopPromise = () => Promise.resolve();

module.exports = function automationBaseClass(HomeNode, instanceConfig) {
  this.id = instanceConfig.id;
  this.startup = instanceConfig.startup || noop;

  this.trigger = () => {
    console.log(`System - Automation (${this.id}) triggered`);
    instanceConfig.trigger();
  };

  return this;
};
