/**
 * @name Crest
 * @description Rest library designed to easily configure and access
 *              external resources within a Meteor Application.
 *
 * @author <rpitt@centiq.co.uk> Robert Pitt
 * @package centiq:crest
 * @copyright 2015 Centiq Ltd.
 * @license http://opensource.org/licenses/MIT
 */

/**
 * Crest class
 * @param {Object} options Option configuration object
 */
Crest = function Crest(options, defaults) {
  /**
   * Default properties.
   */
  this._options = _.extend({
    /**
     * Set the base_url
     * @type {String}
     */
    base_url: null
  }, options || {});

  /**
   * Create a root resource objecy
   * @type {Crest}
   */
  this.__root__ = new Crest.Resource(this, '__root__', '', defaults || {});

  /**
   * Validate the base_url.
   */
  if (!this._options.base_url) {
    throw new Meteor.Error("invalid-options", "base_url required.");
  }

  this._options.base_url = this._options.base_url.replace(/\/$/, "");
}

/**
 * Expose the {Resource} Object
 * @type {Resource}
 */
Crest.Resource = Resource;

/**
 * Add a root level resources that stems from the API class.
 * @see {Resource.addResource}
 */
Crest.prototype.addResource = function() {
  /**
   * Create a new resource that extends the root resource
   * @type {Resource}
   */
  var resource = this.__root__.addResource.apply(this.__root__, arguments);

  /**
   * Bind the current resource name to this object to allow for
   * function call flow.
   */
  Object.defineProperty(this, resource._name, {
    get: function() {
      return resource;
    }
  });
};

/**
 * Generate a fully-qualified URL.
 * @param  {String} id Optional resource identifier
 * @return {String}    Constructured url
 */
Crest.prototype._url = function() {
  return this._options.base_url;
};

/**
 * Root resources requires it's context to return an empty object.
 * @param  {Object} options Options mixin for the resource call.
 * @return {Object}         Options
 */
Crest.prototype._getOptions = function(options) {
  return {};
};

/**
 * Set an option
 * @param {String} key   Option name
 * @param {*}      value Option value
 */
Crest.prototype.setOption = function(key, value) {
  return this.__root__.setOption.apply(this.__root__, arguments);
};

/**
 * Fetch an option
 * @param  {String} key Option Name
 * @return {*}          Option Value
 */
Crest.prototype.getOption = function(key) {
  return this.__root__.getOption.apply(this.__root__, arguments);
};

/**
 * Set a parameter to the query string of all requests
 * @param  {String} key   Query key
 * @param  {*}      value Query value
 * @return {*}            Returns the current value if no value is passed.
 */
Crest.prototype.query = function(key, value) {
  return this.__root__.query.apply(this.__root__, arguments);
};

/**
 * Set a parameter to the params object of all requests
 * @param  {String} key   Parameter key
 * @param  {*}      value Parameter value
 * @return {*}            Returns the current value if no value is passed.
 */
Crest.prototype.param = function(key, value) {
  return this.__root__.param.apply(this.__root__, arguments);
};

/**
 * Set a header to all requests
 * @param  {String} key   Header key
 * @param  {*}      value Header value
 * @return {*}            Returns the current value if no value is passed.
 */
Crest.prototype.header = function(key, value) {
  return this.__root__.header.apply(this.__root__, arguments);
};

/**
 * For Resource._resourcePath();
 */
Crest.prototype._resourcePath = function() {
  return '';
};
