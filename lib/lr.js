/**
 * Module dependencies
 */

var debug = require('debug')('lr:lr.js');
var express = require('express');
var Emitter = require('events').EventEmitter;
var inherits = require('util').inherits;
var TTY = require('tty');
var fs = require('fs');

var defaults = require('./defaults');
var config = require('./config');
var handle = require('./server');
var watch = require('./watch');
var log = require('./utils').log;

var DEFAULT_CLIENT = __dirname + '/client.js';

// expose LR

exports = module.exports = LR;

/**
 * Create an LR instance
 *
 * @param {String} client
 * @param {String|Boolean} tty
 */

function LR(opts) {
  if (!(this instanceof LR)) return new LR(opts);
  this._options = opts = opts || {};

  for (var k in defaults) {
    var d = defaults[k];
    this['_' + k] = d.assign(opts[k], d.value);
    this._options[k] = this['_' + k];
  }

  this._client = initClient(opts.client || DEFAULT_CLIENT);
  this._config = config.loadPath(this._root, this._config);
  this._watchers = {};

  debug('LR', this);
}

inherits(LR, Emitter);

/**
 * Watch a path and execute a comment
 *
 * @param {String} path
 * @param {String|Function} command
 * @param {Boolean} muted
 */

LR.prototype.watch = function(path, command, muted) {
  this._watchers[path] = {cmd: command, muted: muted};
  this.emit('watch', path, command, muted);
  return this;
};

/**
 * Start watching the globs
 *
 * @param {Function} fn
 */

LR.prototype.start = function(fn) {
  if (this._watcher) return;

  var self = this;
  var opts = {
    silent: this.silent,
    root: this.root
  };
  if (fn) this.on('change', fn);

  this._watcher = watch(this._watchers, this._options, function(path, muted) {
    self.emit('change', path, muted);
    if (!path || muted) return;
    self.emit('reload', path);
  });

  return this;
};

/**
 * Start a server
 */

LR.prototype.listen = function() {
  var self = this;

  var app = this._app = express();
  app.use('/livereload.js', this.client());
  var server = this._server = app.listen.apply(app, arguments);

  this.attach(server);
  process.once('SIGTERM', close);
  process.once('SIGINT', close);
  function close() {
    self.stop();
  };

  this.start();

  return server;
};

/**
 * Attach a websocket handler to the LR instance
 *
 * @param {HTTPServer} server
 */

LR.prototype.attach = function(server) {
  var self = this;
  this._reload = handle(server);
  this._server = server;
  this.on('reload', function(path) {
    self.reload(path);
  });
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
 * Stop the LR server
 */

LR.prototype.stop = function() {
  if (this._server) {
    this._server.close();
    delete this._server;
  };
  if (this._watcher) {
    this._watcher.close();
    delete this._watcher;
  }
  delete this._reload;
};

LR.prototype.log = function(){
  if (this._silent === true) return;
  log(this._tty, this._port).apply(null, arguments);
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
