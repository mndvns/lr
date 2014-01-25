
/**
 * Module dependencies.
 */

var monocle = require('monocle')();
var resolve = require('path').resolve;
var basename = require('path').basename;
var dirname = require('path').dirname;

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
  if (test(opts.ignore, path)) return;
  var abs = resolve(process.cwd(), path);
  var filter;

  if (~abs.indexOf('*')) {
    filter = basename(abs);
    abs = dirname(abs);
  }

  monocle.watchPaths({
    path: abs,
    fileFilter: filter,
    listener: function() {
      fn(null, abs, 'reloading');
    },
    complete: function() {
      fn(null, abs, 'watching');
    }
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
  patterns.push('node_modules$', '.git');
  for (var i = patterns.length - 1; i >= 0; i--) {
    if (new RegExp(patterns[i]).test(path)) return true;
  }
}
