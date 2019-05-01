const moment = require('moment');
const SolarCalc = require('solar-calc');

const hourFormat = 'hh:mm a';
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

module.exports = function Clock() {
  /*
  Interface
   */
  this.registerInterface({
    type: 'clock-service',
    startup() {
      console.log(`In the startup method of ${this.name} id: ${this.id}`);

      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), 500);
      });
    },
  });

  /*
  Device
   */
  this.registerDevice({
    type: 'time',
    interface: 'clock-service',
    config: {
      lat: {
        type: 'float',
        required: true,
      },
      long: {
        type: 'float',
        required: true,
      },
    },
    startup() {
      console.log('In the startup method of the clock device');
      // Return promise
      this.setTrait('time', moment().format(hourFormat));
      this.setTrait('date', moment().format(dateFormat));

      return new Promise((resolve, reject) => {
        setTimeout(() => resolve(), 500);
      });
    },
    polling: {
      secTick: {
        secs: 1,
        silent: true,
        handler: function () {
          this.setTrait('time', moment().format(hourFormat));
          this.setTrait('date', moment().format(dateFormat));
        },
      },
      updateSolarCalc: {
        runAtStartup: true,
        secs: 60 * 60,
        handler: function () { // Has to be a real function, to get the correct 'this'
          const date = this.getTrait('date');
          const solar = new SolarCalc(new Date(date), this.getConfig('lat'), this.getConfig('long'));

          solarList.forEach((prop) => {
            const time = extractTime(solar[prop]);
            this.setTrait(prop, time);
          });

          //console.log(this.traits);

          // return new Promise((resolve, reject) => {
          //   setTimeout(() => resolve(), 3000);
          // });
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
    afterTraitChange: (trait, traitValue) => {
      // The time trait will change once a min.
      if (trait === 'time') {
        solarList.forEach((prop) => {
          const time = this.getTrait(prop);
          if (traitValue === time) {
            this.triggerEvent(prop);
          }
        });
      }
    },
  });
};
