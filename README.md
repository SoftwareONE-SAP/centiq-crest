# Crest

[![Build Status](https://travis-ci.org/Centiq/centiq-crest.svg?branch=master)](https://travis-ci.org/Centiq/centiq-crest)
[![Issues](https://img.shields.io/github/issues/Centiq/centiq-crest.svg)](https://github.com/Centiq/centiq-crest/issues)
[![Forks](https://img.shields.io/github/forks/Centiq/centiq-crest.svg)](https://github.com/Centiq/centiq-crest/fork)
[![Software License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)

Crest is a lightweight wrapper package for Meteor's HTTP Library, it provides a structured interface that allows you to quickly access restful data.

## Installation
In order to install crest you should execute the following command within your Meteoer Project:

```shell
meteor add centiq:crest
```

## Quickstart

### Step 1:
Create a new Crest client.

```javascript
var client = new Crest(options);
```

### Step 2
Setup your resources

```javascript
client.addResource("posts");
client.addResource("comments");
client.addResource("support");
```

### Step 3
Use the newly add `Resources`.
```javascript
// GET /posts
var posts = client.posts.get();

// GET /posts/44
var posts = client.posts.get(44);

// GET /posts/44?query=param
var posts = client.posts.get(44, { params: {query: "param"}});

// POST /posts
var response = client.posts.create({body: "Lorum Ipsum."});

// PUT /posts
var response = client.posts.update({body: "Lorum Ipsum. (Updated)"});

// DELETE /posts/44
var response = client.posts.remove(44);
```

## API
```javascript
var client = new Crest({
    /**
     * Full url, such as:
     * http://domain.tld/path/tp/api
     * https://domain.tld/path/tp/api
     */
    base_url: "string|required",
    
    /**
     * These defaults will be applied to every resource See 'Options':
     * http://docs.meteor.com/#/full/http_call
    /*
    defaults: {}
});

/**
 * Resource objects are created and attached to either the crest
 * object or the parent resources.
 */
 var resources = client.addResource("resourceName");
 
 resource.get(id, options, callback);
 resource.create(resource, options, callback);
 resource.update(id, resource, options, callback);
 resource.remove(id, options, callback);
 
 // Note that callbacks are only optional on the server
 // all client side requests require a callback.
 
 // Base resources that contains sub-resources.
 client.addResource("support")
 
 // Create teh sub resource
 client.support.addResource("tickets");
 
 // GET /support/tickets
 client.support.tickets.get();
```

## Features
  - Easy setup and configuration.

### Contributing
Want to contribute? Great! Feel free to submit a pull request

### Todo's
 - Write More Tests
 - Add resources map to `new Crest` options
 - Implement hooks

License
----
MIT
