/**
 * Clientside collection
 * @type {Mongo.Collection}
 */
CrestOptions = new Mongo.Collection('crest_options');

/**
 * Client subscription
 */
Meteor.subscribe('_crest_options_sub');
