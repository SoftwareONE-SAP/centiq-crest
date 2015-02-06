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
Crest = function Crest(options) {
	/**
	 * Default properties.
	 */
	this._options = _.extend({
		/**
		 * Set the base_url
		 */
		base_url : null,

		/**
		 * Optional http configuration for all resources.
		 * @type {Object}
		 */
		defaults : {}
	}, options || {});

	/**
	 * Validate the base_url.
	 */
	if(!this.getOption('base_url')) {
		throw new Meteor.Error("invalid-options", "base_url required.");
	}

	/**
	 * Trim the trailing slash from the base_url
	 */
	this.setOption('base_url', this.getOption('base_url').replace(/\/$/, ""));

	/**
	 * Create a root resource objecy
	 * @type {Crest}
	 */
	this.__root__ = new Crest.Resource(this, '__root__', '/', this.getOption('defaults'));
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
		get : function() { return resource; }
	});
};

/**
 * Set an option
 * @param {String} 	key   Option name
 * @param {*} 		value Option value
 */
Crest.prototype.setOption = function(key, value) {
	this._options[key] = value;
};

/**
 * Fetch an option
 * @param  {String} key Option Name
 * @return {*}      Option Value
 */
Crest.prototype.getOption = function(key) {
	return this._options[key];
};