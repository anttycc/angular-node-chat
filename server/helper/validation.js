
const revalidator = require("revalidator");
const { schema } = require('../validation-schema');


exports.validate = (model, data) => {
  try {
    const seg = model.split(':');
    let definition = schema[seg[0]] || {};
    definition = definition[seg[1]] || {};
    definition = definition[seg[2]] || {};
    return revalidator.validate(data, definition, {
      additionalProperties: !definition.hasOwnProperty('type')
    });
  } catch (e) {
    throw e;
  }
}

