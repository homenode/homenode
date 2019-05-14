function baseObject() {
  return {
    type: 'object',
    required: ['id', 'type', 'name', 'plugin'],
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
      config: {
        type: 'object',
        required: [],
        additionalProperties: false,
        properties: {}, // Filled by generator
      },
    },
  };
}

module.exports = (interfaceConfig) => {
  const base = baseObject();

  // Add optional config parameters
  if (interfaceConfig.config) {
    const baseConfigObject = base.properties.config;
    Object.keys(interfaceConfig.config).forEach((configKey) => {
      const configValue = interfaceConfig.config[configKey];

      if (configValue.required) {
        baseConfigObject.required.push(configKey);
      }

      baseConfigObject.properties[configKey] = {
        type: configValue.type,
      };
    });
  }

  return base;
};
