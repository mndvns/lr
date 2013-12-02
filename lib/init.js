
/**
 * Module dependencies.
 */

var server = require('./server');
var watch = require('./watch');
var exec = require('child_process').exec;
var resolve = require('path').resolve;
var exists = require('fs').existsSync;
var yaml = require('js-yaml');
var cwd = process.cwd();
var log;

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
  this.log = log = require('./utils').log(options);
  this.reload = server(options);

  if (!options.args.length) this.load(options.file);
}

/**
 * Read configuration file.
 * @param {String} file
 */

Initialize.prototype.load = function(file) {
  if (this.options.ignore) return this.fallback();
  var dotfile = resolve(cwd, file)
  if (!exists(dotfile)) return this.fallback();
  var config = require(dotfile);
  log('loading', shrinkPath(dotfile) + ' config file');
  for (var k in config) {
    this.run(k, config[k], this.options);
  }

}

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
  var reload = this.reload;
  var cmd = createCommand(command, options);
  var cmdMsg = command
    ? ' -> '.grey + ('`' + command.replace(options.mute, '') + '`')
    : '';

  log('monitor', path + cmdMsg);

  watch(path, function(err, p, msg) {
    log(msg, shrinkPath(p));
    if (err) return console.error(err.stack || err);
    if (!cmd) return reload(p);
    cmd(function() {
      reload(p);
    });
  });

  if (typeof cb === 'function') cb();
}


/**
 *  Parse and wrap `command` as executable child process.
 *  @param {String} command
 *  @param {Object} options
 *  @api public
 */

function createCommand(command, options) {
  if (!command) return;
  options = options || {};
  var mute = command.charAt(0) === options.mute;
  if (mute) command = command.slice(1);
  return function(opts, cb) {
    if (typeof cb !== "function") {
      cb = opts;
      opts = {};
    }
    exec(command, function(err, stdout) {
      if (err) return console.error(err);
      if (stdout) process.stdout.write(stdout);
      if (mute && opts.mute !== false) return;
      if (typeof cb === 'function') cb();
    });
  }
}

/**
 * Cut off `cwd` from path for brevity.
 * @param {String} path
 */

function shrinkPath(path) {
  return path.replace(process.cwd() + '/', '');
}
