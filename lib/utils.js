
/**
 * Module dependencies.
 */

var lig = require('lig');

/**
 * Expose `log`.
 */

exports.log = log;

/**
 * `log` simply returns `lig` with some
 * options set and ready to go.
 *
 * opts:
 *  - verbose <boolean>
 *  - silent <boolean>
 *
 * @param {Object} opts
 */

function log(opts) {
  opts = opts || {};

  return function() {
    var args = Array.prototype.slice.call(arguments)
    var first = args[0];
    var rest = args.slice(1);
    var color = 'blue';
    var initial;
    switch (first) {
      case 'listening':
      case 'loading':
      case 'monitor':
      case 'watching':
        initial = true;
        color = 'green';
    }

    if (opts.silent && initial) return;
    if (opts.silent || !(opts.verbose || initial)) return process.stdout.write('.');

    return lig.apply(this, [{style: color}, first, rest]);
  }
}


