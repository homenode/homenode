const Schema = require('../lib/schemas.js');
const Registry = require('../lib/registry.js');

module.exports = {
  validateInterface(config) {
    const type = config.type || 'Unknown Interface Type';
    const name = `Interface: ${type}`;

    Schema.validate(name, 'interfaceClass', config);
  },

  validateDevice(config) {
    const type = config.type || 'Unknown Device Type';
    const name = `Device: ${type}`;

    Schema.validate(name, 'deviceClass', config);
  },

  validateAutomationInstance(instanceConfig) {
    const logName = `Automation Instance: ${instanceConfig.id || 'unknown'}`;

    Schema.validate(logName, 'automation', instanceConfig);
  },

  validateDeviceInstance(Plugin, instanceConfig) {
    if (!instanceConfig.id) {
      throw new Error(`ERROR: Device is missing required 'id' property`);
    }

    if (!instanceConfig.type) {
      throw new Error(`ERROR: Device (${instanceConfig.id}) is missing required 'type' property`);
    }

    if (!Registry.exists('plugin', [instanceConfig.plugin])) {
      throw new Error(`ERROR: Device (${instanceConfig.id}) defined a plugin (${instanceConfig.plugin}) that is not loaded.`);
    }

    if (!Plugin.deviceTypes[instanceConfig.type]) {
      throw new Error(`ERROR: Device (${instanceConfig.id}) type (${instanceConfig.type}) is not loaded.`);
    }

    const deviceConfig = Plugin.deviceTypes[instanceConfig.type];
    const instanceSchemaName = deviceConfig.schemaName;

    Schema.validate(`Device Instance: ${instanceConfig.id}`, instanceSchemaName, instanceConfig);
  },

  validateInterfaceInstance(Plugin, instanceConfig) {
    if (!instanceConfig.id) {
      throw new Error(`ERROR: Interface is missing required 'id' property`);
    }

    if (!instanceConfig.type) {
      throw new Error(`ERROR: Interface (${instanceConfig.id}) is missing required 'type' property`);
    }

    if (!Registry.exists('plugin', [instanceConfig.plugin])) {
      throw new Error(`ERROR: Interface (${instanceConfig.id}) defined a plugin (${instanceConfig.plugin}) that is not loaded.`);
    }

    if (!Plugin.interfaceTypes[instanceConfig.type]) {
      throw new Error(`ERROR: Interface (${instanceConfig.id}) type (${instanceConfig.type}) is not loaded.`);
    }

    const interfaceConfig = Plugin.interfaceTypes[instanceConfig.type];
    const instanceSchemaName = interfaceConfig.schemaName;

    Schema.validate(`Interface Instance: ${instanceConfig.id}`, instanceSchemaName, instanceConfig);
  },
};
