const moment = require('moment-timezone');
const SolarCalc = require('solar-calc');

const hourFormat = 'h:mm a';
const dateFormat = 'MMMM D, YYYY';
const solarList = [
  'sunrise',
  'sunset',
  'civilDawn',
  'civilDusk',
  'nauticalDawn',
  'nauticalDusk',
  'astronomicalDawn',
  'astronomicalDusk',
  'solarNoon',
];

function extractTime(dateObject) {
  return moment(dateObject).format(hourFormat);
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

module.exports = function Clock() {
  /*
  Device
   */
  this.registerDevice({
    type: 'time',
    config: {
      timezone: {
        type: 'string', // Must be a valid value from: http://momentjs.com/timezone/
        required: true,
      },
      lat: {
        type: 'number',
        required: true,
      },
      long: {
        type: 'number',
        required: true,
      },
    },
    startup() {
      // Return promise
      const tz = this.getConfig('timezone');
      this.syncTrait('time', moment().tz(tz).format(hourFormat));
      this.syncTrait('date', moment().tz(tz).format(dateFormat));
    },
    events: solarList,
    polling: {
      secTick: {
        runAtStartup: true,
        secs: 1,
        silent: true,
        handler() {
          const tz = this.getConfig('timezone');
          this.syncTrait('time', moment().tz(tz).format(hourFormat));
          this.syncTrait('date', moment().tz(tz).format(dateFormat));
        },
      },
      updateSolarCalc: {
        runAtStartup: true,
        secs: 60 * 60,
        handler() { // Has to be a real function, to get the correct 'this'
          const date = this.getTrait('date').value;
          const dateObject = new Date(date);

          if (!isValidDate(dateObject)) {
            throw new Error('Invalid date');
          }

          const solar = new SolarCalc(dateObject, this.getConfig('lat'), this.getConfig('long'));

          solarList.forEach((prop) => {
            const time = extractTime(solar[prop]);
            this.syncTrait(prop, time);
          });
        },
      },
    },
    traits: {
      time: {
        type: 'string',
        history: false,
      },
      date: {
        type: 'string',
        history: false,
      },
      sunrise: {
        type: 'string',
        history: false,
      },
      sunset: {
        type: 'string',
        history: false,
      },
      civilDawn: {
        type: 'string',
        history: false,
      },
      civilDusk: {
        type: 'string',
        history: false,
      },
      nauticalDawn: {
        type: 'string',
        history: false,
      },
      nauticalDusk: {
        type: 'string',
        history: false,
      },
      astronomicalDawn: {
        type: 'string',
        history: false,
      },
      astronomicalDusk: {
        type: 'string',
        history: false,
      },
      solarNoon: {
        type: 'string',
        history: false,
      },
    },
    afterTraitChange(traitId, newTrait, oldTrait) {
      // The time trait will change once a min.
      if (traitId === 'time') {
        solarList.forEach((prop) => {
          const time = this.getTrait(prop).value;
          if (newTrait.value === time) {
            this.triggerEvent(prop);
          }
        }, this);
      }
    },
  });
};
