
/**
 * Test base API Interface
 */
Tinytest.add('Crest', function (test) {
	/**
	 * Basic Assertions.
	 */
	test.equal(typeof Crest, 'function');

	/**
	 * Make sure the crest lirary throws an error if instantated without
	 * a configuration object.
	 */
	test.throws(function(){ new Crest(); }, Meteor.Error);

	/**
	 * No base url
	 */
	test.throws(function(){ new Crest(); }, Meteor.Error);
});

/**
 * Test API Resources
 */
Tinytest.add('Crest - Resource', function (test) {

	/**
	 * Create a new Crest object
	 * @type {Crest}
	 */
	var crest = new Crest({
		base_url: "http://localhost:3002/"
	});

	/**
	 * Make sure option lookups are working fine.
	 *
	 * note, the last slash is trimmed by the crest library.
	 */
	test.equal(crest.getOption('base_url'), "http://localhost:3002");

	/**
	 * Asser there are no inital resources
	 */
	test.equal(Object.keys(crest._resources).length, 0);

	/**
	 * Add a resource
	 */
	crest.addResource('posts');
	crest.addResource('comments');

	/**
	 * Test array based insertion.
	 * @type {String}
	 */
	crest.addResource([
		{name: "albums"},
		{name: "photos"},
		{name: "users", path: "/accounts"},
		{name: "todos"}
	]);

	/**
	 * Assert there is one new resources
	 */
	test.equal(Object.keys(crest._resources).length, 6);

	/**
	 * Make sure the resoruce was bound to the API
	 */
	test.equal(typeof crest.posts, 'object');

	/**
	 * Test fo basic crud endpoints
	 */
	test.equal(typeof crest.comments.get, 'function');
	test.equal(typeof crest.albums.remove, 'function');
	test.equal(typeof crest.photos.create, 'function');
	test.equal(typeof crest.users.update, 'function');
});

/**
 * Test fetching all entities
 */
Tinytest.addAsync("Crest - API - HTTP Fetch All api.posts.get()", function(test, next){		
	/**
	 * Create a new Crest object
	 * @type {Crest}
	 */
	var crest = new Crest({
		base_url: "http://localhost:3002/"
	});

	/**
	 * Add a resource
	 */
	crest.addResource('posts');

	/**
	 * A reusable function to validate the response
	 */
	var _testServerResponses = function(response) {
		test.isNotNull(response);

		/**
		 * Validate the length
		 */
		test.ok(response.data);
		test.ok(response.content);
		test.ok(response.statusCode);
		test.equal(response.statusCode, 200);
		test.equal(response.data.length, 100);
	}

	if(Meteor.isServer) {
		/**
		 * Do server tests
		 */
		_testServerResponses(crest.posts.get());
		return next();
	}

	if(Meteor.isClient) {

		/**
		 * Test the lsiting of objects
		 */
		crest.posts.get(function(error, response){
			/**
			 * Test for error
			 */
			test.isNull(error);

			/**
			 * Test teh results
			 */
			_testServerResponses(response)

			// Continie
			next();
		});
	}
});

/**
 * Test fetching a single entity from the server
 */
Tinytest.addAsync("Crest - API - HTTP Fetch One api.posts.get(1)", function(test, next){
	/**
	 * Create a new Crest object
	 * @type {Crest}
	 */
	var crest = new Crest({
		base_url: "http://localhost:3002/"
	});

	/**
	 * Add a resource
	 */
	crest.addResource('posts');

	/**
	 * A reusable function to validate the response
	 */
	var _testServerResponses = function(response) {
		test.isNotNull(response);

		/**
		 * Validate the length
		 */
		test.ok(response.data);
		test.ok(response.content);
		test.ok(response.statusCode);
		test.equal(response.statusCode, 200);

		/**
		 * Check for a post ID
		 */
		test.equal(response.data.id, 1);
	}

	if(Meteor.isServer) {
		/**
		 * Do server tests
		 */
		_testServerResponses(crest.posts.get(1));
		return next();
	}

	if(Meteor.isClient) {

		/**
		 * Test the lsiting of objects
		 */
		crest.posts.get(1, function(error, response){
			/**
			 * Test for error
			 */
			test.isNull(error);

			/**
			 * Test teh results
			 */
			_testServerResponses(response)

			// Continie
			next();
		});
	}
});

/**
 * POST a Resource
 */
Tinytest.addAsync("Crest - API - HTTP Create api.posts.create({})", function(test, next){

	/**
	 * Create a new Crest object
	 * @type {Crest}
	 */
	var crest = new Crest({
		base_url: "http://localhost:3002/"
	});

	/**
	 * Add a resource
	 */
	crest.addResource('posts');

	var post = {
		"title" 	: "created via test suite."
	};

	var _testServerResponse = function(response) {
		test.equal(response.statusCode, 200);
		test.ok(response.data);
		test.equal(response.data.title, post.title);
	}

	/**
	 * Server side
	 */
	if(Meteor.isServer) {
		_testServerResponse(crest.posts.create(post));
		return next();
	}

	crest.posts.create(post, function(error, response){
		test.isNull(error);
		_testServerResponse(response);
		next();
	})
});

/**
 * Delete a Resource
 */
Tinytest.addAsync("Crest - API - HTTP Fetch One api.posts.remove(1)", function(test, next){

	/**
	 * Create a new Crest object
	 * @type {Crest}
	 */
	var crest = new Crest({
		base_url: "http://localhost:3002/"
	});

	/**
	 * Add a resource
	 */
	crest.addResource('posts');

	/**
	 * Make sure we throw an excetion when delete does not require a paramter
	 */
	try{
		crest.posts.remove(null, function(){});
	}catch(e) {
		test.equal(e.error, 'invalid-parameters');
	}

	var _testServerResponse = function(response) {

		test.equal(response.statusCode, 204);
		test.equal(response.data, null);
	}

	/**
	 * Server side
	 */
	if(Meteor.isServer) {
		_testServerResponse(crest.posts.remove(1));
		return next();
	}

	crest.posts.remove(1, function(error, response){
		test.isNull(error);
		_testServerResponse(response);
		next();
	})
});

/**
 * Delete a Resource
 */
Tinytest.addAsync("Crest - API - HTTP Fetch One api.posts.update(1, {..})", function(test, next){
	/**
	 * Create a new Crest object
	 * @type {Crest}
	 */
	var crest = new Crest({
		base_url: "http://localhost:3002/"
	});

	/**
	 * Add a resource
	 */
	crest.addResource('posts');

	var _testServerResponse = function(response) {

		test.equal(response.statusCode, 200);
		test.ok(response.data);
		test.ok(response.data.title);
		test.equal(response.data.title, "Updated..");
	}

	/**
	 * Server side
	 */
	if(Meteor.isServer) {
		_testServerResponse(crest.posts.update(1, {title: "Updated.."}));
		return next();
	}

	crest.posts.update(1, {title: "Updated.."}, function(error, response){
		test.isNull(error);
		_testServerResponse(response);
		next();
	})
});
