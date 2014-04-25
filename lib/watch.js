/**
 * Module dependencies.
 */

var debug = require('debug')('lr:watch');
var Watcher = require('sane').Watcher;
var exec = require('child_process').exec;
var minimatch = require('minimatch');
var path = require('path');
var defaults = require('./defaults');

/**
 * Watch a collection of `globs` and run `cmd` on changes.
 *
 * Note:
 *
 *   The `globs` keys should be paths while the values should
 *   be objects with a `cmd` and `muted`.
 *
 *   Example:
 *
 *     {
 *       '*.js': {
 *         cmd: 'make index.js',
 *         muted: false,
 *       },
 *       '*.css': {
 *         cmd: 'make index.css',
 *         muted: true,
 *       }
 *     }
 *
 *
 * @param {Object} globs
 * @param {Object} opts
 * @param {Function} cb
 */

exports = module.exports = function (globs, opts, cb){
  opts = opts || {};
  debug('opts', opts);

  normalize(globs, opts);

  var oldwatch = Watcher.prototype.watchdir;
  Watcher.prototype.watchdir = function(dir){
    for (var i = 0, l = opts.ignore.length; i < l; i++) {
      var key = opts.ignore[i];
      if (!~key.indexOf('*') && ~dir.indexOf(key)) return; // debug('ignoring', dir);
      if (minimatch(dir, key)) return; // debug('ignoring', dir);
    }
    debug('watching', dir);
    oldwatch.apply(this, arguments);
  };

  debug('globs', globs);

  var watcher = new Watcher(opts.root, {glob: Object.keys(globs)});

  watcher.on('ready', handle.bind(watcher, 'ready'));
  watcher.on('change', handle.bind(watcher, 'change'));
  watcher.on('add', handle.bind(watcher, 'add'));
  watcher.on('delete', handle.bind(watcher, 'delete'));

  function handle(type, file) {
    debug('handle - ' + type, file || '');
    Object.keys(globs).forEach(function(glob) {
      if (!file || !minimatch(file, glob)) return;
      var conf = globs[glob];
      var cmd = conf.cmd;
      var muted = conf.muted;

      cmd(file, function(err) {
        if (err) return console.error(err.stack || err.message);
        if (!cb) return;
        cb(file, muted);
      });
    });
    return;
  }

  process.once('SIGINT', close);
  process.once('SIGTERM', close);

  function close(){
    return watcher.close();
  }

  return watcher;
};

function normalize(globs, opts) {
  Object.keys(globs).forEach(function(glob) {
    var cmd = globs[glob].cmd;
    debug('normalize glob', glob);
    if (typeof cmd === 'undefined' || cmd === null) cmd = noop;
    if (typeof cmd === 'string') cmd = run(cmd, opts);
    globs[glob].cmd = cmd;
  });
}

/**
 * Create and return a `cmd` for `watch.
 *
 * @param {String} cmd
 * @param {Object} opts
 */

function run(cmd, opts){
  var silent = opts.silent;
  var root = opts.root;
  opts = {cwd: root};
  return function(path, cb){
    return exec(cmd, opts, function(err, stdout, stderr){
      if (err) return cb(err);
      if (stderr) return cb(new Error(stderr));
      if (silent !== true && stdout) process.stdout.write(stdout);
      cb();
    });
  };
}

function noop(path, cb) {
  cb();
}
