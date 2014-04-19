/**
 * Module dependencies
 */

var exec = require('child_process').exec;

exports.touch = function(path, fn) {
  exec('touch ' + path, {cwd: __dirname}, function(err) {
    if (err) console.error(err.stack || err);
    if (fn) fn();
  });
}
