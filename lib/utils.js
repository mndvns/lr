/**
 * Module dependencies.
 */

var consoler = require('component-consoler');

/**
 * Call with `isatty` and return a logger
 * that formats properly.
 *
 * @param {Boolean} isatty
 * @api public
 */

exports.log = function(isatty, port){
  if (isatty) {
    return function(){
      var args = Array.prototype.slice.call(arguments);
      args.unshift('LR [' + port + ']');
      consoler.log.apply(null, args);
    };
  } else {
    return function(){
      var args = Array.prototype.slice.call(arguments);
      args.unshift('[LR]');
      console.log.apply(null, args);
    };
  }
};

/**
 * Merge two objects without mutating either
 *
 * @param {Object} a
 * @param {Object} b
 */

exports.merge = function(a, b){
  var z = {};
  for (var k in a) z[k] = a[k];
  for (var k in b) z[k] = b[k];
  return z;
};
