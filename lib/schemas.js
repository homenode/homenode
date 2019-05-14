const _ = require('lodash');
const Ajv = require('ajv');
const betterAjvErrors = require('better-ajv-errors');

// Built in Schemas
const deviceClass = require('./schemas/deviceClass.js');
const interfaceClass = require('./schemas/interfaceClass.js');
const automation = require('./schemas/automation.js');

// Create main class for AJV
const ajv = new Ajv({
  jsonPointers: true,
});

// Registry of all schemas. Keeping a copy of the un-compiled schema is required for betterAjvErrors()
const schemas = {};

const addSchema = (name, schema) => {
  schemas[name] = schema;
  ajv.addSchema(schema, name);
};

// Add built in schemas
addSchema('deviceClass', deviceClass);
addSchema('interfaceClass', interfaceClass);
addSchema('automation', automation);

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

const validate = (logName, schemaName, data) => {
  const cleanData = convertFunctions(data);
  const schemaObject = schemas[schemaName];

  if (!schemaObject) {
    throw new Error(`Missing schema type ${schemaName}`);
  }

  const valid = ajv.validate(schemaName, cleanData);

  if (!valid) {
    const output = betterAjvErrors(schemaObject, cleanData, ajv.errors, { indent: 4 });

    console.error(output);

    throw new Error(`ERROR: Invalid schema provided for ${logName}`);
  }
};

module.exports = {
  addSchema,
  validate,
};
