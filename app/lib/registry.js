/**
 * Holds a
 */
const instances = {
  plugin: {},
  interface: {},
  device: {},
  automation: {},
};

const Registry = module.exports = {
  exists(type, id) {
    return instances[type] && instances[type][id];
  },
  getType(type) {
    if (!instances[type]) {
      const validTypes = Object.keys(instances).join(',');
      throw new Error(`ERROR: Unable to find unknown type (${type}) in registry. Value must be: ${validTypes}`);
    }

    return instances[type];
  },

  get(type, id) {
    const typeInstances = Registry.getType(type);

    if (!typeInstances[id]) {
      throw new Error(`ERROR: Unable to find (${type}) id (${id})`);
    }

    return typeInstances[id];
  },

  getPlugin: (id) => Registry.get('plugin', id),
  getInterface: (id) => Registry.get('interface', id),
  getDevice: (id) => Registry.get('device', id),
  getAutomation: (id) => Registry.get('automation', id),

  register(type, id, reference) {
    if (!instances[type]) {
      throw new Error(`ERROR: Unable to register an instance of unknown type: ${type}`);
    }

    if (instances[type][id]) {
      throw new Error(`ERROR: Unable to register instance of a (${type}) with a duplicate id (${id})`);
    }

    if (!reference) {
      throw new Error(`ERROR: Unable to register instance of a (${type}) with a id (${id}), reference to instance is missing`);
    }

    instances[type][id] = reference;
  },

};
