module.exports = function Virtuals() {
  /*
  Virtual Switch
   */
  this.registerDevice({
    type: 'switch',
    traits: {
      power: {
        type: 'boolean',
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

  /*
  Virtual Dimmer Switch
   */
  this.registerDevice({
    type: 'dimmer',
    traits: {
      power: {
        type: 'boolean',
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
