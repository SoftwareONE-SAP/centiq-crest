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
Tinytest.add("Crest API", function(test) {
  /**
   * Create a new Crest Resource
   */
  var crest = new Crest({
    base_url: "http://localhost:3002/"
  });

  /**
   * Create a root support resources that has an api key
   * attached to all requests
   */
  crest.addResource("support", null, {
    headers: {
      'X-Api-Token': 'some super secret string'
    }
  });

  /**
   * Let's add some sub resources.
   */
  crest.support.addResource("tickets");
  crest.support.addResource("objects");

  /**
   * Some sub-sub resources.
   *
   * @note the addResources returns an instance of the
   *       newly created resources, you can use that variable
   *       to add more sub resources.
   */
  var slas = crest.support.objects.addResource("slas");
  var teams = crest.support.objects.addResource("teams");

  /**
   * Test the options getter/setter
   */
  crest.setOption("_sample", 'ok');
  test.equal(crest.getOption('_sample'), 'ok');

  /**
   * Test some general configuration.
   *
   * note, base_url has the trailing slash stripped off.
   */
  test.equal(crest._url(), 'http://localhost:3002');

  /**
   * Test that that we have a support subject
   */
  test.equal('support' in crest, true);
  test.equal('supports' in crest, false);
  test.equal('objects' in crest.support, true);
  test.equal('slas' in crest.support.objects, true);
  test.equal(crest.support.objects.slas, slas);
  test.equal(crest.support.objects.teams, teams);
});
