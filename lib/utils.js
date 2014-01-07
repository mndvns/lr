
/**
 * Module dependencies.
 */

var colors = require('colors');
var inspect = require('util').inspect;
var extend = require('xtend');
var type = require('type-component');

var defaults = {
  style: 'blue',
  width: 9,
  padding: 1,
  separator: ' ',
  ender: '...'
};

/**
 * Expose `log`.
 */

exports.log = log;

/**
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

    return print.apply(null, [{style: color}, first, rest]);
  }
}

function print() {
  var args = Array.prototype.slice.call(arguments);
  var label = '';
  var buf = [];
  var opts = extend(defaults, this.options || {});

  var self = this;
  args.forEach(function(arg, i, ctx) {
    if (type(arg) === "error") {
      opts.style = 'red';
      bug.push('error', arg.message)
      return;
    }
    if (type(arg) === "object") return opts = extend(opts, arg);
    if (ctx.length === 1) return buf.push(arg);
    if (!label.length) return label = arg;
    if (type(arg) === "string") return buf.push(arg);
    if (type(arg) === "array") return buf = buf.concat(arg);
  })

  var len = Math.max(0, opts.width - label.length);
  var pad = new Array(len + opts.padding).join(' ');
  var tab = new Array(len + opts.padding +  label.length + opts.separator.length + 1).join(' ');
  var max = process.stdout.columns - tab.length - opts.ender.length - opts.padding;

  buf.forEach(function(b, i) {
    if (i) return;
    if (b.length > max) {
      return buf = [b.trim()];
      // TODO find out why width is coming back short
      // related to eshell?
      // return buf = [b.slice(0, max).trim() + opts.ender];
    }
  })

  var cache = this.cache || {};
  var outLabel = cache.label !== label
    ? label
    : label.replace(/[\w+]/g, ' ');

  // remove colors
  outLabel = process.stdout.isTTY
    ? pad + outLabel[opts.style]
    : ('[' + label + ']')[opts.style];

  if (process.stdout.isTTY) {
    // TODO fix this for non-tty output
  }

  console.log(outLabel + opts.separator + buf.join('\n' + tab));

  this.cache = {
    label: label,
    buf: buf
  };

  // return an array so we can test against it
  return [label].concat(buf);
}
