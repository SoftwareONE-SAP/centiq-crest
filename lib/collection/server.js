/**
 * Server side collection, not persisted in mongoDB
 * @type {Mongo.Collection}
 */
CrestOptions = new Mongo.Collection('crest_options', {
  connection: null
});

/**
 * Publish the collection to the client.
 * @param  {String}   Subscription name
 * @return {Function} Publish function
 */
Meteor.publish("_crest_options_sub", function() {
  return CrestOptions.find({
    session: this.connection.id
  });
});

Meteor.methods({
  /**
   * Seemingly private method for setting an option for the active session
   * @param  {String}  resource Unique resource identifier
   * @param  {String}  type     Option type [headers|params|query]
   * @param  {String}  key      Option key
   * @param  {*}       value    Option value
   * @return {Boolean}
   */
  '__crest_setOption': function(resource, type, key, value) {

    /**
     * @todo  add error checking on arguments
     */

    return CrestOptions.upsert({
      session: this.connection.id,
      resource: resource,
      type: type,
      key: key
    }, {
      $set: {
        session: this.connection.id,
        resource: resource,
        type: type,
        key: key,
        value: value
      }
    });
  }
});
