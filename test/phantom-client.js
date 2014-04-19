/**
 * Module dependencies
 */

var system = require('system');
var page = require('webpage').create();
var ready = require('webpage').create();
var done = require('webpage').create();

var host = system.args[1];

page.onNavigationRequested = function(a, b, c) {
  if (b !== 'Reload') return;
  done.open(host + '/it-worked', function() {
     phantom.exit();
  });
}

page.open(host, function(status) {
  ready.open(host + '/ready');
});
