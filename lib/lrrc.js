/**
 * Module dependencies
 */

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
  var files = fs.readdirSync(path)
  files = files.map(function(file){
    var m;
    if (m = /^\.?lr/.exec(file)) return file;
  });
  exports.readFile(resolve(path, file), fn);
};

/**
 * Take a `string` and return an object
 * with the path, cmd, and options.
 *
 * @param {String} string
 * @return {Command}
 * @api public
 */

exports.read = function read(string){
  var data;

  try { data = yaml.safeLoad(string) } catch(e) {/* ignore */}
  if (data) return fmt(data);

  try { data = JSON.parse(data) } catch(e) {/* ignore */}
  if (data) return fmt(data);

};

/**
 * Read a `path` and return a its configuration.
 *
 * @param {String} path
 * @api public
 */

exports.readFile = function readFile(path, fn){
  var data = fs.readFileSync(path, {encoding: 'utf8'});
  return exports.read(data);
};

/**
 * Take a `object` pair and return a properly formatted
 * command.
 *
 *   Example:
 *
 *     fmt({foo: "buzz"})
 *     => {foo: {cmd: 'buzz', ignore: false }}
 *
 *     fmt({foo: "@buzz"})
 *     => {foo: {cmd: 'buzz', ignore: true }}
 *
 * @param {Object} obj
 * @return {Command}
 * @api private
 */

function fmt(obj){
  for (var k in obj) {
    if (!obj.hasOwnProperty(k)) continue;
    var old = obj[k];
    var ignore = false
    var m = null;

    if (m = /^@/.exec(old)) {
      ignore = true;
      old = old.slice(1);
    }

    obj[k] = {
      cmd: old,
      ignore: ignore
    };
  }
  return obj;
}
