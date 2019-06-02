const Datastore = require('./lib/datastore.js');
const Registry = require('./lib/registry.js');
const Logger = require('./lib/logger.js');
const {
  validateAutomationInstance,
} = require('./lib/validator.js');

const logger = new Logger();
logger.addPrefix('System:', 'system');

const Plugin = require('./classes/plugin.js');
const Automation = require('./classes/automation.js');

const Homekit = require('./integrations/homekit.js');

let pluginBasePath = '';
let homekitEnabled = false;

/**
 * HomeNode public module
 */
const HomeNode = module.exports = {
  /**
   * Getters
   */
  getPlugin: Registry.getPlugin,
  getDevice: Registry.getDevice,
  getInterface: Registry.getInterface,
  getAutomation: Registry.getAutomation,

  /**
   * Plugins
   */
  setPluginPath(basePath) {
    pluginBasePath = basePath;
  },

  loadPlugin(pluginSlug) {
    const pluginPath = `${pluginBasePath}homenode-${pluginSlug}`;
    logger.log(`Loading Plugin: ${pluginPath}`);

    const pluginModule = require(pluginPath);
    const pluginInstance = new Plugin(pluginSlug);
    pluginModule.call(pluginInstance);

    Registry.register('plugin', pluginSlug, pluginInstance);

    return pluginInstance;
  },

  /**
   * Automations
   */
  automation: (instanceConfig) => {
    validateAutomationInstance(instanceConfig);

    const id = instanceConfig.id;
    const automationInstance = new Automation(HomeNode, instanceConfig);

    Registry.register('automation', id, automationInstance);
  },

  /**
   * Integrations
   */
  enableHomekit: (options) => {
    logger.log('Enabling homekit...', options);
    homekitEnabled = true;
    Homekit.config(options);
  },

  /**
   * Startup & Shutdown
   */
  start: async () => {
    const devices = Registry.getType('device');
    const interfaces = Registry.getType('interface');
    const automations = Registry.getType('automation');

    logger.log('Starting up...');

    logger.log('Restoring datastore...');
    await Datastore.startup();
    logger.log('Datastore restore complete.');

    logger.log('Restoring device traits...');
    await Promise.all(Object.values(devices).map((device) => {
      logger.log(`Restoring device traits for: ${device.id}`);
      return device.restoreTraits();
    }));
    logger.log('Device traits restored.');

    logger.log('Starting Interfaces...');
    await Promise.all(Object.values(interfaces).map((interfaceInstance) => {
      logger.log(`Starting interface: ${interfaceInstance.id}`);
      return interfaceInstance.startup();
    }));
    logger.log('Interfaces startup complete.');

    logger.log('Starting Devices...');
    await Promise.all(Object.values(devices).map((device) => {
      logger.log(`Starting device: ${device.id}`);

      // Add to homekit startup
      if (device.homekit) {
        Homekit.addDevice(device);
      }

      return device.startup();
    }));
    logger.log('Devices startup complete.');

    logger.log('Starting polling on devices...');
    await Promise.all(Object.values(devices).map((device) => Promise.all(Object.entries(device.polling).map(async ([pollId, poll]) => {
      logger.log(`Registering polling (${pollId}) on device (${device.id})`);

      setInterval(() => device.runPoll(pollId), poll.secs * 1000);

      if (poll.runAtStartup) {
        await device.runPoll(pollId);
      }
    }))));
    logger.log('Devices polling setup complete.');

    if (homekitEnabled) {
      logger.log('Starting homekit...');
      await Homekit.startup();
      logger.log('Homekit started.');
    }

    logger.log('Starting automations...');
    await Promise.all(Object.values(automations).map((automation) => {
      logger.log(`Starting automation: ${automation.id}`);
      return automation.startup();
    }));
    logger.log('Automations started.');
  },

  stop: () => {
    // TODO: Graceful shutdown.
  },

  /**
   * Debugging
   */
  tree: () => {
    const plugins = Registry.getType('plugin');
    const pluginsMap = Object.entries(plugins);

    logger.log();
    logger.log('HomeNode Plugins Map **************************************');
    logger.log();

    const pluginMap = pluginsMap.map(([pluginKey, pluginValue]) => {

      const interfaceTypes = Object.entries(pluginValue.interfaceTypes);
      const deviceTypes = Object.entries(pluginValue.deviceTypes);

      return {
        'plugin-key': pluginKey,
        'interface-types': interfaceTypes.reduce((list, [interfaceKey, interfaceValue]) => {
          list[interfaceKey] = {
            config: interfaceValue.config,
            traits: interfaceValue.traits || {},
            events: interfaceValue.events || [],
            commands: Object.keys(interfaceValue.commands || {}),
          };
          return list;
        }, {}),
        'devices-types': deviceTypes.reduce((list, [deviceKey, deviceValue]) => {
          list[deviceKey] = {
            config: deviceValue.config || {},
            traits: deviceValue.traits || {},
            events: deviceValue.events || [],
            commands: Object.keys(deviceValue.commands || {}),
          };

          if (deviceValue.interface) {
            list[deviceKey]['requires interface'] = deviceValue.interface;
          }
          return list;
        }, {}),
      };
    });

    logger.log(pluginMap);

    logger.log();
    logger.log('HomeNode Instance Map ************************************');

    logger.log();
  },
};
