const inherits = require('util').inherits;
const _ = require('lodash');

const MAX_VOLUME = 28; // Full is 38
const MIN_VOLUME = 28; // Full is 38
const MAX_TREBLE = 7;
const MIN_TREBLE = -7;
const MAX_BASS = 7;
const MIN_BASS = -7;

function fillZeros(level) {
  if (level < 10) {
    level = `0${level}`;
  }

  return level;
}

module.exports = {
  type: 'zone',
  interface: 'dax-amp',
  config: {
    amp: {
      type: 'integer',
      required: true,
    },
    zone: {
      type: 'integer',
      required: true,
    },
    input_1: {
      type: 'string',
      default: '',
    },
    input_2: {
      type: 'string',
      default: '',
    },
    input_3: {
      type: 'string',
      default: '',
    },
    input_4: {
      type: 'string',
      default: '',
    },
    input_5: {
      type: 'string',
      default: '',
    },
    input_6: {
      type: 'string',
      default: '',
    },
  },
  traits: {
    power: {
      type: 'boolean',
      default: false,
    },
    input: {
      type: 'integer',
      default: 1,
    },
    mute: {
      type: 'boolean',
      default: false,
    },
    volume: {
      type: 'integer',
      default: 8,
    },
    treble: {
      type: 'integer',
      default: 0,
    },
    bass: {
      type: 'integer',
      default: 0,
    },
  },
  events: [
    'on',
    'off',
  ],
  commands: {
    send: {
      handler(data) {
        const amp = this.getConfig('amp');
        const zone = this.getConfig('zone');
        return this.interface.command('send', `<${amp}${zone}${data}` + '\r\n');
      },
    },
    volumeUp: {
      handler() {
        const level = _.toInteger(this.getTraitValue('volume')) + 1;
        this.setTrait('volume', level);
      },
    },
    volumeDown: {
      handler() {
        const level = _.toInteger(this.getTraitValue('volume')) - 1;
        this.setTrait('volume', level);
      },
    },
    trebleUp: {
      handler() {
        const level = _.toInteger(this.getTraitValue('treble')) + 1;
        this.setTrait('treble', level);
      },
    },
    trebleDown: {
      handler() {
        const level = _.toInteger(this.getTraitValue('treble')) - 1;
        this.setTrait('treble', level);
      },
    },
    bassUp: {
      handler() {
        const level = _.toInteger(this.getTraitValue('bass')) + 1;
        this.setTrait('bass', level);
      },
    },
    bassDown: {
      handler() {
        const level = _.toInteger(this.getTraitValue('bass')) - 1;
        this.setTrait('bass', level);
      },
    },
  },
  handleTraitChange(traitId, value) {
    return new Promise((resolve, reject) => {
      if (traitId === 'power') {
        if (value) {
          this.command('send', 'PR01');
        } else {
          this.command('send', 'PR00');
        }
        resolve();
      } else if (traitId === 'mute') {
        if (value) {
          this.command('send', 'MU01');
        } else {
          this.command('send', 'MU00');
        }
        resolve();
      } else if (traitId === 'input') {
        const channel = _.toInteger(value);
        if (channel <= 6 && channel >= 1) {
          this.command('send', `CH0${channel}`);
          resolve();
        } else {
          reject(`Invalid input value (${channel}) passed to setTrait`);
        }
      } else if (traitId === 'volume') {
        let level = _.toInteger(value);

        if (level <= MAX_VOLUME && level >= 0) {
          level = fillZeros(level);
          this.command('send', `VO${level}`);
          resolve();
        } else {
          reject(`Invalid volume value (${level}) passed to setTrait`);
        }
      } else if (traitId === 'treble') {
        let level = _.toInteger(value);

        if (level <= MAX_TREBLE && level >= MIN_TREBLE) {
          // Correct the level before syncing to amp
          level = level + 7;
          level = fillZeros(level);
          this.command('send', `TR${level}`);
          resolve();
        } else {
          reject(`Invalid treble value (${level}) passed to setTrait`);
        }
      } else if (traitId === 'bass') {
        let level = _.toInteger(value);

        if (level <= MAX_BASS && level >= MIN_BASS) {
          // Correct the level before syncing to amp
          level = level + 7;
          level = fillZeros(level);
          this.command('send', `BS${level}`);
          resolve();
        } else {
          reject(`Invalid bass value (${level}) passed to setTrait`);
        }
      } else {
        reject(`Unhandled trait change on (${traitId})`);
      }
    });
  },
  afterTraitChange(traitId, newTrait, oldTrait) {
    switch (traitId) {
      case 'power':
        if (newTrait.value === true && oldTrait.value === false) {
          this.triggerEvent('on');
        } else if (newTrait.value === false && oldTrait.value === true) {
          this.triggerEvent('off');
        }
        break;
    }
  },
  homekit(accessory, HomeKit) {
    const { Service, Characteristic } = HomeKit;

    /**
     * Treble Characteristic
     */
    Characteristic.Treble = function() {
      Characteristic.call(this, 'Treble', '00000119-0000-1000-8000-0026BB965291');
      this.setProps({
        format: Characteristic.Formats.UINT8,
        maxValue: MAX_TREBLE,
        minValue: MIN_TREBLE,
        minStep: 1,
        perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY],
      });
      this.value = this.getDefaultValue();
    };

    inherits(Characteristic.Treble, Characteristic);

    Characteristic.Treble.UUID = '00000119-0000-1000-8000-0026BB965291';

    /**
     * Bass Characteristic
     */
    Characteristic.Bass = function() {
      Characteristic.call(this, 'Bass', '00000119-0000-1000-9010-0026BB965291');
      this.setProps({
        format: Characteristic.Formats.UINT8,
        maxValue: MAX_BASS,
        minValue: MIN_BASS,
        minStep: 1,
        perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY],
      });
      this.value = this.getDefaultValue();
    };

    inherits(Characteristic.Bass, Characteristic);

    Characteristic.Bass.UUID = '00000119-0000-1000-9010-0026BB965291';

    /**
     * Input Characteristic
     */
    Characteristic.Input = function() {
      Characteristic.call(this, 'Input', '00000119-0000-1000-8000-0026AB965291');
      this.setProps({
        format: Characteristic.Formats.UINT8,
        maxValue: 6,
        minValue: 1,
        minStep: 1,
        perms: [Characteristic.Perms.READ, Characteristic.Perms.WRITE, Characteristic.Perms.NOTIFY],
      });
      this.value = this.getDefaultValue();
    };

    inherits(Characteristic.Input, Characteristic);

    Characteristic.Input.UUID = '00000119-0000-1000-8000-0026AB965291';

    /**
     * Input Name Characteristic
     */
    Characteristic.CurrentInput = function() {
      Characteristic.call(this, 'Current Input', '00000129-0000-1000-8000-0029AB965291');
      this.setProps({
        format: Characteristic.Formats.STRING,
        perms: [Characteristic.Perms.READ, Characteristic.Perms.NOTIFY],
      });
      this.value = this.getDefaultValue();
    };

    inherits(Characteristic.CurrentInput, Characteristic);

    Characteristic.CurrentInput.UUID = '00000129-0000-1000-8000-0029AB965291';

    const service = accessory.addService(Service.Switch, this.name);
    const power = service.getCharacteristic(Characteristic.On);
    const mute = service.getCharacteristic(Characteristic.Mute);
    const volume = service.getCharacteristic(Characteristic.Volume);
    const input = service.getCharacteristic(Characteristic.Input);
    const currentInput = service.getCharacteristic(Characteristic.CurrentInput);
    const treble = service.getCharacteristic(Characteristic.Treble);
    const bass = service.getCharacteristic(Characteristic.Bass);

    /**
     * Power
     */

    power
      .on('set', (value, callback) => {
        this.logger.log(`Homekit set power: ${!!value}`);
        this.setTrait('power', !!value);
        callback();
      })
      .on('get', (callback) => {
        const value = this.getTraitValue('power');
        callback(null, value);
      });

    this.onTraitChange('power', (trait) => {
      power.updateValue(trait.value);
    });

    /**
     * Mute
     */

    mute
      .on('set', (value, callback) => {
        this.logger.log(`Homekit set mute: ${value}`);
        this.setTrait('mute', value);
        callback();
      })
      .on('get', (callback) => {
        const value = this.getTraitValue('mute');
        callback(null, value);
      });

    this.onTraitChange('mute', (trait) => {
      mute.updateValue(trait.value);
    });

    /**
     * Volume
     */

    volume
      .on('set', (value, callback) => {
        this.logger.log(`Homekit set volume: ${value}`);
        const vol = Math.round(MAX_VOLUME * (value / 100));
        this.setTrait('volume', vol);
        callback();
      })
      .on('get', (callback) => {
        const value = this.getTraitValue('volume');
        callback(null, value);
      });

    this.onTraitChange('volume', (trait) => {
      const perct = Math.round(trait.value / MAX_VOLUME * 100);
      volume.updateValue(perct);
    });

    /**
     * Treble
     */

    treble
      .on('set', (value, callback) => {
        this.logger.log(`Homekit set treble: ${value}`);
        this.setTrait('treble', value);
        callback();
      })
      .on('get', (callback) => {
        const value = this.getTraitValue('treble');
        callback(null, value);
      });

    this.onTraitChange('treble', (trait) => {
      treble.updateValue(trait.value);
    });

    /**
     * Bass
     */

    bass
      .on('set', (value, callback) => {
        this.logger.log(`Homekit set bass: ${value}`);
        this.setTrait('bass', value);
        callback();
      })
      .on('get', (callback) => {
        const value = this.getTraitValue('bass');
        callback(null, value);
      });

    this.onTraitChange('bass', (trait) => {
      bass.updateValue(trait.value);
    });

    /**
     * Input
     */

    const inputList = {};

    [1, 2, 3, 4, 5, 6].forEach((num) => {
      const configValue = this.getConfig(`input_${num}`);
      if (configValue) {
        inputList[num] = configValue;
      }
    });

    input
      .on('set', (value, callback) => {
        this.logger.log(`Homekit set input: ${value}`);
        this.setTrait('input', value);
        callback();
      })
      .on('get', (callback) => {
        const value = this.getTraitValue('input');
        callback(null, value);
      });

    this.onTraitChange('input', (trait) => {
      input.updateValue(trait.value);
    });

    /**
     * Current Input
     */
    currentInput
      .on('set', (value, callback) => {
        this.logger.error(`Can not call set on CurrentInput: ${value}`);
        callback();
      })
      .on('get', (callback) => {
        const value = this.getTraitValue('input');
        callback(null, inputList[value]);
      });

    // When the input changes, update the current input display
    this.onTraitChange('input', (trait) => {
      currentInput.updateValue(inputList[trait.value]);
    });

  },
};
