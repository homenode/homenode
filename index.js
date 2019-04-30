const _ = require('lodash');

const Validator = require('./lib/validator.js');

// const HomeNodeDevice = require('./classes/device.js');
const Plugin = require('./classes/plugin.js');
const Interface = require('./classes/interface.js');
const Device = require('./classes/device.js');

const HomeNode = module.exports = {
  // Holds references to all types that are registered
  types: {
    plugins: {},
    interfaces: {},
    devices: {},
  },

  // Holds all created instances of things
  instances: {
    plugins: {},
    interfaces: {},
    devices: {},
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
    console.log(`Loading HomeNode Plugin: ${pluginPath}`);

    HomeNode.registerPlugin(pluginSlug, require(pluginPath));
    HomeNode.createPlugin(pluginSlug);
  },

  registerPlugin: (type, pluginModule) => {
    HomeNode.types.plugins[type] = pluginModule;
  },

  createPlugin: (type) => {
    const pluginModule = HomeNode.types.plugins[type];
    const pluginWrapper = new Plugin(HomeNode, type);
    const pluginInstance = pluginModule.call(pluginWrapper);

    HomeNode.instances.plugins[type] = pluginInstance;
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
    }
  },

  validateInterfaceInstance: (config) => {
    const type = config.type || 'Unknown Interface Type';
    const name = `Interface Instance: ${type}`;
    const keys = Object.keys(config);
    const required = [
      'id',
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
      // Create a instance of the interface
      const id = instanceConfig.id;
      const type = instanceConfig.type;
      const interfaceConfig = HomeNode.types.interfaces[type];
      const interfaceInstance = new Interface(HomeNode, interfaceConfig, instanceConfig);

      HomeNode.instances.interfaces[id] = interfaceInstance;
    }
  },

  /*
  Devices
   */

  validateDevice: (config) => {
    const type = config.type || 'Unknown Interface Type';
    const name = `Interface: ${type}`;
    const keys = Object.keys(config);
    const required = [
      'type',
      'interface',
    ];
    const optional = [
      'config',
      'startup',
      'refresh',
      'refreshEvery',
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
    }
  },

  device: (config) => {
    // Create a instance of the device
  },

  start: () => {

  },

  tree: () => {
    console.log('HomeNode Debug Tree');
    console.log(`Plugins Base Path: ${HomeNode.pluginBasePath}`);

    console.log('Plugins Registered:');
    _.forEach(HomeNode.types.plugins, (value, key) => console.log(`- ${key}`));

    console.log('Interfaces Registered:');
    _.forEach(HomeNode.types.interfaces, (value, key) => console.log(`- ${key}`));

    console.log('Devices Registered:');
    _.forEach(HomeNode.types.devices, (value, key) => console.log(`- ${key}`));

    console.log('Plugin Instances:');
    _.forEach(HomeNode.instances.plugins, (value, key) => console.log(`- ${key}`));

    console.log('Interface Instances:');
    _.forEach(HomeNode.instances.interfaces, (value, key) => console.log(`- ${key}`));

    console.log('Device Instances:');
    _.forEach(HomeNode.instances.devices, (value, key) => console.log(`- ${key}`));
  },
};
