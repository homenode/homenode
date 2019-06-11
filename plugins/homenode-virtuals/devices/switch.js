module.exports = {
  type: 'switch',
  traits: {
    power: {
      type: 'boolean',
      default: false,
      afterChange(newTrait, oldTrait) {
        if (newTrait.value === true && oldTrait.value === false) {
          this.triggerEvent('on');
        } else if (newTrait.value === false && oldTrait.value === true) {
          this.triggerEvent('off');
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

    const service = accessory.addService(Service.Switch, this.name);
    const power = service.getCharacteristic(Characteristic.On);

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
  },
};
