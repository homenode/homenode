const Logger = require('../../lib/logger.js');

/**
 * This function will extend the passed in object with a logging api.
 *
 * @param obj - Object instance that is being extended
 */
module.exports = function LoggingMixin(obj, prefix) {
  obj.logger = new Logger();
  obj.logger.addPrefix(`${prefix} (${obj.id}):`);
};
