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
 * API Tests
 */
Tinytest.addAsync("Crest API - Requests", function(test, next){
	/**
	 * Create a new Crest Resource
	 */
	var crest = new Crest({
		base_url: "http://localhost:3002/"
	});

	/**
	 * Add a resources
	 */
	crest.addResource("posts");

	/**
	 * Request Handler
	 */
	var _requestHandler = function(response) {
		test.ok(response);
		test.equal(response.statusCode, 200);
		test.equal(typeof response.headers, typeof []);
		test.equal(response.headers['content-type'], 'application/json; charset=utf-8');
		test.equal(typeof response.data, typeof []);
		test.equal(response.data.length, 100);
	};

	if(Meteor.isServer){
		_requestHandler(crest.posts.get());
		return next();
	}

	if(Meteor.isClient){
		crest.posts.get(function(err, response){
			if(err)
				throw err;
			_requestHandler(response);
			next();
		});
	}
});

/**
 * Test a single root level request
 */
Tinytest.addAsync("Crest API - Requests - Single Resource", function(test, next){
	/**
	 * Create a new Crest Resource
	 */
	var crest = new Crest({
		base_url: "http://localhost:3002/"
	});

	/**
	 * Add a resources
	 */
	crest.addResource("posts");

	/**
	 * Request Handler
	 */
	var _requestHandler = function(response) {
		test.ok(response);
		test.equal(response.statusCode, 200);
		test.equal(typeof response.headers, typeof []);
		test.equal(response.headers['content-type'], 'application/json; charset=utf-8');
		test.equal(typeof response.data, typeof {});
	};

	if(Meteor.isServer){
		_requestHandler(crest.posts.get(1));
		return next();
	}

	if(Meteor.isClient)
		crest.posts.get(1, function(err, response){
			if(err)
				throw err;
			_requestHandler(response);
			next();
		});
});



/**
 * Test a single root level request
 */
Tinytest.addAsync("Crest API - Requests - Child Resource", function(test, next){
	/**
	 * Create a new Crest Resource
	 */
	var crest = new Crest({
		base_url: "http://localhost:3002/"
	});
	crest.param('X-Test-Token', 'testing');
	crest.header('X-Test-Token', 'testing');
	crest.header('Access-Control-Allow-Headers', 'X-Test-Token');

	/**
	 * Add a resources
	 */
	crest.addResource("posts");

	/**
	 * Request Handler
	 */
	var _requestHandler = function(response) {
		test.ok(response);
		test.equal(response.statusCode, 200);
		test.equal(typeof response.headers, typeof []);
		test.equal(response.headers['content-type'], 'application/json; charset=utf-8');
		test.equal(typeof response.data, typeof {});
		console.log(response);
	};

	if(Meteor.isServer){
		_requestHandler(crest.posts.get(1));
		return next();
	}

	if(Meteor.isClient)
		crest.posts.get(1, function(err, response){
			if(err)
				throw err;
			_requestHandler(response);
			next();
		});
});