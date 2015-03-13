/**
 * Unit tests for the Crest object
 */
Tinytest.add("centiq:crest - Crest - Instantiation", function(test) {

  var crest = null;

  /**
   * Test errors when no base_url passed
   */
  try {
    crest = new Crest();
  } catch (error) {
    test.equal(error.error, 'invalid-options');
    test.equal(error.reason, 'base_url required.');
  }

  /**
   * Test the URL is as expected
   */
  crest = new Crest({
    base_url: "http://localhost:3002"
  });
  test.equal(crest._url(), "http://localhost:3002");

  /**
   * Test the URL is as expected (trims trailling slashe)
   */
  crest = new Crest({
    base_url: "http://localhost:3002/"
  });
  test.equal(crest._url(), "http://localhost:3002");

  /**
   * Sets up a root resource
   */
  test.isTrue(!!crest.__root__);
  test.instanceOf(crest.__root__, Crest.Resource);
});

/**
 * Testing that defaults and options get set on root resource
 */
Tinytest.add("centiq:crest - Crest - Defaults", function(test) {
  var crest = null,
    resource = null,
    origResource = Crest.Resource,
    tempResource = function(context, name, path, defaults) {
      this._defaults = defaults;
    };

  /**
   * For these test we just need a dummy resource
   */
  Crest.Resource = tempResource;

  /**
   * Test the defaults get passed
   */
  var defaults = {
    the: 'defaults'
  };
  crest = new Crest({
    base_url: "http://localhost:3002"
  }, defaults);
  resource = crest.__root__;

  test.equal(resource._defaults, defaults);

  /**
   * Reset Crest.Resource
   */
  Crest.Resource = origResource;
});

Tinytest.add('centiq:crest - Crest - Options', function(test) {
  crest = new Crest({
    base_url: "http://localhost:3002/"
  });

  /**
   * getOptions method returns an empty object for the resource chain
   */
  test.equal(crest.getOptions(), {});
});

/**
 * Testing that defaults and options get set on root resource
 */
Tinytest.add("centiq:crest - Crest - Options - Proxy requests to Resource", function(test) {
  var crest = null,
    resource = null,
    origResource = Crest.Resource,
    tempResource = function(context, name, path, defaults) {
      this._defaults = defaults;
      this.setOption = function(key, value) {
        return arguments.length;
      };
      this.getOption = function() {
        return 'option';
      };
      this.header = function() {
        return this.setOption.apply(this, arguments);
      };
      this.param = function() {
        return this.setOption.apply(this, arguments);
      };
      this.query = function() {
        return this.setOption.apply(this, arguments);
      }
    };

  /**
   * For these test we just need a dummy resource
   */
  Crest.Resource = tempResource;

  /**
   * Test the method proxies
   */
  crest = new Crest({
    base_url: "http://localhost:3002"
  });

  /**
   * getOption and setOption
   */
  test.equal(crest.getOption('anOption'), 'option');
  test.equal(crest.setOption('key', 'value'), 2);

  /**
   * Setters
   */
  test.equal(crest.header('key', 'value'), 2);
  test.equal(crest.param('key', 'value'), 2);
  test.equal(crest.query('key', 'value'), 2);

  /**
   * Getters
   */
  test.equal(crest.header('key'), 1);
  test.equal(crest.param('key'), 1);
  test.equal(crest.query('key'), 1);

  /**
   * Reset Crest.Resource
   */
  Crest.Resource = origResource;
});
