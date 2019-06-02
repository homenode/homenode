function baseObject() {
  return {
    type: 'object',
    required: ['id', 'type', 'name', 'plugin'], // interface_id can be optionally added by generator
    additionalProperties: false,
    properties: {
      id: {
        type: 'string',
      },
      type: {
        type: 'string',
      },
      name: {
        type: 'string',
      },
      plugin: {
        type: 'string',
      },
      // Added by the generator if a interface is required
      // interface_id: {
      //   type: 'string',
      // },
      config: {
        type: 'object',
        required: [],
        additionalProperties: false,
        properties: {}, // Filled by generator
      },
    },
  };
}

module.exports = (deviceConfig) => {
  const base = baseObject();

  // Add optional config parameters
  if (deviceConfig.config) {
    base.required.push('config');

    const baseConfigObject = base.properties.config;
    Object.entries(deviceConfig.config).forEach(([configKey, configValue]) => {
      if (configValue.required) {
        baseConfigObject.required.push(configKey);
      }

      baseConfigObject.properties[configKey] = {
        type: configValue.type,
      };
    });
  }

  // Add interface
  if (deviceConfig.interface) {
    base.properties.interface_id = {
      type: 'string',
    };

    base.required.push('interface_id');
  }

  return base;
};
