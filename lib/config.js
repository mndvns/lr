/**
 * Module dependencies
 */

var debug = require('debug')('lr:config');
var resolve = require('path').resolve;
var util = require('util');
var yaml = require('js-yaml');
var ini = require('ini');
var fs = require('fs');

/**
 * Take a `path` and return its configuration
 * file data.
 *
 * @param {String} path
 * @api public
 */

exports.loadPath = function loadPath(path, opts){


  opts = opts || {};
  opts.Makefile = fs.existsSync(path + '/Makefile');

  var files = fs.readdirSync(path)
    .map(function(file){
      if (opts.filename) return opts.filename;
      if (!/^\.?lr/.exec(file)) return;
      return file;
    })
    .filter(function(file){
      return file;
    })
    .map(function(file){
      return exports.readFile(resolve(path, file), opts);
    })
    .reduce(function(prev, curr){
      return merge(prev, curr);
    }, {});

  debug('files', files);
  return files;

};

/**
 * Take a `string` and return an object
 * with the path, cmd, and options.
 *
 * @param {String} string
 * @param {Object} opts
 * @return {Command}
 * @api public
 */

exports.read = function read(string, opts){

  // first we discern whether or not we're
  // dealing with an `ini` file
  var lines = string.split('\n');
  var m;
  while (lines.length && !m) {
    m = /^\[\]$|=/.exec(lines.shift())
    // debug('ini regexp', m);
  }

  var data;
  if (m) {
    // ini
    try { data = ini.parse(string) } catch(e){}
    // debug('ini data', data);
    if (data) return fmt(data, opts);
  } else {
    // yaml
    try { data = yaml.load(string) } catch(e){}
    // debug('yaml data', data);
    if (data) return fmt(data, opts);
    // json
    try { data = JSON.parse(data) } catch(e){}
    // debug('json data', data);
    if (data) return fmt(data, opts);
  }

  // if we've made it this far,
  // just give back a generic command
  return fmt({'*': opts.make || ''}, opts);
};

/**
 * Read a `path` and return a its configuration.
 *
 * @param {String} path
 * @api public
 */

exports.readFile = function readFile(path, opts, fn){
  if (!fs.existsSync(path)) return {};
  var raw = fs.readFileSync(path, {encoding: 'utf8'});
  var data = exports.read(raw, opts);
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
 * @param {Object} opts
 * @return {Command}
 * @api private
 */

function fmt(obj, opts){
  var defaults = require('./defaults.json');

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
      debug(defaults[key]);
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
