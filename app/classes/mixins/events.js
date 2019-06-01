const events = require('events');
const { safeLogString } = require('../../lib/utils.js');

/**
 * This function will extend the passed in object with a events api.
 *
 * @param obj - Object instance that is being extended
 */
module.exports = function EventsMixin(obj) {
  /**
   * Registry of all available event types
   * @type {Array}
   */
  obj.events = obj.structure.events || [];

  obj.eventEmitter = new events.EventEmitter();

  obj.triggerEvent = (eventId, payload) => {
    if (!obj.events.includes(eventId)) {
      throw new Error(`Unknown event type passed to triggerEvent(): ${eventId}`);
    }

    if (payload !== undefined) {
      obj.logger.log(`Event Triggered: (${eventId}) with payload (${safeLogString(payload)})`);
    } else {
      obj.logger.log(`Event Triggered: (${eventId})`);
    }
    obj.eventEmitter.emit(`event:${eventId}`, payload);
  };

  obj.onEvent = (eventId, cb) => {
    if (!obj.events.includes(eventId)) {
      throw new Error(`Unknown event type passed to onEvent(): ${eventId}`);
    }

    obj.eventEmitter.on(`event:${eventId}`, cb);
  };
};
