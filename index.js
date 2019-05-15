const Schema = require('./app/lib/schemas.js');
const Datastore = require('./app/lib/datastore.js');
const Logger = require('./app/lib/logger.js');

const deviceSchemaGenerator = require('./app/schema_generators/device_instance.js');
const interfaceSchemaGenerator = require('./app/schema_generators/interface_instance.js');

const SysLogger = new Logger();
SysLogger.addPrefix('System:', 'system');

// const HomeNodeDevice = require('./classes/device.js');
const Plugin = require('./app/classes/plugin.js');
const Interface = require('./app/classes/interface.js');
const Device = require('./app/classes/device.js');
const Automation = require('./app/classes/automation.js');

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

    Schema.validate(name, 'interfaceClass', config);
  },

  registerInterface: (config) => {
    HomeNode.validateInterface(config);

    // Register a custom schema for validating instances
    const instanceSchemaName = `${config.plugin}:${config.type}`;
    const instanceSchema = interfaceSchemaGenerator(config);
    Schema.addSchema(instanceSchemaName, instanceSchema);
    config.schemaName = instanceSchemaName;

    HomeNode.types.interfaces[config.type] = config;

    HomeNode.systemMap[`plugin:${config.plugin}`][`interface:${config.type}`] = {};
  },

  validateInterfaceInstance: (instanceConfig) => {
    if (!instanceConfig.id) {
      throw new Error(`ERROR: Interface is missing required 'id' property`);
    }

    if (!instanceConfig.type) {
      throw new Error(`ERROR: Interface (${instanceConfig.id}) is missing required 'type' property`);
    }

    if (!HomeNode.types.plugins[instanceConfig.plugin]) {
      throw new Error(`ERROR: Interface (${instanceConfig.id}) defined a plugin (${instanceConfig.plugin}) that is not loaded.`);
    }

    if (!HomeNode.types.interfaces[instanceConfig.type]) {
      throw new Error(`ERROR: Interface (${instanceConfig.id}) type (${instanceConfig.type}) is not loaded.`);
    }

    const interfaceConfig = HomeNode.types.interfaces[instanceConfig.type];
    const instanceSchemaName = interfaceConfig.schemaName;

    Schema.validate(`Interface Instance: ${instanceConfig.id}`, instanceSchemaName, instanceConfig);
  },

  interface: (instanceConfig) => {
    HomeNode.validateInterfaceInstance(instanceConfig);

    // Create a instance of the interface
    const id = instanceConfig.id;
    const type = instanceConfig.type;
    const interfaceConfig = HomeNode.types.interfaces[type];
    const interfaceInstance = new Interface(HomeNode, interfaceConfig, instanceConfig);

    HomeNode.registerInstance('interfaces', id, interfaceInstance);

    HomeNode.instanceMap[`plugin:${interfaceConfig.plugin}`][`interface:${id}`] = {};

    return interfaceInstance;
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

  validateDevice: (config) => {
    const type = config.type || 'Unknown Device Type';
    const name = `Device: ${type}`;

    Schema.validate(name, 'deviceClass', config);
  },

  registerDevice: (config) => {
    HomeNode.validateDevice(config);

    // Register a custom schema for validating instances
    const interfaceName = config.interface || 'no-interface';
    const instanceSchemaName = `${config.plugin}:${interfaceName}:${config.type}`;
    const instanceSchema = deviceSchemaGenerator(config);
    Schema.addSchema(instanceSchemaName, instanceSchema);
    config.schemaName = instanceSchemaName;

    HomeNode.types.devices[config.type] = config;

    if (config.interface) {
      if (!HomeNode.types.interfaces[config.interface]) {
        throw new Error(`ERROR: Interface type (${config.interface}) is not loaded.`);
      }

      HomeNode.systemMap[`plugin:${config.plugin}`][`interface:${config.interface}`][`device:${config.type}`] = {};
    } else {
      HomeNode.systemMap[`plugin:${config.plugin}`][`device:${config.type}`] = {};
    }
  },

  validateDeviceInstance: (instanceConfig) => {
    if (!instanceConfig.id) {
      throw new Error(`ERROR: Device is missing required 'id' property`);
    }

    if (!instanceConfig.type) {
      throw new Error(`ERROR: Device (${instanceConfig.id}) is missing required 'type' property`);
    }

    if (!HomeNode.types.plugins[instanceConfig.plugin]) {
      throw new Error(`ERROR: Device (${instanceConfig.id}) defined a plugin (${instanceConfig.plugin}) that is not loaded.`);
    }

    if (!HomeNode.types.devices[instanceConfig.type]) {
      throw new Error(`ERROR: Device (${instanceConfig.id}) type (${instanceConfig.type}) is not loaded.`);
    }

    const deviceConfig = HomeNode.types.devices[instanceConfig.type];
    const instanceSchemaName = deviceConfig.schemaName;

    Schema.validate(`Device Instance: ${instanceConfig.id}`, instanceSchemaName, instanceConfig);
  },

  device: (instanceConfig) => {
    HomeNode.validateDeviceInstance(instanceConfig);

    const id = instanceConfig.id;
    const deviceConfig = HomeNode.types.devices[instanceConfig.type];
    const deviceInstance = new Device(HomeNode, deviceConfig, instanceConfig);

    HomeNode.registerInstance('devices', id, deviceInstance);

    if (deviceConfig.interface) {
      HomeNode.instanceMap[`plugin:${deviceConfig.plugin}`][`interface:${instanceConfig.interface_id}`][`device:${id}`] = {};
    } else {
      HomeNode.instanceMap[`plugin:${deviceConfig.plugin}`][`device:${id}`] = {};
    }

    return deviceInstance;
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

  validateAutomationInstance: (instanceConfig) => {
    const logName = `Automation Instance: ${instanceConfig.id || 'unknown'}`;

    Schema.validate(logName, 'automation', instanceConfig);
  },

  automation: (instanceConfig) => {
    HomeNode.validateAutomationInstance(instanceConfig);

    const id = instanceConfig.id;
    HomeNode.instances.automations[id] = new Automation(HomeNode, instanceConfig);

    HomeNode.instanceMap[`automations:${id}`] = {};
  },

  getAutomation: (id) => {
    if (!HomeNode.instances.automations[id]) {
      throw new Error(`ERROR: Unable to find automation id (${id}) in getAutomation()`);
    }

    return HomeNode.instances.automations[id];
  },

  start: async () => {
    SysLogger.log('Starting up...');

    SysLogger.log('Restoring datastore...');
    await Datastore.startup();
    SysLogger.log('Datastore restore complete.');

    SysLogger.log('Restoring device traits...');
    await Promise.all(Object.values(HomeNode.instances.devices).map((device) => {
      SysLogger.log(`Restoring device traits for: ${device.id}`);
      return device.restoreTraits();
    }));
    SysLogger.log('Device traits restored.');

    SysLogger.log('Starting Interfaces...');
    await Promise.all(Object.values(HomeNode.instances.interfaces).map((interfaceInstance) => {
      SysLogger.log(`Starting interface: ${interfaceInstance.id}`);
      return interfaceInstance.startup();
    }));
    SysLogger.log('Interfaces startup complete.');

    SysLogger.log('Starting Devices...');
    await Promise.all(Object.values(HomeNode.instances.devices).map((device) => {
      SysLogger.log(`Starting device: ${device.id}`);
      return device.startup();
    }));
    SysLogger.log('Devices startup complete.');

    SysLogger.log('Starting polling on devices...');
    await Promise.all(Object.values(HomeNode.instances.devices).map((device) => Promise.all(Object.entries(device.polling).map(async ([pollId, poll]) => {
      SysLogger.log(`Registering polling (${pollId}) on device (${device.id})`);

      setInterval(() => device.runPoll(pollId), poll.secs * 1000);

      if (poll.runAtStartup) {
        await device.runPoll(pollId);
      }
    }))));
    SysLogger.log('Devices polling setup complete.');

    SysLogger.log('Starting automations...');
    await Promise.all(Object.values(HomeNode.instances.automations).map((automation) => {
      SysLogger.log(`Starting automation: ${automation.id}`);
      return automation.startup();
    }));
    SysLogger.log('Automations started.');
  },

  stop: () => {
    // TODO: Graceful shutdown.
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
