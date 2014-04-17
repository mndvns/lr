/**
 * Module dependencies
 */

var handle = require('./server');
var express = require('express');
var fs = require('fs');
var watch = require('./watch');

var DEFAULT_CLIENT = __dirname + '/client.js';

// expose LR

module.exports = LR;

/**
 * Create an LR instance
 *
 * @param {String} client
 */

function LR(client) {
  if (!(this instanceof LR)) return new LR(client);
  this._client = initClient(client || DEFAULT_CLIENT);
  this._watchers = {};
}

/**
 * Watch a path and execute a comment
 *
 * @param {String} path
 * @param {String|Function} command
 * @param {Boolean} ignore
 */

LR.prototype.watch = function(path, command, ignore) {
  var self = this;
  var opts = {
    silent: this.silent,
    root: this.root
  };
  watch(path, command, opts, function(path) {
    if (!path || ignore) return;
    self.reload(path);
  });
  return this;
};

/**
 * Start a server
 */

LR.prototype.listen = function() {
  var app = express();
  app.use('/livereload.js', this.client());
  var server = app.listen.apply(app, arguments);
  this.attach(server);
  process.once('SIGTERM', close);
  process.once('SIGINT', close);
  function close() {
    server.close();
  };
  return server;
};

/**
 * Attach a websocket handler to the LR instance
 *
 * @param {HTTPServer} server
 */

LR.prototype.attach = function(server) {
  this._reload = handle(server);
  return this;
};

/**
 * Install the client middleware
 *
 * @return {Middleware}
 */

LR.prototype.client = function() {
  var self = this;
  return function livereload(req, res, next) {
    self._client(function(err, content) {
      if (err) return next(err);
      res.set('content-type', 'text/javascript');
      res.send(content);
    });
  };
};

/**
 * Reload a file at 'path'
 *
 * @param {String} path
 * @param {Function} fn
 */

LR.prototype.reload = function(path, fn) {
  if (!this._reload) return fn(new Error('LR server has not been attached to HTTP server'));
  this._reload(path, fn);
  return this;
};

/**
 * Use function
 *
 * @param {Function} fn
 */

LR.prototype.use = function(fn) {
  fn(this);
  return this;
};

/**
 * Supress logs
 */

LR.prototype.silent = function(arg) {
  this._silent = !arg;
};

/**
 * Resolve `client.js` path and return file data.
 * @param {String} path
 */

function initClient(path) {
  var file;
  return function(fn) {
    if (file) return fn(null, file);
    fs.readFile(path, 'utf8', function(err, data) {
      if (err) return fn(err);
      file = data;
      fn(null, file);
    });
  };
}
