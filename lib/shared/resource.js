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
 * Resource Class
 * @param {Crest} context  Crest object used to create the resource
 * @param {String} name     Resource Name
 * @param {String} path     Resource URI
 * @param {Object} defaults Optional parameters for HTTP Requests.
 */
Resource = function Resource(context, name, path, defaults) {
  /**
   * Validate context is a Crest Object
   */
  if (!(context instanceof Crest) && !(context instanceof Resource)) {
    throw new Meteor.Error("invalid-context", "The context passed to the Resource is invalid.");
  }

  /**
   * Set the context for this resoruce
   * @type {Crest}
   */
  this._context = context;

  /**
   * Set the name of this resource
   */
  this._name = name;

  /**
   * Set the path of this resources
   */
  this._path = path;

  /**
   * Assign the resources defaults.
   * @type {Object}
   */
  this._defaults = _.deepExtend({

    /**
     * Header Parameters
     * @type {Object}
     */
    headers: {},

    /**
     * Parameters Object
     * @type {Object}
     */
    params: {},

    /**
     * Query Parameters
     * @type {Object}
     */
    query: {}
  }, defaults || {});
}

/**
 * Add a resources as a child of this resource.
 * @param {String} name     Resource Name
 * @param {String} path     Resource Path
 * @param {Object} defaults Optional resource level configuration.
 */
Resource.prototype.addResource = function(name, path, defaults) {

  /**
   * Valdiate the name of the resource
   */
  if (/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name) === false) {
    throw new Meteor.Error("invalid-resource", "The resource name (" + name + ") is invalid.");
  }

  /**
   * Trim leading and trailing slashes, and ensure we have leading slash.
   * Assign the name if the path is not set.
   * @type {String}
   */
  path = !!path && path.replace(/^\/|\/$/g, '') || name;

  /**
   * Create a new resource object
   */
  var resource = new Resource(this, name, path, defaults);

  /**
   * Bind the current resource name to this object to allow for
   * function call flow.
   */
  Object.defineProperty(this, resource._name, {
    get: function(id) {
      return resource;
    }
  });

  /**
   * Return the resource context
   */
  return resource;
};

/**
 * Generate a fully-qualified URL.
 * @param  {String} id Optional resource identifier
 * @return {String}    Constructured url
 */
Resource.prototype._url = function(id) {
  /**
   * @todo Figure out a better way to do this.
   */
  if (this._context instanceof Crest) {
    return this._context._url() + this._path + (id ? "/" + id : "");
  }

  return this._context._url() + '/' + this._path + (id ? "/" + id : "");
};

/**
 * Fetch the options combine with it's parent.
 * @param  {Object} options Options mixin for the resource call.
 * @return {Object}         Options
 */
Resource.prototype.getOptions = function(options) {

  return _.deepExtend(
    _.deepExtend(this._context.getOptions(), this._defaults),
    options || {}
  );
};

/**
 * Set an option
 * @param {String} key   Option name
 * @param {*}      value Option value
 */
Resource.prototype.setOption = function(key, value) {
  return this._defaults[key] = value;
};

/**
 * Fetch an option
 * @param  {String} key Option Name
 * @return {*}          Option Value
 */
Resource.prototype.getOption = function(key) {
  return this.getOptions()[key];
};

/**
 * Set a header to all requests
 * @param  {String} key   Header identifer
 * @param  {*}      value Header parameters value
 * @return {*}            Returns the current value if no value is passed.
 */
Resource.prototype.header = function(key, value) {
  if (!value) {
    return this.getOption('headers')[key];
  }

  var opts = {};
  opts[key] = value;

  this.setOption('headers', _.deepExtend(
    this.getOption('headers'), opts
  ));
};

/**
 * Set a parameter to all requests
 * @param  {String} key   Parameter identifer
 * @param  {*}      value Query parameters value
 * @return {*}            Returns the current value if no value is passed.
 */
Resource.prototype.param = function(key, value) {
  if (!value) {
    return this.getOption('params')[key];
  }

  var opts = {};
  opts[key] = value;

  this.setOption('params', _.deepExtend(
    this.getOption('params'),
    opts
  ));
};

/**
 * Set a query parameter to all requests
 * @param  {String} key   Header identifer
 * @param  {*}      value Header parameters value
 * @return {*}            Returns the current value if no value is passed.
 */
Resource.prototype.query = function(key, value) {
  if (!value) {
    return this.getOption('query')[key];
  }

  var opts = {};
  opts[key] = value;

  this.setOption('query', _.deepExtend(
    this.getOption('query'), opts
  ));
};

/**
 * Make a HTTP Request for this resource
 * @param  {String}   method   HTTP Method such as GET, POST, PUT etc.
 * @param  {String}   id       Optional resource identifier
 * @param  {Object}   defaults Optional request level configuration.
 * @param  {Function} callback Optional callback, required on the client side.
 * @return {Object}            HTTP Results, null on the client side.
 */
Resource.prototype.request = function(method, id, options, callback) {

  /**
   * Valdaite callback mechanism
   */
  if (Meteor.isClient && !callback) {
    throw new Meteor.Error("Callback required to make restful requests on the client!.");
  }

  var _options = this.getOptions(options);

  /**
   * Do _options manipulation (preflights?)
   */
  _options = this._processOptions(_options);

  /**
   * Convert _options.query from object to string (if not string already)
   */
  _options.query = this._processQuery(_options.query);

  /**
   * Create a new HTTP.call Method
   */
  return HTTP.call(method.toUpperCase(), this._url(id), _options, callback);
};

/**
 * Runs any functions set in the headers, params or query objects. Removes any
 * keys set to null or false in the query and headers object.  This does NOT
 * affect the params object (i.e. false/null values are allowed).
 * Note: To pass a false/null value in the set the value to string false instead
 * of boolean false.
 * @param  {Object} options Options object
 * @return {Object}         Processed options object
 */
Resource.prototype._processOptions = function(options) {
  var _options = {
    headers: {},
    params: {},
    query: {}
  };

  /**
   * Make a direct copy optional options
   */
  _.each(['content', 'data', 'auth', 'timeout', 'followRedirects'], function(type) {
    if (!!options[type]) {
      _options[type] = options[type];
    }
  });

  /**
   * Process the options which may have callbacks
   */
  _.each(['headers', 'params', 'query'], function(type) {
    _.each(options[type], function(value, key) {

      value = _.isFunction(value) && value() || value;

      /**
       * Pass the value if it is not null or false, or if the type is params
       */
      if ((value !== null && value !== false) || type === 'params') {
        _options[type][key] = value;
      }
    })
  });

  return _options;
};

/**
 * Converts the options value into a string.
 * If query is a string or number, it is assumed it is already processed/encoded.
 * If query is an array it is assumed each value is an encoded string to be joined.
 * If query is a hash, then key value pairs will be evaluated and encoded.
 * Keys with a boolean true value will be set as '?key'.
 * @param  {Object} query Query parmaeters object
 * @return {String}       Encoded query parameters string for Meteor.http.call()
 */
Resource.prototype._processQuery = function(query) {
  var queryParts = [],
    e = encodeURIComponent;
  if (!_.isObject(query)) {
    throw new Error('`options.query` must be an object when making a Crest request - it is converted to a string by Crest');
  }

  _.each(query, function(value, key) {
    if (_.isString(value) || _.isNumber(value)) {
      queryParts.push(e(key) + '=' + e('' + value));
    } else if (_.isArray(value)) {
      /**
       * Assuming strings or numbers
       */
      _.each(value, function(item) {
        queryParts.push(e(key) + '[]=' + e(item));
      });
    } else if (value === true) {
      queryParts.push(e(key));
    } else if (_.isDate(value)) {
      queryParts.push(e(key) + '=' + e(value.toString()))
    }
    /**
     * @todo  what do we do if there is a nested object?
     * I don't think that should be allowed - it's getting complex enough with this!
     */
  });

  return queryParts.join('&')
    .replace(/%20/g, '+');
};

/**
 * Fetch a specific resource or a list of resources.
 * @param  {String}   id       Id if requesting a specific resouce, null if
 *                             listing available resources.
 * @param  {Object}   options  Optional request level configuration.
 * @param  {Function} callback Callback, Client side only
 * @return {Object}            Http Result, null on client side.
 */
Resource.prototype.get = function(id, options, callback) {

  // Single parameter
  if (!id) {
    id = ""
  };
  if (typeof id == 'function') {
    callback = id;
    id = "";
    options = {};
  }
  return this.request("GET", id,
    typeof options == 'object' ? options : {},
    typeof options == 'function' ? options : callback
  );
};

/**
 * Create a new resource
 * @param  {Object}   resource Resource to create
 * @param  {Object}   options  Optional request level configuration.
 * @param  {Function} callback Callback, Client side only
 * @return {Object}            Http Result, null on client side.
 */
Resource.prototype.create = function(resource, options, callback) {
  // Single parameter
  if (!resource) {
    throw new Meteor.Error("invalid-parameters", "'resource' required to create an object");
  }


  callback = typeof options == 'function' ? options : callback;
  options = typeof options != 'object' ? {} : options;

  // Force the data into the params object
  options.data = resource;

  return this.request("POST", "", options, callback);
};

/**
 * Update a resource
 * @param  {String}   id       Id for the resource we are updating.
 * @param  {Object}   resource Object containing updates.
 * @param  {Object}   options  Optional request level configuration.
 * @param  {Function} callback Callback, Client side only
 * @return {Object}            Http Result, null on client side.
 */
Resource.prototype.update = function(id, resource, options, callback) {
  // Single parameter
  if (!id) {
    throw new Meteor.Error("invalid-parameters", "'id' required to update an object");
  }

  /**
   * We must have an update object
   */
  if (!resource) {
    throw new Meteor.Error("invalid-parameters", "'resource' required to update an object");
  }

  callback = typeof options == 'function' ? options : callback;
  options = typeof options != 'object' ? {} : options;

  // Force the data into the params object
  options.data = resource;

  return this.request("PUT", id, options, callback);
};

/**
 * Remove a resource
 * @param  {String}   id       Id of the resource you wish to remove.
 * @param  {Object}   options  Optional request level configuration.
 * @param  {Function} callback Callback, Client side only
 * @return {Object}            Http Result, null on client side.
 */
Resource.prototype.remove = function(id, options, callback) {
  // Single parameter
  if (!id) {
    throw new Meteor.Error("invalid-parameters", "'id' required to remove an object");
  }

  return this.request("DELETE", id,
    typeof options == 'object' ? options : {},
    typeof options == 'function' ? options : callback
  );
};
