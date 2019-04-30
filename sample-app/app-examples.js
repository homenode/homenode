const HomeNode = require('../index.js');

HomeNode.setPluginPath('./plugins/');

HomeNode.loadPlugin('dax-amp2');

HomeNode.tree();

// Speakers
HomeNode.interface({
  id: 'speakers',
  type: 'dax-amp',
  name: 'Dax Amplifier',
  config: {
    port: '/dev/cu.usbserial',
    mock: true,
    input_1: 'TV',
  },
});

HomeNode.device({
  id: 'kitchen',
  interface: 'speakers',
  type: 'zone',
  name: 'Kitchen Speakers',
  config: {
    amp: 1,
    zone: 1,
  },
});

// Automatically turn lights on, when motion is detected
HomeNode.automation({
  id: 'turn-on-lights', // Used for tracking/logging/external triggering
  debounce: 2, // Secs - Built in debouncer for multiple calls to trigger(); Trigger will be called when secs have elapsed without more triggers.
  startup: function() {
    HomeNode.getDevice('front-door-ring-doorbell').onEvent('ring', () => {
      this.trigger();
    });

    HomeNode.getDevice('front-door-ring-doorbell').onEvent('motion', () => {
      const lightPower = HomeNode.getDevice('front-door-soffit-lights').getTrait('power');
      const isOn = lightPower.value;
      const now = Math.floor(Date.now() / 1000);
      const secsAgoChanged = now - lightPower.lastChanged;

      // Only trigger if the light is off, and it didn't just change
      if (!isOn && secsAgoChanged > 15) {
        this.trigger();
      }

    });
  },
  trigger: function() {
    HomeNode.getDevice('front-door-soffit-lights').setTrait('power', true);
  },
});

// For Debugging
HomeNode.getAutomation('turn-on-lights').trigger();

// Automatically turn lights off after 15 mins
HomeNode.automation({
  id: 'turn-off-lights',
  startup: function() {
    HomeNode.getDevice('time').onTraitChange('current_time', (new_value, old_value) => {
      const lightPower = HomeNode.getDevice('front-door-soffit-lights').getTrait('power'); // Returns an object {value: true, lastRefreshed: 123456789, lastChanged: 123456789}
      const isOn = lightPower.value;
      const now = Math.floor(Date.now() / 1000);
      const secsAgoChanged = now - lightPower.lastChanged;

      // Turn of light after 15 mins
      if (isOn && secsAgoChanged > 900) {
        this.trigger();
      }
    });
  },
  trigger: function() {
    HomeNode.getDevice('front-door-soffit-lights').setTrait('power', false);
  },
});


//HomeNode.start();
