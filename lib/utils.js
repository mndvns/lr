
/**
 * Module dependencies.
 */

var colors = require('colors');

/**
 * Expose `log`.
 */

exports.log = function(type) {
  var fmt = '[' + type + ']';

  // TODO why is forman saying it's not a TTY?
  // var isTTY = process.stdout.isTTY;

  var isTTY = true;
  if (isTTY) {
    switch (type) {
      case 'error':
        type = fmt.red;
        break;
      case 'monitor':
      case 'loading':
        type = fmt.yellow;
        break;
      case 'active':
      case 'watching':
        type = fmt.green;
        break;
      case 'reloading':
        type = fmt.cyan;
        break;
      default:
        type = fmt.grey;
    }
  }
  type += ':';
  console.log.apply(console, arguments);
};

/**
 * Merge two objects.
 */

exports.merge = function(a, b){
  for (var k in b) a[k] = b[k];
  return a;
};
