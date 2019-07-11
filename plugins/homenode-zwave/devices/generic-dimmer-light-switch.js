module.exports = {
  type: 'generic-dimmer-light-switch',
  interface: 'zwave',
  config: {
    node: {
      type: 'integer',
      required: true,
    },
  },
  traits: {
    power: {
      type: 'boolean',
      default: false,
      handleChange(value) {
        const node = this.getConfig('node');
        if (value) {
          this.interface.zwave.setValue(node, 38, 1, 0, 255); // 255 turns on last level
        } else {
          this.interface.zwave.setValue(node, 38, 1, 0, 0);
        }
      },
      afterChange(newTrait, oldTrait) {
        if (newTrait.value === true && oldTrait.value === false) {
          this.triggerEvent('on');
        } else if (newTrait.value === false && oldTrait.value === true) {
          this.triggerEvent('off');
        }
      },
    },
    brightness: {
      type: 'integer',
      default: 99,
      handleChange(value) {
        // Max value allowed is 99
        if (value > 99) {
          value = 99;
        }
        const node = this.getConfig('node');
        this.interface.zwave.setValue(node, 38, 1, 0, value);

        // Update power, if this turned the light on or off
        if (!this.getTraitValue('power') && value > 0) {
          // Sync is important here instead of setTrait(). Sync will update the datastore without triggering the handleChange function. Events will still fire.
          this.syncTrait('power', true);
        } else if (this.getTraitValue('power') && value === 0) {
          this.syncTrait('power', false);
        }
      },
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
  homekit(accessory, HomeKit) {
    const { Service, Characteristic } = HomeKit;

    const service = accessory.addService(Service.Lightbulb, this.name);
    const power = service.getCharacteristic(Characteristic.On);
    const brightness = service.getCharacteristic(Characteristic.Brightness);

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

    brightness
      .on('set', (value, callback) => {
        this.logger.log(`Homekit set brightness: ${value}`);
        this.setTrait('brightness', value);
        callback();
      })
      .on('get', (callback) => {
        const value = this.getTraitValue('brightness');
        callback(null, value);
      });

    this.onTraitChange('brightness', (trait) => {
      brightness.updateValue(trait.value);
    });
  },
};
