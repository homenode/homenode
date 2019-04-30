// TODO: Finish building this module, here is some code to use.... or not.

this.log = function _log() {
  const args = [].slice.apply(arguments);
  args.unshift(`INFO: ${pluginSlug}:`);
  console.log.apply(this, args);
};

this.error = function _logError() {
  const args = [].slice.apply(arguments);
  args.unshift(`ERROR: ${pluginSlug}:`);
  console.log.apply(this, args);
};

this.debug = function _logDebug() {
  if (this.debug) {
    const args = [].slice.apply(arguments);
    args.unshift(`DEBUG: ${pluginSlug}:`);
    console.log.apply(this, args);
  }
};

this.throw = function _logThrow() {
  this.error.apply(this, arguments);
  throw new Error('Plugin Error!');
};
