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
   * @param  {String}  resource  Unique resource identifier
   * @param  {String}  type      Option type [headers|params|query]
   * @param  {String}  key       Option key
   * @param  {*}       value     Option value
   * @param  {String}  sessionId Server only - session id for client connection
   * @return {Boolean}
   */
  '__crest_setOption': function(resource, type, key, value, sessionId) {

    /**
     * @todo  add error checking on arguments
     */

    /**
     * Set session id from connection if client
     */
    sessionId = !!sessionId && sessionId || !!this.connection && this.connection.id || false;
    if (!sessionId) {
      throw new Error('sessionId must be passed on a server request');
    }
    var option = {
      session: sessionId,
      resource: resource,
      type: type,
      key: key,
      value: value
    };
    return CrestOptions.upsert({
      session: sessionId,
      resource: resource,
      type: type,
      key: key
    }, {
      $set: option
    });
  }
});
