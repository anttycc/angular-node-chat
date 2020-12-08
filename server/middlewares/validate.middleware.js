

const revalidator = require("revalidator");
const { schema } = require('./validation-schema');

const validate = (model, data) => {
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
const replaceQueryString = (url = '') => {
  const start = url.indexOf('?');
  if (start > -1) {
    url = url.replace(url.substring(start, url.length - 1), '');
  }
  return url;
}
const replaceParams = (url = '', params = {}) => {
  for (const p in params) {
    url = url.replace(new RegExp(`/${params[p]}`), '');
  }
  return url;
}
const handler = (url, method, type, urlParams = {}, data = {}, next) => {
  try {
    let urlSegments = replaceParams(replaceQueryString(url), urlParams).split('/');
    let model = `${urlSegments[urlSegments.length - 1]}:${method.toLowerCase()}:${type}`;
    let { valid, errors } = validate(model, data);

    if (!valid) {
      next({ errorCode: 422, message: errors.map(e => `${e.property} ${e.message}`).join('\n') })
    } else {
      next();
    }
  } catch (e) {
    next(e);
  }
}
exports.validateBody = (req, res, next) => {
  let url = req.url;
  let method = req.method;

  handler(url, method, 'body', req.params, req.body, next)
}
exports.validateParams = (req, res, next) => {
  let url = req.url;
  let method = req.method;

  handler(url, method, 'params', req.params, req.params, next)

}
exports.validateQuery = (req, res, next) => {
  let url = req.url;
  let method = req.method;

  handler(url, method, 'query', req.params, req.query, next)
}




