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
Tinytest.add("Crest API - Resources - Nesting", function(test){
	/**
	 * Test the resources object
	 */
	var client = new Crest({
		base_url: "http://localhost:3002/"
	},
	{params : {access_token: "abc123"}});

	/**
	 * Create resources
	 */
	client.addResource("support");

	/**
	 * Add some sub documents
	 */
	client.support.addResource("tickets");

	/**
	 * Go three deep!
	 */
	client.support.tickets.addResource("objects");

	test.equal(client.support._url(), "http://localhost:3002/support");
	test.equal(client.support._url(1), "http://localhost:3002/support/1");
	test.equal(client.support._url("Yhi7-O8NHG"), "http://localhost:3002/support/Yhi7-O8NHG");

	test.equal(client.support.tickets._url(), "http://localhost:3002/support/tickets");
	test.equal(client.support.tickets._url("Yhi7-O8NHG"), "http://localhost:3002/support/tickets/Yhi7-O8NHG");

	client.setOption("params", {access_token: "modified_first"});
	test.equal(client.support.getOption('params')['access_token'], "modified_first");
});


/**
 * Test _url for different path specifications
 */
Tinytest.add("Crest API - Resources - URL validity", function(test, next){
	/**
	 * Create a new Crest Resource
	 */
	var crest = new Crest({
	base_url: "http://localhost:3002/"
	});

	/**
	 * Add a resources with different styles of path
	 */
	crest.addResource("posts");
	crest.addResource("users", "users");
	crest.addResource("organisations", "/organisations/");
	crest.posts.addResource("comments", "/comments/");
	crest.posts.addResource("shares", "shares");

	/**
	 * Test private _url function returns correct url
	 */
	test.equal(crest.posts._url(), "http://localhost:3002/posts", "Path from name");
	test.equal(crest.users._url(), "http://localhost:3002/users", "Path with no slashes");
	test.equal(crest.organisations._url(), "http://localhost:3002/organisations", "Path with slashes");
	test.equal(crest.posts.comments._url(), "http://localhost:3002/posts/comments", "Sub-resource path with slashes");
	test.equal(crest.posts.shares._url(), "http://localhost:3002/posts/shares", "Sub-resource path without slashes");
});

/**
 * Parameters
 */
Tinytest.add("Crest API - Resources - Options - Params", function(test){
	/**
	 * Create a new Crest Resource
	 */
	var crest = new Crest({
		base_url: "http://localhost:3002/"
	});

	var initialValue = 'initial';

	/**
	 * Create an initial resource
	 */
	crest.addResource('before');
	
	/**
	 * Set the first paramteter
	 */
	crest.param('initialValue', initialValue);

	/**
	 * After child resource
	 */
	crest.before.addResource('after');
	test.equal(crest.before.param('initialValue'), initialValue);
	test.equal(crest.before.after.param('initialValue'), initialValue);

	/**
	 * When we set a parameter on a sub resource, it should not effect any parent resource.
	 */
	crest.before.param('initialValue', initialValue + 'modified');

	test.equal(crest.param('initialValue'), initialValue);
	test.equal(crest.before.param('initialValue'), initialValue + 'modified');
	test.equal(crest.before.after.param('initialValue'),  initialValue + 'modified');
});

/**
 * Parameters
 */
Tinytest.add("Crest API - Resources - Options - Headers", function(test){
	/**
	 * Create a new Crest Resource
	 */
	var crest = new Crest({
		base_url: "http://localhost:3002/"
	});

	var initialValue = 'initial';

	/**
	 * Create an initial resource
	 */
	crest.addResource('before');
	
	/**
	 * Set the first paramteter
	 */
	crest.header('initialValue', initialValue);

	/**
	 * After child resource
	 */
	crest.before.addResource('after');
	test.equal(crest.before.header('initialValue'), initialValue);
	test.equal(crest.before.after.header('initialValue'), initialValue);

	/**
	 * When we set a header on a sub resource, it should not effect any parent resource.
	 */
	crest.before.header('initialValue', initialValue + 'modified');

	test.equal(crest.header('initialValue'), initialValue);
	test.equal(crest.before.header('initialValue'), initialValue + 'modified');
	test.equal(crest.before.after.header('initialValue'),  initialValue + 'modified');
});