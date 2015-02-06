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
Tinytest.add("Crest API - Resources", function(test){
	/**
	 * Test the resources object
	 */
	var client = new Crest({
		base_url: "http://localhost:3002/"
	});

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
	test.equal(client.support._url("Yhi7-O8NG"), "http://localhost:3002/support/Yhi7-O8NHG");

	test.equal(client.support.tickets._url(), "http://localhost:3002/support/tickets");
	test.equal(client.support.tickets._url("Yhi7-O8NHG"), "http://localhost:3002/support/tickets/Yhi7-O8NHG");
});