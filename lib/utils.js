
/**
 * Module dependencies.
 */

var colors = require('colors');
var consoler = require('component-consoler');
var tty = require('tty');
var config = require('./config.js');

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
 * Merge two objects.
 */

exports.merge = function(a, b){
  for (var k in b) a[k] = b[k];
  return a;
};
