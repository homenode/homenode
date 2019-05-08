const _ = require('lodash');

const Validator = require('./lib/validator.js');
const Datastore = require('./lib/datastore.js');
const Logger = require('./lib/logger.js');

const SysLogger = new Logger();
SysLogger.addPrefix('System:', 'system');

// const HomeNodeDevice = require('./classes/device.js');
const Plugin = require('./classes/plugin.js');
const Interface = require('./classes/interface.js');
const Device = require('./classes/device.js');
const Automation = require('./classes/automation.js');

const HomeNode = module.exports = {
  // Holds references to all types that are registered
  types: {
    plugins: {},
    interfaces: {},
    devices: {},
    automations: {},
  },

  // Holds a map of all registered plugins/interfaces/devices/traits/events/etc
  systemMap: {},

  // Holds a map of all instances of plugins/interfaces/devices
  instanceMap: {},

  /*
  Instances
  - Holds all created instances of things by id
   */
  instances: {
    plugins: {},
    interfaces: {},
    devices: {},
    automations: {},
  },

  registerInstance(type, id, reference) {
    if (!this.instances[type]) {
      throw new Error(`ERROR: Unable to register an instance of unknown type: ${type}`);
    }

    if (this.instances[type][id]) {
      throw new Error(`ERROR: Unable to register instance of a (${type}) with a duplicate id (${id})`);
    }

    if (!reference) {
      throw new Error(`ERROR: Unable to register instance of a (${type}) with a id (${id}), reference to instance is missing`);
    }

    this.instances[type][id] = reference;
  },

  /*
  Plugins
   */
  pluginBasePath: '',

  setPluginPath(basePath) {
    this.pluginBasePath = basePath;
  },

  loadPlugin(pluginSlug) {
    const pluginPath = `${this.pluginBasePath}homenode-${pluginSlug}`;
    SysLogger.log(`Loading Plugin: ${pluginPath}`);

    HomeNode.registerPlugin(pluginSlug, require(pluginPath));
    const pluginInstance = HomeNode.createPlugin(pluginSlug);

    return pluginInstance;
  },

  registerPlugin: (type, pluginModule) => {
    HomeNode.types.plugins[type] = pluginModule;

    HomeNode.systemMap[`plugin:${type}`] = {};
  },

  createPlugin: (type) => {
    const pluginModule = HomeNode.types.plugins[type];
    const pluginInstance = new Plugin(HomeNode, type);
    pluginModule.call(pluginInstance);

    HomeNode.registerInstance('plugins', type, pluginInstance);

    HomeNode.instanceMap[`plugin:${type}`] = {};

    return pluginInstance;
  },

  getPlugin: (id) => {
    if (!HomeNode.instances.plugins[id]) {
      throw new Error(`ERROR: Unable to find plugin id (${id}) in getPlugin()`);
    }

    return HomeNode.instances.plugins[id];
  },

  /*
  Interfaces
   */

  validateInterface: (config) => {
    const type = config.type || 'Unknown Interface Type';
    const name = `Interface: ${type}`;
    const keys = Object.keys(config);
    const required = [
      'type',
      'plugin',
    ];
    const optional = [
      'config',
      'startup',
      'shutdown',
      'afterAllDeviceStartup',
    ];

    Validator.validateKeys(name, keys, required, optional);

    return true;
  },

  registerInterface: (config) => {
    if (HomeNode.validateInterface(config)) {
      HomeNode.types.interfaces[config.type] = config;

      HomeNode.systemMap[`plugin:${config.plugin}`][`interface:${config.type}`] = {};
    }
  },

  validateInterfaceInstance: (config) => {
    const id = config.id || 'Unknown Interface ID';
    const name = `Interface Instance: ${id}`;
    const keys = Object.keys(config);
    const required = [
      'id',
      'plugin',
      'type',
      'name',
    ];
    const optional = [
      'config',
    ];

    Validator.validateKeys(name, keys, required, optional);

    return true;
  },

  interface: (instanceConfig) => {
    if (HomeNode.validateInterfaceInstance(instanceConfig)) {
      if (!HomeNode.types.plugins[instanceConfig.plugin]) {
        throw new Error(`ERROR: Plugin (${instanceConfig.plugin}) is not loaded.`);
      }

      if (!HomeNode.types.interfaces[instanceConfig.type]) {
        throw new Error(`ERROR: Interface type (${instanceConfig.type}) is not loaded.`);
      }

      // Create a instance of the interface
      const id = instanceConfig.id;
      const type = instanceConfig.type;
      const interfaceConfig = HomeNode.types.interfaces[type];
      const interfaceInstance = new Interface(HomeNode, interfaceConfig, instanceConfig);

      HomeNode.registerInstance('interfaces', id, interfaceInstance);

      HomeNode.instanceMap[`plugin:${interfaceConfig.plugin}`][`interface:${id}`] = {};

      return interfaceInstance;
    }
  },

  getInterface: (id) => {
    if (!HomeNode.instances.interfaces[id]) {
      throw new Error(`ERROR: Unable to find interface id (${id}) in getInterface()`);
    }

    return HomeNode.instances.interfaces[id];
  },

  /*
  Devices
   */

  validateDevice: (deviceConfig) => {
    const type = deviceConfig.type || 'Unknown Interface Type';
    const name = `Interface: ${type}`;

    // Root Keys
    const keys = Object.keys(deviceConfig);
    const required = [
      'type',
      'plugin',
    ];
    const optional = [
      'interface',
      'config',
      'startup',
      'polling',
      'shutdown',
      'traits',
      'handleTraitChange',
      'afterTraitChange',
      'traitMapping',
      'afterAllDeviceStartup',
    ];

    Validator.validateKeys(name, keys, required, optional);

    return true;
  },

  registerDevice: (config) => {
    if (HomeNode.validateDevice(config)) {
      HomeNode.types.devices[config.type] = config;

      if (config.interface) {
        if (!HomeNode.types.interfaces[config.interface]) {
          throw new Error(`ERROR: Interface type (${config.interface}) is not loaded.`);
        }

        HomeNode.systemMap[`plugin:${config.plugin}`][`interface:${config.interface}`][`device:${config.type}`] = {};
      } else {
        HomeNode.systemMap[`plugin:${config.plugin}`][`device:${config.type}`] = {};
      }
    }
  },

  validateDeviceInstance: (config) => {
    const id = config.id || 'Unknown Device ID';
    const name = `Device Instance: ${id}`;
    const keys = Object.keys(config);
    const required = [
      'id',
      'plugin',
      'type',
      'name',
    ];
    const optional = [
      'interface_id',
      'config',
    ];

    Validator.validateKeys(name, keys, required, optional);

    return true;
  },

  device: (instanceConfig) => {
    if (HomeNode.validateDeviceInstance(instanceConfig)) {
      // Create a instance of the interface
      const id = instanceConfig.id;
      const type = instanceConfig.type;
      const deviceConfig = HomeNode.types.devices[type];
      const deviceInstance = new Device(HomeNode, deviceConfig, instanceConfig);

      if (deviceConfig.interface && !instanceConfig.interface_id) {
        throw new Error(`ERROR: Device interface is required on device (${id}) please add interface_id to .device() config`);
      }

      HomeNode.registerInstance('devices', id, deviceInstance);

      if (deviceConfig.interface) {
        HomeNode.instanceMap[`plugin:${deviceConfig.plugin}`][`interface:${instanceConfig.interface_id}`][`device:${id}`] = {};
      } else {
        HomeNode.instanceMap[`plugin:${deviceConfig.plugin}`][`device:${id}`] = {};
      }

      return deviceInstance;
    }
  },

  getDevice: (id) => {
    if (!HomeNode.instances.devices[id]) {
      throw new Error(`ERROR: Unable to find device id (${id}) in getDevice()`);
    }

    return HomeNode.instances.devices[id];
  },

  /*
  Automations
   */

  validateAutomationInstance: (config) => {
    const id = config.id || 'Unknown Automation ID';
    const name = `Automation Instance: ${id}`;
    const keys = Object.keys(config);
    const required = [
      'id',
      'trigger',
    ];
    const optional = [
      'startup',
      'throttle',
    ];

    Validator.validateKeys(name, keys, required, optional);

    return true;
  },

  automation: (instanceConfig) => {
    if (HomeNode.validateAutomationInstance(instanceConfig)) {
      // Create a instance of the automation
      const id = instanceConfig.id;
      const automationInstance = new Automation(HomeNode, instanceConfig);

      HomeNode.instances.automations[id] = automationInstance;

      HomeNode.instanceMap[`automations:${id}`] = {};
    }
  },

  getAutomation: (id) => {
    if (!HomeNode.instances.automations[id]) {
      throw new Error(`ERROR: Unable to find automation id (${id}) in getAutomation()`);
    }

    return HomeNode.instances.automations[id];
  },

  start: () => {
    SysLogger.log('Starting up...');

    let startupSequence = Promise.resolve();

    // Restore Datastore
    startupSequence = startupSequence.then(() => {
      SysLogger.log('Restoring datastore...');
    });

    startupSequence = startupSequence.then(() => {
      return Datastore.startup();
    });

    startupSequence = startupSequence.then(() => {
      SysLogger.log('Datastore restore complete.');
    });

    // Restore Device Traits
    startupSequence = startupSequence.then(() => {
      SysLogger.log('Restoring device traits...');
    });

    startupSequence = startupSequence.then(() => {
      _.each(HomeNode.instances.devices, (device) => {
        device.restoreTraits();
      });
    });

    startupSequence = startupSequence.then(() => {
      SysLogger.log('Device traits restored.');
    });

    // Start Interfaces
    startupSequence = startupSequence.then(() => {
      SysLogger.log('Starting Interfaces...');
    });

    startupSequence = _.reduce(HomeNode.instances.interfaces, (promiseChain, instance, id) => {
      return promiseChain.then(() => {
        SysLogger.log(`Starting interface: ${id}`);
        return instance.startup();
      });
    }, startupSequence);

    startupSequence = startupSequence.then(() => {
      SysLogger.log('Interfaces startup complete.');
    });

    // Start Devices
    startupSequence = startupSequence.then(() => {
      SysLogger.log('Starting Devices...');
    });

    startupSequence = _.reduce(HomeNode.instances.devices, (promiseChain, instance, id) => {
      return promiseChain.then(() => {
        SysLogger.log(`Starting device: ${id}`);
        return instance.startup();
      });
    }, startupSequence);

    startupSequence = startupSequence.then(() => {
      SysLogger.log('Devices startup complete.');
    });

    // Start polling devices
    startupSequence = startupSequence.then(() => {
      SysLogger.log('Starting polling on devices...');
    });

    startupSequence = _.reduce(HomeNode.instances.devices, (promiseChain, instance, deviceId) => {
      // Step into polling on each device
      return promiseChain.then(() => {
        return _.reduce(instance.polling, (promiseChain, poll, pollId) => {
          return promiseChain.then(() => {
            SysLogger.log(`Registering polling (${pollId}) on device (${deviceId})`);

            // Register poll
            setInterval(() => {
              instance.runPoll(pollId);
            }, poll.secs * 1000);

            // Optionally run at startup
            if (poll.runAtStartup) {
              return instance.runPoll(pollId);
            }
          });
        }, promiseChain);
      });
    }, startupSequence);

    startupSequence = startupSequence.then(() => {
      SysLogger.log('Devices polling setup complete.');
    });

    startupSequence = startupSequence.then(() => {
      SysLogger.log('Starting automations...');
    });

    startupSequence = startupSequence.then(() => {
      _.each(HomeNode.instances.automations, (automation, id) => {
        SysLogger.log(`Starting automation: ${id}`);
        automation.startup();
      });
    });

    startupSequence = startupSequence.then(() => {
      SysLogger.log('Automations started.');
    });

    return startupSequence;
  },

  stop: () => {

  },

  tree: () => {
    SysLogger.log('HomeNode Debug Tree *****************************');
    SysLogger.log(`Plugins Base Path: ${HomeNode.pluginBasePath}`);

    SysLogger.log('System Map **************************************');
    SysLogger.log(HomeNode.systemMap);

    SysLogger.log('Instance Map ************************************');
    SysLogger.log(HomeNode.instanceMap);
  },
};
