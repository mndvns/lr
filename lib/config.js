
/**
 * Module dependencies.
 */

var server = require('./server');
var watch = require('./watch');
var exec = require('child_process').exec;
var relative = require('path').relative;
var resolve = require('path').resolve;
var exists = require('fs').existsSync;
var yaml = require('js-yaml');
var throttleit = require('throttleit');
var cwd = process.cwd();
var log = require('./utils').log;

/**
 * Expose `initialize`.
 */

exports = module.exports = Initialize;

/**
 * Initialize a livereload server and return `run`.
 * @param {Object} options
 * @api public
 */

function Initialize(options) {
  this.options = options || {};

  if (!options.ignoreConfig) this.config = options.config;
  this.reload = server(options);
  if (!options.args.length) this.load(this.config);
}

/**
 * Read configuration config file.
 * @param {String} file
 */

Initialize.prototype.load = function(file) {
  if (!file) return this.fallback();
  var dotfile = resolve(cwd, file)
  if (!exists(dotfile)) return this.fallback();
  var config = require(dotfile);
  log('loading', shrinkPath(dotfile) + ' config file');
  for (var k in config) {
    this.run(k, config[k], this.options);
  }
};

/**
 * Fallback load for when no args
 * are given and no config file
 * is present.
 * @param {Object} options
 */

Initialize.prototype.fallback = function(options) {
  var defPath = resolve(cwd, './*');
  log('loading', 'no config loaded');
  return this.run(defPath, null, this.options);
};


/**
 * Run `command` when changes in `path` occur.
 * @param {String} path
 * @param {String} command
 * @param {Object} options
 * @param {Function} cb
 * @api public
 */

Initialize.prototype.run = function(path, command, options, cb) {
  var self = this;
  var cmd = createCommand(command, options);

  logCommand(path, command, options.mute);
  watch(path, options, function(err, p, msg) {
    if (err) return process.exit(1);
    log(msg, shrinkPath(p));
    if (!cmd) return self.reload(p);
    cmd(function() {
      self.reload(p);
    });
  });

  if (typeof cb === 'function') cb();
};

/**
 *  Parse and wrap `command` as executable child process.
 *  @param {String} command
 *  @param {Object} options
 *  @api private
 */

function createCommand(command, options) {
  if (!command) return;
  options = options || {};
  var mute = command.charAt(0) === options.mute;
  if (mute) command = command.slice(1);
  return throttleit(execCommand, 200);
  function execCommand(opts, cb) {
    if (typeof cb !== 'function') {
      cb = opts;
      opts = {};
    }
    exec(command, function(err, stdout, stderr) {
      if (stderr) return log('error', stderr.substr(1));
      if (err) return log('error', err.stack || err.message);
      if (stdout) process.stdout.write(stdout);
      if (mute && opts.mute !== false) return;
      if (typeof cb === 'function') cb();
    });
  }
}

/**
 * Log the paths and commands they trigger.
 * @param {String} path
 * @param {String} command
 * @param {String} muteChar
 * @api private
 */

function logCommand(path, command, muteChar) {
  var rel = relative(cwd, path);
  var cmd = command ? ' -> '.grey + ('`' + command.replace(muteChar, '') + '`') : '';
  log('monitor', rel + cmd);
}


/**
 * Cut off `cwd` from path for brevity.
 * @param {String} path
 * @api private
 */

function shrinkPath(path) {
  return path.replace(process.cwd() + '/', '');
}
