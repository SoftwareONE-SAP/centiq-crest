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
 * @param {Crest} context   Crest object used to create the resource
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
  this._defaults = {

    /**
     * Query Parameters
     * @type {Object}
     */
    query: {},

    /**
     * Parameters Object
     * @type {Object}
     */
    params: {},

    /**
     * Header Parameters
     * @type {Object}
     */
    headers: {}
  };

  /**
   * Insert any default values
   */
  _.each(defaults, function(values, type) {
    _.each(values, function(value, key) {
      this._setOption(type, key, value);
    });
  });

  if (Meteor.isClient) {
    /**
     * Get the cursor for this resource and set up added/changed callbacks
     *
     * @todo  investigate deleted callback and removing parameters from Crest options
     */
    var self = this;

    this._cursor = CrestOptions.find({
      resource: this._resourcePath()
    });
    this._cursor.observe({
      added: function(doc) {
        self._setOption(doc.type, doc.key, doc.value);
      },
      changed: function(doc /*, oldDoc */ ) {
        self._setOption(doc.type, doc.key, doc.value);
      }
    });
  }
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
 *
 * On the server there will be no defaults set, all values must be fetched from
 * the collection.
 * @param  {Object} options Options mixin for the resource call.
 * @return {Object}         Options
 */
Resource.prototype._getOptions = function(options) {
  var _options = this._defaults;

  if (Meteor.isServer) {
    _.each(CrestOptions.find({
        resource: this._resourcePath()
      })
      .fetch(),
      function(option) {
        _options[option.type][option.key] = option.value;
      });
  }

  return _.deepExtend(
    _.deepExtend(this._context._getOptions(), _options),
    options || {}
  );
};

/**
 * Process the options for passing to the request.  This builds the query string
 * from the query object.
 * @param  {Object} options Options mixin for the resource call.
 * @return {Object}         Options
 */
Resource.prototype.getOptions = function(options) {

  var _options = this._getOptions(options);

  _options.query = _.map(_options.query, function(value, key) {
      if (Object.prototype.toString.call(value) === '[object Array]') {
        return key + '[]=' + value.join('&key[]=');
      }
      return key + '=' + value;
    })
    .join('&');

  return _options;
};

/**
 * Set an option locally, then persist to the server
 * @param {String} type      Option type [headers|params|query]
 * @param {String} key       Option name
 * @param {*}      value     Option value
 * @param {String} sessionId Server only - session id for client connection
 */
Resource.prototype.setOption = function(type, key, value, sessionId) {
  if (Meteor.isClient) {
    this._setOption(type, key, value);
  }
  return Meteor.call('__crest_setOption', this._resourcePath(), type, key, value, sessionId);
};

Resource.prototype._setOption = function(type, key, value) {
  var opts = {};
  opts[key] = value;

  return this._defaults[type] = _.deepExtend(
    this.getOption(type),
    opts
  );
};


/**
 * Fetch an option
 * @param  {String} key Option Name
 * @return {*}          Option Value
 */
Resource.prototype.getOption = function(key) {
  return this._getOptions()[key];
};

/**
 * Set a parameter to the query object of all requests
 * @param  {String} key   Parameter identifer
 * @param  {*}      value Query parameters value
 * @param  {String} sessionId Server only - session id for client connection
 * @return {*}            Returns the current value if no value is passed.
 */
Resource.prototype.query = function(key, value, sessionId) {
  if (!value) {
    return this.getOption('query')[key];
  }
  this.setOption('query', key, value, sessionId);
};

/**
 * Set a parameter to the params object of all requests
 * @param  {String} key   Parameter identifer
 * @param  {*}      value Query parameters value
 * @param  {String} sessionId Server only - session id for client connection
 * @return {*}            Returns the current value if no value is passed.
 */
Resource.prototype.param = function(key, value, sessionId) {
  if (!value) {
    return this.getOption('params')[key];
  }
  this.setOption('params', key, value, sessionId);
};

/**
 * Set a header to all requests
 * @param  {String} key       Header identifer
 * @param  {*}      value     Header parameters value
 * @param  {String} sessionId Server only - session id for client connection
 * @return {*}                Returns the current value if no value is passed.
 */
Resource.prototype.header = function(key, value, sessionId) {
  if (!value) {
    return this.getOption('headers')[key];
  }
  this.setOption('headers', key, value, sessionId);
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

  /**
   * Create a new HTTP.call Method
   */
  return HTTP.call(method.toUpperCase(), this._url(id), this.getOptions(options), callback);
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

/**
 * Get the unique resource path for this resource
 * @return {String} Unique resource path
 */
Resource.prototype._resourcePath = function() {
  return this._context._resourcePath() + '.' + this._name;
}



/**
 * Server side path
 * - Get Session Id from Method call
 * - Pass in to options
 * - if options.session ignore _defaults?
 *
 */
