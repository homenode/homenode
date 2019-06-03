module.exports = {
  type: 'speaker',
  traits: {
    power: {
      type: 'boolean',
      default: false,
    },
    mute: {
      type: 'boolean',
      default: false,
    },
    volume: {
      type: 'integer',
      default: 0,
    },
  },
  events: [
    'on',
    'off',
  ],
  commands: {
    on: {
      handler() {
        this.setTrait('power', true);
      },
    },
    off: {
      handler() {
        this.setTrait('power', false);
      },
    },
  },
  afterTraitChange(traitId, newTrait, oldTrait) {
    if (newTrait.value === true && oldTrait.value === false) {
      this.triggerEvent('on');
    } else if (newTrait.value === false && oldTrait.value === true) {
      this.triggerEvent('off');
    }
  },
  homekit(accessory, HomeKit) {
    const { Service, Characteristic } = HomeKit;

    const service = accessory.addService(Service.Speaker, this.name);
    const power = service.getCharacteristic(Characteristic.On);
    const mute = service.getCharacteristic(Characteristic.Mute);
    const volume = service.getCharacteristic(Characteristic.Volume);

    // Power
    power
      .on('set', (value, callback) => {
        this.logger.log(`Homekit set power: ${value}`);
        this.setTrait('power', value);
        callback();
      })
      .on('get', (callback) => {
        const value = this.getTraitValue('power');
        callback(null, value);
      });

    this.onTraitChange('power', (trait) => {
      power.updateValue(trait.value);
    });

    // Mute
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

    // Volume
    volume
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
      volume.updateValue(trait.value);
    });
  },
};
