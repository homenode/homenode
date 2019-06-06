const storage = require('node-persist');
const HAP = require('hap-nodejs');

const uuid = HAP.uuid;
const Bridge = HAP.Bridge;
const Accessory = HAP.Accessory;
const Service = HAP.Service;
const Characteristic = HAP.Characteristic;

const HomeKit = {
  Service,
  Characteristic,
};

const Logger = require('../lib/logger.js');

let config = {};
const devices = {};

const logger = new Logger();
logger.addPrefix('Homekit:');

module.exports = {
  config(options) {
    config = Object.assign({}, {
      pincode: '031-45-154',
      username: 'CC:22:3D:E3:CE:B9',
    }, options || {});
  },
  addDevice(device) {
    logger.log(`Adding device (${device.id}) to homekit startup`);
    devices[device.id] = device;
  },
  startup() {
    logger.log(`Startup called, creating homekit bridge`);

    // Initialize our storage system
    storage.initSync();

    const bridge = new Bridge('HomeNode Bridge', uuid.generate('HomeNode Bridge'));

    bridge.on('identify', function(paired, callback) {
      // console.log('Node Bridge identify');
      callback(); // success
    });

    // Setup each device
    Object.entries(devices).forEach(([id, device]) => {
      logger.log(`Starting device ${id}`);
      const accessory = new Accessory(device.name, uuid.generate(`homenode:device:${id}`));

      // Pass accessory to device handler for customization
      device.homekit(accessory, HomeKit);

      bridge.addBridgedAccessory(accessory);
    });

    // Publish the Bridge on the local network.
    bridge.publish({
      username: config.username,
      port: 51826,
      pincode: config.pincode,
      category: Accessory.Categories.BRIDGE,
    });

    logger.log(`Connect to homekit using pin: ${config.pincode}`);

    const signals = {
      SIGINT: 2,
      SIGTERM: 15,
    };

    // TODO: Maybe move this to be apart of a more complete shutdown process
    Object.keys(signals).forEach(function(signal) {
      process.on(signal, function() {
        bridge.unpublish();
        setTimeout(function() {
          process.exit(128 + signals[signal]);
        }, 1000);
      });
    });
  },
};
