const _ = require('lodash');

const MAX_VOLUME = 28; // Full is 38
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

    const service = accessory.addService(Service.Television, this.name, this.name);
    const name = service.getCharacteristic(Characteristic.ConfiguredName);
    const sleepMode = service.getCharacteristic(Characteristic.SleepDiscoveryMode);
    const power = service.getCharacteristic(Characteristic.Active);
    const input = service.getCharacteristic(Characteristic.ActiveIdentifier);
    const remoteKey = service.getCharacteristic(Characteristic.RemoteKey);
    const pictureMode = service.getCharacteristic(Characteristic.PictureMode);
    const powerModeSelection = service.getCharacteristic(Characteristic.PowerModeSelection);

    // Defaults
    name.setValue(this.name);
    input.setValue(1);
    sleepMode.setValue(Characteristic.SleepDiscoveryMode.ALWAYS_DISCOVERABLE);

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
      power.updateValue(trait.value ? 1 : 0);
    });

    /**
     * Active Input
     */

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
     * Remote Key
     */

    const keyMap = {};
    keyMap[Characteristic.RemoteKey.ARROW_UP] = 'UP';
    keyMap[Characteristic.RemoteKey.ARROW_LEFT] = 'LEFT';
    keyMap[Characteristic.RemoteKey.ARROW_RIGHT] = 'RIGHT';
    keyMap[Characteristic.RemoteKey.ARROW_DOWN] = 'DOWN';
    keyMap[Characteristic.RemoteKey.BACK] = 'BACK';
    keyMap[Characteristic.RemoteKey.EXIT] = 'EXIT';
    keyMap[Characteristic.RemoteKey.INFORMATION] = 'HOME';
    keyMap[Characteristic.RemoteKey.SELECT] = 'SELECT';
    keyMap[Characteristic.RemoteKey.PLAY_PAUSE] = 'PLAY';

    remoteKey
      .on('set', (value, callback) => {
        const key = keyMap[value] || `UNKNOWN KEY ${value}`;
        this.logger.log(`Homekit key press: ${key}`);

        callback();
      });

    /**
     * Picture Mode
     */

    pictureMode
      .on('set', (value, callback) => {
        this.logger.log(`Homekit set picture mode: ${value}`);

        callback();
      });

    /**
     * Power Mode Selection
     * This is a weird name but should be used to hide/show the tv settings menu
     */

    powerModeSelection
      .on('set', (value, callback) => {

        if (value === Characteristic.PowerModeSelection.SHOW) {
          this.logger.log(`Homekit set tv settings: Show`);
        } else {
          this.logger.log(`Homekit set tv settings: Hide`);
        }

        callback();
      });

    /**
     * Speaker
     */
    const speakerService = accessory.addService(Service.TelevisionSpeaker);
    const speakerPower = speakerService.getCharacteristic(Characteristic.Active);
    const speakerMute = speakerService.getCharacteristic(Characteristic.Mute);
    const speakerVolume = speakerService.getCharacteristic(Characteristic.Volume);
    const speakerVolumeControlType = speakerService.getCharacteristic(Characteristic.VolumeControlType);
    const speakerVolumeSelector = speakerService.getCharacteristic(Characteristic.VolumeSelector);

    speakerPower.setValue(Characteristic.Active.ACTIVE);
    speakerVolumeControlType.setValue(Characteristic.VolumeControlType.ABSOLUTE);

    speakerVolumeSelector
      .on('set', (value, callback) => {
        this.logger.log(`Homekit set speaker volume selection: ${value}`);
        callback();
      });

    // Mute
    speakerMute
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
      speakerMute.updateValue(trait.value);
    });

    // Volume
    speakerVolume
      .on('set', (value, callback) => {
        this.logger.log(`Homekit set volume: ${value}`);
        this.setTrait('volume', value);
        callback();
      })
      .on('get', (callback) => {
        const value = this.getTraitValue('volume');
        callback(null, value);
      });

    this.onTraitChange('volume', (trait) => {
      speakerVolume.updateValue(trait.value);
    });

    /**
     * Inputs
     */
    const inputList = {};

    [1, 2, 3, 4, 5, 6].forEach((num) => {
      const configValue = this.getConfig(`input_${num}`);
      if (configValue) {
        inputList[num] = configValue;
      }
    });

    const inputSwitches = {};

    Object.entries(inputList).forEach(([inputNum, inputName]) => {
      this.logger.log(`Setting up homekit input for ${inputName}`);

      inputSwitches[inputNum] = accessory.addService(Service.InputSource, inputName, inputName);

      inputSwitches[inputNum]
        .setCharacteristic(Characteristic.Identifier, inputNum)
        .setCharacteristic(Characteristic.ConfiguredName, inputName)
        .setCharacteristic(Characteristic.IsConfigured, Characteristic.IsConfigured.CONFIGURED)
        .setCharacteristic(Characteristic.InputSourceType, Characteristic.InputSourceType.HDMI)
        .setCharacteristic(Characteristic.CurrentVisibilityState, Characteristic.CurrentVisibilityState.SHOWN);

      service.addLinkedService(inputSwitches[inputNum]);
    });
  },
};
