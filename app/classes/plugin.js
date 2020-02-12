const _ = require('lodash');

const Registry = require('../lib/registry.js');
const Schema = require('../lib/schemas.js');
const Logger = require('../lib/logger.js');
const Api = require('../lib/api.js');

const Interface = require('../classes/interface.js');
const Device = require('../classes/device.js');

const deviceSchemaGenerator = require('../schema_generators/device_instance.js');
const interfaceSchemaGenerator = require('../schema_generators/interface_instance.js');

const {
  validateInterface,
  validateDevice,
  validateInterfaceInstance,
  validateDeviceInstance,
} = require('../lib/validator.js');

module.exports = function pluginClass(pluginType) {
  // This object will hold all plugin defined interfaces, including nested plugins
  this.interfaceTypes = {};

  // These devices don't use an interface, and are created directly from the plugin
  this.deviceTypes = {};

  this.logger = new Logger();
  this.logger.addPrefix(`Plugin (${pluginType}):`);

  this.registerInterface = (config) => {
    config.plugin = pluginType;

    validateInterface(config);

    // Register a custom schema for validating instances
    const instanceSchemaName = `${config.plugin}:${config.type}`;
    const instanceSchema = interfaceSchemaGenerator(config);
    Schema.addSchema(instanceSchemaName, instanceSchema);
    config.schemaName = instanceSchemaName;

    this.interfaceTypes[config.type] = config;
  };

  this.registerDevice = (config) => {
    config.plugin = pluginType;
    validateDevice(config);

    if (config.interface && !this.interfaceTypes[config.interface]) {
      throw new Error(`ERROR: Interface type (${config.interface}) is not loaded.`);
    }

    // Register a custom schema for validating instances
    const interfaceName = config.interface || 'no-interface';
    const instanceSchemaName = `${config.plugin}:${interfaceName}:${config.type}`;
    const instanceSchema = deviceSchemaGenerator(config);
    Schema.addSchema(instanceSchemaName, instanceSchema);
    config.schemaName = instanceSchemaName;

    this.deviceTypes[config.type] = config;
  };

  this.registerApiRoute = (verb, path, handler) => {
    const cleanPath = _.trim(path, '/');
    const prefixedPath = `/${pluginType}/${cleanPath}`;
    return Api.registerApiRoute(verb, prefixedPath, handler);
  };

  this.interface = (instanceConfig) => {
    instanceConfig.plugin = pluginType;
    validateInterfaceInstance(this, instanceConfig);

    // Create a instance of the interface
    const id = instanceConfig.id;
    const type = instanceConfig.type;
    const interfaceConfig = this.interfaceTypes[type];
    const interfaceInstance = new Interface(this, interfaceConfig, instanceConfig);

    Registry.register('interface', id, interfaceInstance);

    return interfaceInstance;
  };

  this.device = (instanceConfig) => {
    instanceConfig.plugin = pluginType;
    validateDeviceInstance(this, instanceConfig);

    const id = instanceConfig.id;
    const deviceConfig = this.deviceTypes[instanceConfig.type];
    const deviceInstance = new Device(deviceConfig, instanceConfig);

    Registry.register('device', id, deviceInstance);

    return deviceInstance;
  };

  return this;
};
