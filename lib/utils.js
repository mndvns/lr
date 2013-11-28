
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
 *
 * @param {Object} opts
 */

function log(opts) {
  opts = opts || {};

  return function() {
    var args = Array.prototype.slice.call(arguments)
    var first = args[0];
    var rest = args.slice(1);
    var color;
    var initial;
    switch (first) {
      case 'monitoring':
      case 'monitor':
      case 'listening':
      case 'watching':
      case 'loading':
        initial = true;
        color = 'green';
        break;
      default:
        color = 'blue';
    }

    var verbose = opts.verbose || initial;

    var tag = verbose ? [{style: color}, first] : [];
    var msg = verbose ? rest : ['...'];

    return lig.apply(this, tag.concat(msg))
  }
}


