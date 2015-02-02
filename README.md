Crest
====

> A REST Client specifically designed for Meteor

Crest is a fast, convenient, and flexible rest library for Meteor, It allos you to quickly create
resources and access restful data with ease.

## Quickstart

```javascript

	// Create a new REST Client instance
    crest = new Crest({
    	base_url: "/api"
    });

    // Add some resources
    crest.addResource("posts");
    crest.addResource("comments");
    crest.addResource("categories", "/misc/categories");

    if(Meteor.isServer)
    	var posts = crest.posts.get(null, {params: {limit: 10}}); // /api/posts?limit=10

    if(Meteor.isClient)
	    crest.posts.get(function(err, response){
	    	var posts = response.data;
	    });
```

## Installation

`meteor add centiq:crest`

## API

> Currently being written/