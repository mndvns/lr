
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
 * @param {Object} opts
 * @param {Function} fn
 */

function watch(path, opts, fn) {
  glob(resolve(process.cwd(), path), function(err, files) {
    if (err) return fn(err);
    files.forEach(function(file) {
      if (test(opts.ignore, file)) return;
      monocle.watchPaths({
        path: file,
        listener: function() {
          fn(null, file, 'reloading');
        },
        complete: function() {
          fn(null, file, 'watching');
        }
      });
    });
  });
}

/**
 * Iteratate over our regexp's and test against the
 * given path. Return on first match.
 * @param {Array} patterns
 * @param {String} path
 * @return <boolean>
 */

function test(patterns, path) {
  patterns = patterns || [];
  patterns.push('components$', 'node_modules$', '.git');
  for (var i = patterns.length - 1; i >= 0; i--) {
    if (new RegExp(patterns[i]).test(path)) return true;
  }
}
