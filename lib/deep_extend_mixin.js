/*  Copyright (C) 2012-2014  Kurt Milam - http://xioup.com | Source: https://gist.github.com/1868955
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 **/

// Based conceptually on the _.extend() function in underscore.js ( see http://documentcloud.github.com/underscore/#extend for more details )


/**
 * pchoo: Have added _.isFunction() check on source to first if statement within for block
 * to allow us to overwrite properties with functions in Crest.
 */


function deepExtend(obj) {
  var parentRE = /#{\s*?_\s*?}/,
    slice = Array.prototype.slice;

  _.each(slice.call(arguments, 1), function(source) {
    for (var prop in source) {
      if (_.isUndefined(obj[prop]) || _.isFunction(obj[prop]) || _.isNull(source[prop]) || _.isDate(source[prop]) || _.isFunction(source[prop])) {
        obj[prop] = source[prop];
      } else if (_.isString(source[prop]) && parentRE.test(source[prop])) {
        if (_.isString(obj[prop])) {
          obj[prop] = source[prop].replace(parentRE, obj[prop]);
        }
      } else if (_.isArray(obj[prop]) || _.isArray(source[prop])) {
        if (!_.isArray(obj[prop]) || !_.isArray(source[prop])) {
          throw new Error('Trying to combine an array with a non-array (' + prop + ')');
        } else {
          obj[prop] = _.reject(_.deepExtend(_.clone(obj[prop]), source[prop]), function(item) {
            return _.isNull(item);
          });
        }
      } else if (_.isObject(obj[prop]) || _.isObject(source[prop])) {
        if (!_.isObject(obj[prop]) || !_.isObject(source[prop])) {
          throw new Error('Trying to combine an object with a non-object (' + prop + ')');
        } else {
          obj[prop] = _.deepExtend(_.clone(obj[prop]), source[prop]);
        }
      } else {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
};

_.mixin({
  'deepExtend': deepExtend
});
