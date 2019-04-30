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
      // Return promise
      this.setTrait('time', moment().format(hourFormat));
      this.setTrait('date', moment().format(dateFormat));
    },
    refresh() {
      // Return Promise
      this.setTrait('time', moment().format(hourFormat));
      this.setTrait('date', moment().format(dateFormat));
    },
    refreshEvery: 1,
    traits: {
      time: {
        type: 'string',
        history: false,
      },
      date: {
        type: 'string',
        history: false,
      },
    },
    afterTraitChange: (trait, traitValue) => {
      // The time trait will change once a min.
      if (trait === 'time') {
        const date = this.getTrait('date');
        const solar = new SolarCalc(new Date(date), this.getConfig('lat'), this.getConfig('long'));

        solarList.forEach((prop) => {
          const time = extractTime(solar[prop]);
          if (traitValue === time) {
            this.triggerEvent(prop);
          }
        });
      }
    },
  });
};
