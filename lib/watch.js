
/**
 * Module dependencies.
 */

var monocle = require('monocle')();
var glob = require('glob');
var resolve = require('path').resolve;

/**
 * Expose `watch`.
 */

module.exports = watch;

/**
 * Glob `path`, and call `fn` on changes.
 * @param {String} path
 * @param {Function} fn
 */

function watch(path, fn) {
  glob(resolve(process.cwd(), path), function(err, files) {
    if (err) return fn(err);
    files.forEach(function(g) {
      monocle.watchPaths({
        path: g,
        listener: function() {
          fn(null, g, 'reloading');
        },
        complete: function() {
          fn(null, g, 'watching');
        }
      });
    });
  });
}
