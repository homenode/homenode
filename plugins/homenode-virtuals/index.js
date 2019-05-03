module.exports = function Virtuals() {
  /*
  Interface
   */
  this.registerInterface({
    type: 'virtuals',
  });

  /*
  Device
   */
  this.registerDevice({
    type: 'switch',
    interface: 'virtuals',
    traits: {
      power: {
        type: 'bool',
        default: false,
      },
    },
    afterTraitChange(traitId, newTrait, oldTrait) {
      if (newTrait.value === true && oldTrait.value === false) {
        this.triggerEvent('on');
      } else if (newTrait.value === false && oldTrait.value === true) {
        this.triggerEvent('off');
      }
    },
  });

  this.registerDevice({
    type: 'dimmer',
    interface: 'virtuals',
    traits: {
      power: {
        type: 'bool',
        default: false,
      },
      level: {
        type: 'integer',
        default: 0,
      },
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
        case 'level':
          if (newTrait.value === 0) {
            this.setTrait('power', false);
          } else if (newTrait.value > 0) {
            this.setTrait('power', true);
          }
          break;
      }
    },
  });
};
