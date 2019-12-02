module.exports = {
  type: 'contact-sensor',
  traits: {
    open: {
      type: 'boolean',
      default: false,
      afterChange(newTrait, oldTrait) {
        if (newTrait.value === true && oldTrait.value === false) {
          this.triggerEvent('opened');
        } else if (newTrait.value === false && oldTrait.value === true) {
          this.triggerEvent('closed');
        }
      },
    },
  },
  events: [
    'opened',
    'closed',
  ],
  commands: {
    opened: {
      handler() {
        this.setTrait('open', true);
      },
    },
    closed: {
      handler() {
        this.setTrait('open', false);
      },
    },
  },
  homekit(accessory, HomeKit) {
    const { Service, Characteristic } = HomeKit;

    const service = accessory.addService(Service.ContactSensor, this.name);
    const state = service.getCharacteristic(Characteristic.ContactSensorState);

    state
      .on('set', (value, callback) => {
        this.logger.log(`Homekit set open: ${value}`);
        this.setTrait('open', value);
        callback();
      })
      .on('get', (callback) => {
        const value = this.getTraitValue('open');
        callback(null, value);
      });

    this.onTraitChange('open', (trait) => {
      state.updateValue(trait.value);
    });
  },
};
