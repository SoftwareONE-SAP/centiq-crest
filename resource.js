/**
 * 
 */

/**
 * Crest.Resource
 * @param {Crest} context Crest API interface
 * @param {String} name    Name of the resource, used for debugging
 * @param {Stirng} path    API Path for the resource
 */
CrestResource = function(context, name, path) {
	/**
	 * Crest resource
	 * @type {Crest}
	 */
	this._context = context;

	/**
	 * Resrource Name
	 * @type {String}
	 */
	this._name = name;

	/**
	 * Resrource Name
	 * @type {String}
	 */
	this._path = path;
}

/**
 * Build a URL For a specific request
 * @param  {String} objectID  	Resource ID
 * @return {Stirng}       Built URL.
 */
CrestResource.prototype._buildUrl = function(objectID) {
	return this._context.getOption('base_url') + '/' + this._path + "/" + objectID;
};

/**
 * Makea request
 * @param  {[type]} method        [description]
 * @param  {[type]} options       [description]
 * @param  {[type]} asyncCallback [description]
 * @return {[type]}               [description]
 */
CrestResource.prototype.request = function(method, id, options, asyncCallback) {
	/**
	 * Build the URL
	 */
	 this._buildUrl(id);

	 /**
	  * Valdaite callback mechanism
	  */
	 if(Meteor.isClient && !asyncCallback)
	 	throw new Meteor.Error("Callabck required to make restful requests on the client!.");

	 /**
	  * Create a new HTTP.call Method
	  */
	 return HTTP.call(method.toUpperCase(), this._buildUrl(id), _.extend({
	 	/**
	 	 * We should populate this object with default parameters from the
	 	 * api context object.
	 	 */
	 }, options/*Override the defaults above*/), asyncCallback);
};

/**
 * Fetch a resource or a list of resources from the current endpoint
 * @param  {Number|String?}  opt_id   	Optional Identifier if returning once instance
 *                                     	of th object.
 * @param  {Object|String?}  opt_params Optional query parameters for this request, could
 *                                      also be an object map.
 *
 * @todo Refactor the checks for the arguments
 */
CrestResource.prototype.get = function(opt_id, opt_params, opt_callback) {

	// Single parameter
	if(!opt_id) opt_id = "";
	if(typeof opt_id == 'function') {opt_callback = opt_id; opt_id = "";}

	return this.request("GET", opt_id,
		typeof opt_params == 'object' ? opt_params : {},
		typeof opt_params == 'function' ? opt_params : opt_callback
	);
};

/**
 * Fetch a List of resources from the current endpoint
 * @param  {Object|String?}  opt_params Optional query parameters for this request, could
 *                                      also be an object map.
 */
CrestResource.prototype.list = function(opt_params) {
	return this.get(null, opt_params);
};

/**
 * Update a resource
 * @param  {Number|String} 	id   		Object idnetifier
 * @param  {Object} 		updates 	Object update object.
 */
CrestResource.prototype.update = function(id, updates) {

};

/**
 * Create a new resource
 * @param  {Object} object Object to create
 */
CrestResource.prototype.create = function(object, opt_params, opt_callback) {
	// Single parameter
	if(!object)
		throw new Meteor.Error("invalid-parameters", "'object' required to create an object");


	opt_callback 	= typeof opt_params == 'function' 	? opt_params 	: opt_callback;
	opt_params 		= typeof opt_params != 'object' 	? {} 			: opt_params;

	// Force the data into the params object
	opt_params.data = object;

	return this.request("POST", "", opt_params, opt_callback);
};

/**
 * Delete a resource
 * @param  {String} id Object identier of what we are deleteing.
 */
CrestResource.prototype.remove = function(id, opt_params, opt_callback) {

	// Single parameter
	if(!id)
		throw new Meteor.Error("invalid-parameters", "'id' required to remove an object");

	return this.request("DELETE", id,
		typeof opt_params == 'object' ? opt_params : {},
		typeof opt_params == 'function' ? opt_params : opt_callback
	);
};