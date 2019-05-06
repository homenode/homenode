const _ = require('lodash');
const chalk = require('chalk');
const moment = require('moment');
const randomColor = require('randomcolor');

const DEBUG = process.env.DEBUG || false;

const formats = {
  none: chalk,
  date: chalk.bgBlackBright,
  generic: chalk.bgKeyword('darkgrey').keyword('ghostwhite'),
  system: chalk.bgKeyword('dimgrey').keyword('ghostwhite'),
  dot: chalk.bgKeyword('dimgrey').keyword('ghostwhite'),
  error: chalk.bold.redBright,
  warning: chalk.keyword('orange'),
  debug: chalk.bold.blueBright,
};

function generateFormat(value) {
  const bgColorHex = randomColor({
    seed: value,
  }).toUpperCase();

  return chalk.bgHex(bgColorHex);
}

function niceDate() {
  return formats.date(moment().format('dddd, MMMM D h:mm:ss A'));
}

function convertArrayToFormattedStrings(args) {
  return _.map(args, (thing) => {
    if (_.isObject(thing)) {
      return '\n' + JSON.stringify(thing, undefined, 2);
    }

    return thing;
  });
}

function Logger() {
  const prefixes = [];

  this.addPrefix = (value, format) => {
    const prefixFormat = format || 'generic';
    const formatter = formats[prefixFormat];
    const formatedPrefix = formatter(value);
    prefixes.push(formatedPrefix);
  };

  this.addPrefixWithDot = (value, format) => {
    const dotFormatter = generateFormat(value);
    const dotFormatedString = dotFormatter(' ');

    const prefixFormat = format || 'generic';
    const formatter = formats[prefixFormat];
    const formattedString = formatter(value);
    const formatedPrefix = dotFormatedString + formattedString;
    prefixes.push(formatedPrefix);
  };

  this.addDot = (seedValue) => {
    const formatter = generateFormat(seedValue);
    const formatedPrefix = formatter(' ');
    prefixes.push(formatedPrefix);
  };

  function log(message) {
    console.log(niceDate(), ...prefixes, message);
  }

  this.log = (...args) => {
    const convertedStrings = convertArrayToFormattedStrings(args);
    const message = formats.none(...convertedStrings);
    log(message);
  };

  this.warning = (...args) => {
    console.log(niceDate(), ...prefixes, formats.warning('WARNING:', ...args));
  };

  this.error = (...args) => {
    console.log(niceDate(), ...prefixes, formats.error('ERROR:', ...args));
  };

  this.debug = (...args) => {
    if (DEBUG) {
      console.log(niceDate(), ...prefixes, formats.debug('DEBUG:', ...args));
    }
  };

  return this;
}

// const SystemLogger = new Logger();
// SystemLogger.addPrefix('System:', 'system');
// SystemLogger.log('This is an info Message!', {thing: 'here'});
// SystemLogger.warning('This is a Warn!');
// SystemLogger.error('This is bad deal ....');
// SystemLogger.debug('This is only kinda important!');

// const SystemLogger2 = new Logger();
// SystemLogger2.addPrefix('Device');
// SystemLogger2.addDot('fake-switch');
// SystemLogger2.addPrefixWithDot('Device: fake-switch');
// SystemLogger2.log('This is an info Message!', { thing: 'here' });
// SystemLogger2.warning('This is a Warn!');
// SystemLogger2.error('This is bad deal ....');
// SystemLogger2.debug('This is only kinda important!');

module.exports = Logger;
