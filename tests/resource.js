/**
 * Unit tests for the resource
 */
Tinytest.add('centiq:crest - Resource - Instantiation', function(test) {
  var resource = null,
    crest = new Crest({
      base_url: 'http://localhost:3002/'
    });

  /**
   * Errors if no context passed
   */
  try {
    resource = new Crest.Resource();
  } catch (error) {
    test.equal(error.error, 'invalid-context');
    test.equal(error.reason, "The context passed to the Resource is invalid.");
  }

  /**
   * Accepts a Crest instantiation as a context
   */
  resource = new Crest.Resource(crest);
  test.instanceOf(resource._context, Crest);

  /**
   * Accepts a Crest.Resource instantiation as a context
   */
  var resource2 = new Crest.Resource(resource);
  test.instanceOf(resource2._context, Crest.Resource);

  /**
   * Sets options passed
   */
  resource = new Crest.Resource(crest, 'name', 'path');
  test.equal(resource._name, 'name');
  test.equal(resource._path, 'path');

  /**
   * Has plain defaults object if no defaults passed
   */
  var defaults = {
    headers: {},
    params: {},
    query: {}
  };
  test.equal(resource._defaults, defaults);

  /**
   * Merges defaults in
   */
  defaults = {
    headers: {
      merged: 'in'
    },
    params: {},
    query: {}
  };
  resource = new Crest.Resource(crest, '', '', {
    headers: {
      merged: 'in'
    }
  });
  test.equal(resource._defaults, defaults);
});

Tinytest.add('centiq:crest - Resource - Sub-Resources', function(test) {
  var defaults = {
      headers: {
        defaultHeader: 'header'
      },
      params: {},
      query: {}
    },
    crest = new Crest({
      base_url: 'http://localhost:3002'
    }, {
      headers: {
        defaultHeader: 'header'
      }
    }),
    resource = crest.__root__;

  /**
   * Errors if bad params passed passed
   */

  /**
   * Undefined name
   */
  try {
    resource.addResource()
  } catch (e) {
    test.equal(e.error, 'invalid-resource');
    test.equal(e.reason, 'The resource name (undefined) is invalid.');
  }

  /**
   * Name contains characters other than alphanumeric and underscore
   */
  try {
    resource.addResource('name[');
  } catch (e) {
    test.equal(e.error, 'invalid-resource');
    test.equal(e.reason, 'The resource name (name[) is invalid.');
  }

  /**
   * Name cannot start with a number
   */
  try {
    resource.addResource('0name');
  } catch (e) {
    test.equal(e.error, 'invalid-resource');
    test.equal(e.reason, 'The resource name (0name) is invalid.');
  }

  /**
   * Name can start with an underscore, lowercase and uppercase letters
   */
  test.equal(resource.addResource('_startsWithUnderscore')
    ._name, '_startsWithUnderscore');
  test.equal(resource.addResource('startsWithUnderscore')
    ._name, 'startsWithUnderscore');
  test.equal(resource.addResource('StartsWithUnderscore')
    ._name, 'StartsWithUnderscore');

  /**
   * Path gets set to name if not specified
   */
  test.equal(resource.addResource('setsPath')
    ._path, 'setsPath');

  /**
   * Path removes leading and trailing slashes only
   */
  test.equal(resource.addResource('leadingSlash', '/path')
    ._path, 'path');
  test.equal(resource.addResource('trailingSlash', 'path/')
    ._path, 'path');
  test.equal(resource.addResource('leadingAndTrailingSlashes', '/path/')
    ._path, 'path');
  test.equal(resource.addResource('leavesMiddleSlashes', '/path/to/resource/')
    ._path, 'path/to/resource');

  /**
   * Sub-Resources return Crest defaults
   */
  test.equal(resource.setsPath.getOptions(), defaults);

  /**
   * Sub-Resources append path to the URL properly
   */
  test.equal(resource.leadingSlash._url(), 'http://localhost:3002/path');
  test.equal(resource.trailingSlash._url(), 'http://localhost:3002/path');
  test.equal(resource.leadingAndTrailingSlashes._url(), 'http://localhost:3002/path');
  test.equal(resource.leavesMiddleSlashes._url(), 'http://localhost:3002/path/to/resource');

  /**
   * Sub-Sub-resources append paths as well
   */
  resource.leadingSlash.addResource('to');
  test.equal(resource.leadingSlash.to._url(), 'http://localhost:3002/path/to');
});

Tinytest.add('centiq:crest - Resource - Options - Getting and Setting', function(test) {
  var crest = new Crest({
      base_url: 'http://localhost:3002'
    }, {
      headers: {
        setAt: 'creation'
      }
    }),
    resource = crest.__root__;

  /**
   * Can get headers, params and query objects from the _defaults object
   */
  test.equal(resource.getOption('headers'), resource._defaults.headers);
  test.equal(resource.getOption('params'), resource._defaults.params);
  test.equal(resource.getOption('query'), resource._defaults.query);

  /**
   * Getting a bad option fails
   */
  test.equal(resource.getOption('badOption'), undefined);

  /**
   * Undefined option keys return undefined
   */
  test.equal(resource.header('badOption'), undefined);
  test.equal(resource.param('badOption'), undefined);
  test.equal(resource.query('badOption'), undefined);

  /**
   * Can get and set specific header, param and and query keys
   */
  test.equal(resource.header('key', 'header'), {
    setAt: "creation",
    key: "header"
  });
  test.equal(resource.header('key'), "header");
  test.equal(resource.param('key', 'param'), {
    key: "param"
  });
  test.equal(resource.param('key'), "param");
  test.equal(resource.query('key', 'query'), {
    key: "query"
  });
  test.equal(resource.query('key'), "query");

  /**
   * Can overwrite an option key passed in at instantiation time
   */
  test.equal(resource.header('setAt'), 'creation');
  test.equal(resource.header('setAt', 'runtime'), {
    setAt: 'runtime',
    key: 'header'
  });
  test.equal(resource.header('setAt'), 'runtime');
});

Tinytest.add('centiq:crest - Resource - Options - Getting and Setting on Sub-Resources', function(test) {
  var crest = new Crest({
      base_url: 'http://localhost:3002'
    }, {
      headers: {
        setAt: 'creation'
      }
    }),
    resource = crest.__root__;

  /**
   * Resource.getOptions returns the defaults options of the root resource
   */
  test.equal(resource.getOptions(), resource._defaults);

  /**
   * Resource.getOptions merges in the object passed
   */
  var expectedResult = {
    headers: {
      setAt: 'creation'
    },
    params: {
      passed: 'in'
    },
    query: {}
  };
  test.equal(resource.getOptions({
    params: {
      passed: 'in'
    }
  }), expectedResult);

  /**
   * Sub-Resources options include parent options
   */
  resource.addResource('sub');
  test.equal(resource.sub.getOptions(), resource._defaults);

  /**
   * Passing an option to a sub resource overrides the parent option
   */
  expectedResult = {
    headers: {
      setAt: 'override-test'
    },
    params: {},
    query: {}
  };
  test.equal(resource.sub.getOptions({
    headers: {
      setAt: 'override-test'
    }
  }), expectedResult);

  /**
   * Setting an option on a Sub-Resource overrides the parent option
   */
  resource.sub.header('setAt', 'child-runtime');
  expectedResult = {
    headers: {
      setAt: 'child-runtime'
    },
    params: {},
    query: {}
  };
  test.equal(resource.sub.getOptions(), expectedResult);

  /**
   * But does not affect the parent resource
   */
  expectedResult = {
    headers: {
      setAt: 'creation'
    },
    params: {},
    query: {}
  };
  test.equal(resource.getOptions(), expectedResult);
});

Tinytest.add('centiq:crest - Resource - Options - Sanitizing options object', function(test) {
  var crest = new Crest({
      base_url: 'http://localhost:3002'
    }, {
      headers: {
        setAt: 'creation'
      }
    }),
    resource = crest.__root__,
    defaults = {
      headers: {},
      params: {},
      query: {}
    };

  /**
   * _processOptions returns a default options object
   */
  test.equal(resource._processOptions(), defaults);

  /**
   * Allowed options are passed in (content, data, auth, timeout, followRedirects)
   */
  test.isTrue(resource._processOptions({
      content: ''
    })
    .hasOwnProperty('content'));
  test.isTrue(resource._processOptions({
      data: ''
    })
    .hasOwnProperty('data'));
  test.isTrue(resource._processOptions({
      auth: ''
    })
    .hasOwnProperty('auth'));
  test.isTrue(resource._processOptions({
      timeout: ''
    })
    .hasOwnProperty('timeout'));
  test.isTrue(resource._processOptions({
      followRedirects: ''
    })
    .hasOwnProperty('followRedirects'));

  /**
   * Options not allowed are not passed in
   */
  test.isFalse(resource._processOptions({
      illegalOption: ''
    })
    .hasOwnProperty('illegalOption'));

  /**
   * Header and Query options set to null or false are removed
   */
  test.equal(resource._processOptions({
    headers: {
      removeMe: null
    }
  }), defaults);
  test.equal(resource._processOptions({
    headers: {
      removeMe: false
    }
  }), defaults);
  test.equal(resource._processOptions({
    query: {
      removeMe: null
    }
  }), defaults);
  test.equal(resource._processOptions({
    query: {
      removeMe: false
    }
  }), defaults);

  /**
   * Params set to null or false are kept
   */
  var expectedResult = {
    headers: {},
    params: {
      kept: null
    },
    query: {}
  };
  test.equal(resource._processOptions({
    params: {
      kept: null
    }
  }), expectedResult);
  expectedResult = {
    headers: {},
    params: {
      kept: false
    },
    query: {}
  };
  test.equal(resource._processOptions({
    params: {
      kept: false
    }
  }), expectedResult);

  /**
   * Header, Param and query options set to functions are evaluated
   */
  expectedResult = {
    headers: {
      expected: 'result'
    },
    params: {},
    query: {}
  };
  test.equal(resource._processOptions({
    headers: {
      expected: function() {
        return 'result';
      }
    }
  }), expectedResult);
  expectedResult = {
    headers: {},
    params: {
      expected: 'result'
    },
    query: {}
  };
  test.equal(resource._processOptions({
    params: {
      expected: function() {
        return 'result';
      }
    }
  }), expectedResult);
  expectedResult = {
    headers: {},
    params: {},
    query: {
      expected: 'result'
    }
  };
  test.equal(resource._processOptions({
    query: {
      expected: function() {
        return 'result';
      }
    }
  }), expectedResult);

  /**
   * Header and Query options with functions that return null or false are removed
   */
  test.equal(resource._processOptions({
    header: {
      removeMe: function() {
        return null;
      }
    }
  }), defaults);
  test.equal(resource._processOptions({
    header: {
      removeMe: function() {
        return false;
      }
    }
  }), defaults);
  test.equal(resource._processOptions({
    query: {
      removeMe: function() {
        return null;
      }
    }
  }), defaults);
  test.equal(resource._processOptions({
    query: {
      removeMe: function() {
        return false;
      }
    }
  }), defaults);

  /**
   * Param options with functions that return null or false are kept
   */
  expectedResult = {
    headers: {},
    params: {
      kept: null
    },
    query: {}
  };
  test.equal(resource._processOptions({
    params: {
      kept: function() {
        return null;
      }
    }
  }), expectedResult);
  expectedResult = {
    headers: {},
    params: {
      kept: false
    },
    query: {}
  };
  test.equal(resource._processOptions({
    params: {
      kept: function() {
        return false;
      }
    }
  }), expectedResult);
});

Tinytest.add('centiq:crest - Resource - Options - Processing Query Options Object', function(test) {
  var crest = new Crest({
      base_url: 'http://localhost:3002'
    }, {
      headers: {
        setAt: 'creation'
      }
    }),
    resource = crest.__root__;

  /**
   * Resource errors if no query object is passed
   */
  try {
    resource._processQuery();
  } catch (e) {
    test.equal(e.message, '`options.query` must be an object when making a Crest request - it is converted to a string by Crest');
  }

  /**
   * Empty query options object returns empty string
   */
  test.equal(resource._processQuery({}), '');

  /**
   * String/number key-value pairs are set
   */
  test.equal(resource._processQuery({
    key: 'value'
  }), 'key=value');
  test.equal(resource._processQuery({
    key: 123
  }), 'key=123');

  /**
   * Passes keys and values through and changes %20 (spaces) to + signs
   */
  test.equal(resource._processQuery({
    'key name': 'value&string'
  }), 'key+name=value%26string');

  /**
   * Processes object keys in order
   */
  test.equal(resource._processQuery({
    first: 1,
    second: 2
  }), 'first=1&second=2');

  /**
   * Arrays are assumed to be string or numeric values only.  Arrays are processed
   * with the key[]= syntax
   */
  test.equal(resource._processQuery({
    array: ['with', 3, 'values']
  }), 'array[]=with&array[]=3&array[]=values');

  /**
   * Boolean true values are set as key only
   */
  test.equal(resource._processQuery({
    key: true
  }), 'key');

  /**
   * Boolean false values are ignored
   */
  test.equal(resource._processQuery({
    key: false
  }), '');

  /**
   * Dates are converted to strings
   */
  var date = new Date(),
    dateString = encodeURIComponent(date.toString())
    .replace(/%20/g, '+');
  test.equal(resource._processQuery({
    myDate: date
  }), 'myDate=' + dateString);
});

Tinytest.add('centiq:crest - Resource - Options - Processing Full Options Object with Sub-Resources', function(test) {
  var crest = new Crest({
      base_url: 'http://localhost:3002'
    }, {
      headers: {
        setAt: 'creation'
      }
    }),
    resource = crest.__root__;

  /**
   * Add child resources
   */
  resource.addResource('first');
  resource.first.addResource('second');

  /**
   * Add query param to first child resource
   */
  resource.first.query('a', 'b');
  test.equal(resource.getProcessedOptions(), {
    headers: {
      setAt: 'creation'
    },
    params: {},
    query: ''
  });
  test.equal(resource.first.getProcessedOptions(), {
    headers: {
      setAt: 'creation'
    },
    params: {},
    query: 'a=b'
  });
  test.equal(resource.first.second.getProcessedOptions(), {
    headers: {
      setAt: 'creation'
    },
    params: {},
    query: 'a=b'
  });

  /**
   * Sub-Resources can override with a function
   */
  resource.first.header('setAt', function() {
    return 'runtime';
  });
  test.equal(resource.getProcessedOptions(), {
    headers: {
      setAt: 'creation'
    },
    params: {},
    query: ''
  });
  test.equal(resource.first.getProcessedOptions(), {
    headers: {
      setAt: 'runtime'
    },
    params: {},
    query: 'a=b'
  });
  test.equal(resource.first.second.getProcessedOptions(), {
    headers: {
      setAt: 'runtime'
    },
    params: {},
    query: 'a=b'
  });

  /**
   * Sub-Resources can override a function with another value
   */
  resource.first.second.header('setAt', function() {
    return 'secondChild';
  });
  test.equal(resource.getProcessedOptions(), {
    headers: {
      setAt: 'creation'
    },
    params: {},
    query: ''
  });
  test.equal(resource.first.getProcessedOptions(), {
    headers: {
      setAt: 'runtime'
    },
    params: {},
    query: 'a=b'
  });
  test.equal(resource.first.second.getProcessedOptions(), {
    headers: {
      setAt: 'secondChild'
    },
    params: {},
    query: 'a=b'
  });

  /**
   * Sub-Resources can unset aheader or query option by passing in null
   */
  resource.first.second.query('a', null);
  test.equal(resource.getProcessedOptions(), {
    headers: {
      setAt: 'creation'
    },
    params: {},
    query: ''
  });
  test.equal(resource.first.getProcessedOptions(), {
    headers: {
      setAt: 'runtime'
    },
    params: {},
    query: 'a=b'
  });
  test.equal(resource.first.second.getProcessedOptions(), {
    headers: {
      setAt: 'secondChild'
    },
    params: {},
    query: ''
  });

  /**
   * Or false
   */
  resource.first.second.query('a', false);
  test.equal(resource.getProcessedOptions(), {
    headers: {
      setAt: 'creation'
    },
    params: {},
    query: ''
  });
  test.equal(resource.first.getProcessedOptions(), {
    headers: {
      setAt: 'runtime'
    },
    params: {},
    query: 'a=b'
  });
  test.equal(resource.first.second.getProcessedOptions(), {
    headers: {
      setAt: 'secondChild'
    },
    params: {},
    query: ''
  });
});
