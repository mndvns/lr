/**
 * Module dependencies
 */

var debug = require('debug')('lr:config');
var defaults = require('./defaults');
var resolve = require('path').resolve;
var util = require('util');
var yaml = require('js-yaml');
var ini = require('ini');
var fs = require('fs');
var whatever = require('whatever-format');

/**
 * Take a `path` and return its configuration
 * file data.
 *
 * @param {String} path
 * @api public
 */

exports.loadPath = function(path, config){

  var files = fs.readdirSync(path)
    .map(function(file){
      if (config) return config;
      if (/^\.?lr/.exec(file)) return file;
    })
    .filter(function(file){
      return file;
    })
    .map(function(file){
      return exports.readFile(resolve(path, file));
    })
    .reduce(function(prev, curr){
      // debug('reduce prev', prev);
      // debug('reduce curr', curr);
      return merge(prev, curr);
    }, {});

  debug('loadPath files', files);
  return files;

};

/**
 * Read and decode a given `string`
 *
 * @param {String} string
 */

exports.read = function read(string){
  return fmt(whatever.decode(string));
};

/**
 * Read a `path` and return a its configuration.
 *
 * @param {String} path
 * @api public
 */

exports.readFile = function readFile(path, fn){
  if (!fs.existsSync(path)) return {};
  var raw = fs.readFileSync(path, {encoding: 'utf8'});
  var data = exports.read(raw);
  return data;
};

/**
 * Take a `object` pair and return a properly formatted
 * command.
 *
 *   Options:
 *
 *     - filename
 *
 *   Example:
 *
 *     fmt({foo: "buzz"})
 *     => {foo: {cmd: 'buzz', muted: false }}
 *
 *     fmt({foo: "@buzz"})
 *     => {foo: {cmd: 'buzz', muted: true }}
 *
 * @param {Object} obj
 * @return {Command}
 * @api private
 */

function fmt(obj){

  var options = {};
  var commands = {};

  for (var key in defaults) {
    if (!defaults.hasOwnProperty(key)) continue;
    if (!defaults[key]) debug('def', defaults);
    options[key] = defaults[key].value;
  }

  if (typeof obj === 'string') {
    var o = {};
    o[obj] = '';
    obj = o;
  }

  Object.keys(obj).map(function(key){
    var val = obj[key];

    if (key.slice(0,2) === '--') {
      key = key.slice(2);
      debug('fmt', key);
      if (!defaults[key]) return;
      if (typeof defaults[key].value === 'number') val = parseInt(val);
      if (util.isArray(defaults[key].value)) return options[key] = defaults[key].value.concat(val);
      return options[key] = val;
    }

    if (~key.indexOf(':')) throw new Error(key + ' is an invalid path');

    var muted = false
    var m = null;

    if (m = /^@/.exec(val)) {
      val = val.slice(1);
      muted = true;
    }

    commands[key] = {
      cmd: val,
      muted: muted
    };
  });

  var out = {
    options: options,
    commands: commands
  };

  return out;
}

function merge(a,b){
  for (var k in b) a[k] = b[k];
  return b;
}
