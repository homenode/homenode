const { safeLogString } = require('../../lib/utils.js');

/**
 * This function will extend the passed in object with a commands api.
 *
 * @param obj - Object instance that is being extended
 */
module.exports = function CommandsMixin(obj) {
  /**
   * Registry of all available commands
   * @type {Array}
   */
  obj.commands = obj.structure.commands || {};

  obj.command = (name, payload) => {
    if (!obj.commands[name]) {
      throw new Error(`Unknown command name passed to command(): ${name}`);
    }

    if (payload !== undefined) {
      obj.logger.log(`Command Triggered: (${name}) with payload (${safeLogString(payload).trim()})`);
    } else {
      obj.logger.log(`Command Triggered: (${name})`);
    }

    try {
      return obj.commands[name].handler.call(obj, payload);
    } catch (err) {
      obj.logger.error(`Command (${name}) crashed with error: `, err.stack || err);
    }
  };
};
