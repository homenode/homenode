const _ = require('lodash');

module.exports = function deviceBaseClass(HomeNode, id) {
  this.id = id;

  return this;
};
