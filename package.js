Package.describe({
  // Package Name
  name: 'centiq:crest',

  //Package Version
  version: '0.0.1',

  // Brief, one-line summary of the package.
  summary: 'Centiq rest is a generic rest library.',

  // URL to the Git repository containing the source code for this package.
  git: '',

  // Readme file
  documentation: 'README.md'
});

/**
 * Configure package
 */
Package.onUse(function(api) {
  /**
   * Expose
   */
  api.versionsFrom('1.0.3.1');

  /**
   * Dependancies
   */
  api.use('http');
  api.use('underscore');

  var both = ['server', 'client'];

  /**
   * Add server files
   */
  api.addFiles('crest.js',    both);
  api.addFiles('resource.js', both);

  /**
   * Export crest externally
   */
  api.export([
    'Crest',
    'CrestResource'
  ], both);
});

/**
 * Configure Tests
 */
Package.onTest(function(api) {
  api.use('tinytest');
  api.use('centiq:crest');
  api.addFiles('crest-tests.js');
});
