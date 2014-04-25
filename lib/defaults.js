/**
 * Module dependencies
 */

var debug = require('debug')('lr:defaults');
var TTY = require('tty');

module.exports = {
  'root': {
    'short': 'r',
    'value': process.cwd(),
    'assign': function(curr, def){
      return (curr || def)
    }
  },
  'port': {
    'short': 'p',
    'value': 35729,
    'assign': function(curr, def){
      return (curr || def);
    }
  },
  'tty': {
    'short': 't',
    'value': 'auto',
    'assign': function(curr, def){
      var tty = (curr || def);
      tty =
        tty !== 'never' &&
        tty !== 'false' &&
        tty !== false &&
        TTY.isatty()
          ? true
          : false;
      return tty;
    }
  },
  'ignore': {
    'short': 'i',
    'value': [
      'node_modules',
      '.git'
    ],
    'assign': function(prev, curr){
      var out = (prev || []).concat(curr || []);
      debug('ignore', out);
      return out;
    }
  }
}
