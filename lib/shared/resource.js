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
 * @param {String} name    Resource Name
 * @param {String} path    Resource URI
 * @param {Object} options Optional parameters for HTTP Requests.
 */
Resource = function Resource(context, name, path, options) {
	/**
	 * Validate context is a Crest Object
	 */
	if(!(context instanceof Crest)) {
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
	 * Extend the options
	 */
	this._options = _.extend({

	}, options || {})
}

/**
 * Add a resources as a child of this resource.
 * @param {String} name    Resource Name
 * @param {String} path    Resource Path
 * @param {Object} options Optional resource level configuration.
 */
Resource.prototype.addResource = function(name, path, options) {

	/**
	 * Valdiate the name of the resource
	 */
	if(/^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name) === false) {
		throw new Meteor.Error("invalid-resource", "The resource name (" + name + ") is invalid.");
	}

	/**
	 * Assign the path to the name if the path is not set
	 * @type {String}
	 */
	path = path || "/" + name;

	/**
	 * Extend the path with the current resource route.
	 * @type {String}
	 */
	path = this._path == '/' ? path : this._path + path;

	/**
	 * Extend the parents options with the options in this object
	 */
	options = /*_.extend*/_.deepExtend(this._options, options);

	/**
	 * Create a new resource object
	 */
	var resource = new Resource(this._context, name, path, options);

	/**
	 * Bind the current resource name to this object to allow for
	 * function call flow.
	 */
	Object.defineProperty(this, resource._name, {
		get : function() { return  resource; }
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
	return this._context.getOption('base_url') + this._path + (id ? "/" + id : "");
};

/**
 * Make a HTTP Request for this resource
 * @param  {String} method        	HTTP Method such as GET, POST, PUT etc.
 * @param  {String} id            	Optional resource identifier
 * @param  {Object} options       	Optional request level configuration.
 * @param  {Function} callback      Optional callback, required on the client side.
 * @return {Object}               	HTTP Results, null on the client side.
 */
Resource.prototype.request = function(method, id, options, callback) {
	/**
	 * Build the URL
	 */
	 this._url(id);

	 /**
	  * Valdaite callback mechanism
	  */
	 if(Meteor.isClient && !callback)
	 	throw new Meteor.Error("Callback required to make restful requests on the client!.");

	/**
	 * Create a local symbol to the current instnace.
	 * @type {Resource}
	 */
	 var that = this;

	 /**
	  * Create a new HTTP.call Method
	  */
	 return HTTP.call(method.toUpperCase(), this._url(id), _.extend(this._options, options), callback);
};

/**
 * Fetch a specific resource or a list of resources.
 * @param  {String}   id       Id if requesting a specific resouce, null if
 *                             listing available resources.
 * @param  {Object}   options  Optional request level configuration.
 * @param  {Function} callback Callback, Client side only
 * @return {Object}            Http Result, null on client side.
 */
Resource.prototype.get 		= function(id, options, callback) {

	// Single parameter
	if(!id) id = "";
	if(typeof id == 'function') {callback = id; id = ""; options = {};}
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
Resource.prototype.create 	= function(resource, options, callback) {
	// Single parameter
	if(!resource)
		throw new Meteor.Error("invalid-parameters", "'resource' required to create an object");


	callback 	= typeof options == 'function' 	? options 	: callback;
	options 	= typeof options != 'object	' 	? {} 		: options;

	// Force the data into the params object
	options.data = resource;

	return this.request("POST", "", options, callback);
};

/**
 * Update a resource
 * @param  {String}	  id       Id for the resource we are updating.
 * @param  {Object}   resource Object containing updates.
 * @param  {Object}   options  Optional request level configuration.
 * @param  {Function} callback Callback, Client side only
 * @return {Object}            Http Result, null on client side.
 */
Resource.prototype.update 	= function(id, resource, options, callback) {
	// Single parameter
	if(!id)
		throw new Meteor.Error("invalid-parameters", "'id' required to update an object");

	/**
	 * We must have an update object
	 */
	if(!resource)
		throw new Meteor.Error("invalid-parameters", "'resource' required to update an object");

	callback 	= typeof options == 'function' 	? options 	: callback;
	options 	= typeof options != 'object	' 	? {} 		: options;

	// Force the data into the params object
	options.data = resource;

	return this.request("PUT", id, options, callback);
};

/**
 * Remove a resource
 * @param  {[type]}   id       Id of the resource you wish to remove.
 * @param  {Object}   options  Optional request level configuration.
 * @param  {Function} callback Callback, Client side only
 * @return {Object}            Http Result, null on client side.
 */
Resource.prototype.remove 	= function(id, options, callback) {
	// Single parameter
	if(!id)
		throw new Meteor.Error("invalid-parameters", "'id' required to remove an object");

	return this.request("DELETE", id,
		typeof options == 'object' ? options : {},
		typeof options == 'function' ? options : callback
	);
};