Package.describe({
  /**
   * Package Name
   * @type {String}
   */
  name: 'centiq:crest',

  /**
   * Pacakge Version
   * @type {String}
   */
  version: '0.0.1',

  /**
   * Pacakge summery
   * @type {String}
   */
  summary: '',

  /**
   * Package git link
   * @type {String}
   */
  git: '',

  /**
   * Package documentation
   *
   * By default, Meteor will default to using README.md for documentation.
   * To avoid submitting documentation, set this field to null.
   * 
   * @type {String}
   */
  documentation: 'README.md'
});

/**
 * Package runtime confguration
 */
Package.onUse(function(api) {
  /**
   * Version requirements
   */
  api.versionsFrom('1.0.3.1');

  /**
   * Dependancies
   */
  api.use('underscore');
  api.use('http');

  /**
   * Helper variables
   */
  var both = ['client', 'server'];

  /**
   * Files
   */
  api.addFiles('lib/deep_extend_mixin.js', both);
  api.addFiles("lib/shared/resource.js", both);
  api.addFiles("lib/shared/crest.js", both);

  /**
   * Exports
   */
  api.export("Crest");
});

/**
 * Package test configuration.
 */
Package.onTest(function(api) {
  /**
   * Dependancies
   */
  api.use('tinytest');
  api.use('centiq:crest');

  /**
   * Files
   */
  api.addFiles("tests/api.js");
  api.addFiles("tests/resources.js");
  api.addFiles("tests/requests.js");
});