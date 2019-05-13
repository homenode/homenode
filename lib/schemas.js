const _ = require('lodash');
const Ajv = require('ajv');
const betterAjvErrors = require('better-ajv-errors');

const ajv = new Ajv({
  jsonPointers: true,
});

const schemas = {};

const validTypesEnum = ['string', 'integer', 'float', 'boolean'];

const configSchema = {
  type: 'object',
  additionalProperties: {
    type: 'object',
    required: ['type'],
    additionalProperties: false,
    properties: {
      type: {
        type: 'string',
        enum: validTypesEnum,
      },
      required: {
        type: 'boolean',
      },
      default: {},
    },
  },
};

schemas.deviceBase = {
  type: 'object',
  required: ['type', 'plugin'],
  additionalProperties: false,
  properties: {
    type: {
      type: 'string',
    },
    plugin: {
      type: 'string',
    },
    startup: {
      type: 'string',
      const: 'function',
    },
    config: configSchema,
    polling: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        required: ['secs', 'handler'],
        additionalProperties: false,
        properties: {
          runAtStartup: {
            type: 'boolean',
          },
          secs: {
            type: 'integer',
          },
          silent: {
            type: 'boolean',
          },
          handler: {
            type: 'string',
            const: 'function',
          },
        },
      },
    },
    traits: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        required: ['type'],
        additionalProperties: false,
        properties: {
          type: {
            type: 'string',
            enum: validTypesEnum,
          },
          history: {
            type: 'boolean',
          },
          default: {},
        },
      },
    },
    handleTraitChange: {
      type: 'string',
      const: 'function',
    },
    afterTraitChange: {
      type: 'string',
      const: 'function',
    },
  },
};

schemas.interfaceBase = {
  type: 'object',
  required: ['type', 'plugin'],
  additionalProperties: false,
  properties: {
    type: {
      type: 'string',
    },
    plugin: {
      type: 'string',
    },
    startup: {
      type: 'string',
      const: 'function',
    },
    config: configSchema,
  },
};

schemas.deviceInstance = {
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
    interface_id: {
      type: 'string',
    },
    config: {
      type: 'object',
    },
  },
};

schemas.interfaceInstance = {
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
    },
  },
};

schemas.automationInstance = {
  type: 'object',
  required: ['id', 'trigger'],
  additionalProperties: false,
  properties: {
    id: {
      type: 'string',
    },
    startup: {
      type: 'string',
      const: 'function',
    },
    trigger: {
      type: 'string',
      const: 'function',
    },
  },
};

/*
Compile all the raw schemas into validator functions
This is the fastest way to execute a validation
 */
const validators = _.reduce(schemas, (accumulator, schema, key) => {
  accumulator[key] = ajv.compile(schema);
  return accumulator;
}, {});

/*
This method will deeply convert function references into strings with the value of 'function'
This is required because the AJV library will only valid strict JSON documents, and functions are not supported.
 */
const convertFunctions = (data) => {
  return _.reduce(data, (accumulator, value, key) => {
    if (typeof value === 'function') {
      accumulator[key] = 'function';
    } else if (typeof value === 'object') {
      accumulator[key] = convertFunctions(value);
    } else {
      accumulator[key] = value;
    }
    return accumulator;
  }, {});
};

const validate = (name, schemaKey, data) => {
  const cleanData = convertFunctions(data);
  const schemaObject = schemas[schemaKey];
  const validateFn = validators[schemaKey];

  if (!schemaObject || !validateFn) {
    throw new Error(`Missing schema type ${schemaKey}`);
  }

  const valid = validateFn(cleanData);

  if (!valid) {
    const output = betterAjvErrors(schemaObject, cleanData, validateFn.errors, { indent: 4 });

    console.log(output);

    throw new Error(`ERROR: Invalid schema provided for ${name}`);
  }
};

module.exports = {
  validate,
};
