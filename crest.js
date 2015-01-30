/**
 *
 * 
 *
 * 
 */

/**
 * Crest class
 * @param {Object} options Option configuration object
 */
Crest = function(options) {
	/**
	 * Force optons to be an object if not passed in.
	 */
	if(typeof options != 'object') {
		throw Meteor.Error("invalid-options", "Client library must be instantiated with a configuration object.");
	};

	/**
	 * Check for the required parameter
	 */
	if(!options.base_url) {
		throw new Meteor.Error("invalid-options", "base_url must be in the configuration");
	}

	/**
	 * Resource container
	 * @private
	 * @type {Array}
	 */
	this._resources = [];

	/**
	 * Remove any trailing slashes from the base url.
	 */
	options.base_url = options.base_url.replace(/\/+$/, "");
	

	/**
	 * Default options for mixin.
	 * @private
	 * @type {Object}
	 */
	this._options = _.extend({

		/**
		 * REST Base URL
		 * @type {String}
		 */
		base_url : null,

		/**
		 * Enable debug to console support
		 * @type {Boolean}
		 */
		debug : false
	}, options || {});
}

/**
 * Export non API Objects under the Crest non-instantiated object.
 * @type {CrestResource}
 */
Crest.Resource = CrestResource;

/**
 * Set authentication credentials
 * @param {String} username Username
 * @param {String} password Password
 */
Crest.prototype.setAuth = function(username, password) {

	/**
	 * @todo Add Basic Auth support
	 */
	throw new Meteor.Error("unsupported", "Basic auth is not currently supported.");
};

/**
 * Add a resource
 * @param {String} name    Resource path
 * @param {String} path    Resoruce path
 *
 * @todo Add support for nested resources.
 */
Crest.prototype.addResource = function(name, path) {
	/**
	 * Convert the name into an acceptible name
	 */
	if(/^[a-z0-9]+$/i.test(name) === false) {
		throw new Meteor.Error("invalid-resource", "Resource names can only be alpha-numeric.");
	}

	/**
	 * Optional path
	 */
	path = path || name;

	/**
	 * Convert the name to lowercase.
	 */
	name = name.toLowerCase();

	/**
	 * Remove any training slashes or start slashes from the resource name.
	 */
	path.replace(/\/+$/, "").replace(/^\/+/, "");

	/**
	 * Assure that name isn't already assigned to the API
	 */
	if(this.hasOwnProperty(name)) {
		throw new Meteor.Error("invalid-resource", "Duplicate resource added.");
	}

	/**
	 * Create a new resource class and assign it to the resources continer.
	 */
	this._resources[name] = new CrestResource(this, name, path)

	/**
	 * @todo Validate the name isn't being used in this class
	 * @todo Push the resurce nto the {this._resources} container.
	 */
	Object.defineProperty(this, name, {
		get : function() {
			return this._resources[name]
		}.bind(this)
	});
};

/**
 * Return an object from the context
 * @param  {String} option 	Option key
 * @return {*}      		Return the value of hte option, or null if doesn't exists
 */
Crest.prototype.getOption = function(option) {
	return option in this._options ? this._options[option] : null;
};