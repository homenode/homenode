/**
 * This function will extend the passed in object with a polling api.
 *
 * @param obj - Object instance that is being extended
 */
module.exports = function PollingMixin(obj) {
  obj.polling = obj.structure.polling || {};

  obj.runPoll = (id) => {
    const poll = obj.polling[id];
    if (!poll.silent) {
      obj.logger.log(`Running poll (${id})`);
    }
    return obj.polling[id].handler.call(obj);
  };
};
