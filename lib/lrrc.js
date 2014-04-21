/**
 * Module dependencies
 */

var debug = require('debug')('lr:config');
var resolve = require('path').resolve;
var yaml = require('js-yaml');
var fs = require('fs');

/**
 * Take a `path` and return its configuration
 * file data.
 *
 * @param {String} path
 * @param {Function} fn
 * @api public
 */

exports.loadPath = function loadPath(path, fn){
  var opts = {};
  opts.Makefile = fs.existsSync(path + '/Makefile');

  var files = fs.readdirSync(path)
    .map(function(file){
      if (/^\.?lr/.exec(file)) return file;
    })
    .filter(function(file){
      return file
    })
    .map(function(file){
      return exports.readFile(file, opts);
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
 * @return {Command}
 * @api public
 */

exports.read = function read(string, opts){
  var data;

  try { data = yaml.load(string) } catch(e) {/* ignore */}
  if (data) return fmt(data);

  try { data = JSON.parse(data) } catch(e) {/* ignore */}
  if (data) return fmt(data);

  return fmt({'*': opts.make || ''});
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
  for (var k in obj) {
    if (!obj.hasOwnProperty(k)) continue;
    var old = obj[k];
    var muted = false
    var m = null;

    if (m = /^@/.exec(old)) {
      muted = true;
      old = old.slice(1);
    }

    obj[k] = {
      cmd: old,
      muted: muted
    };
  }
  return obj;
}

function merge(a,b){
  for (var k in a) a[k] = b[k];
  return b;
}
