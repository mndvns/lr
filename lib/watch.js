/**
 * Module dependencies.
 */

var watch = require('sane');
var exec = require('child_process').exec;
var minimatch = require('minimatch');

/**
 * Watch a `glob` and run `cmd` on changes.
 *
 * @param {String} glob
 * @param {String|Function} cmd
 * @param {Object} opts
 */

exports = module.exports = function (globs, opts, cb){
  opts = opts || {};
  opts.root = opts.root || process.cwd();
  normalize(globs, opts);

  var watcher = watch(opts.root, Object.keys(globs))
  watcher.on('ready', handle);
  watcher.on('change', handle);
  watcher.on('add', handle);
  watcher.on('delete', handle);

  function handle(file) {
    Object.keys(globs).forEach(function(glob) {
      if (!file || !minimatch(file, glob)) return;
      var conf = globs[glob];
      var cmd = conf.cmd;
      var ignore = conf.ignore;
      cmd(file, function(err) {
        if (err) return console.error(err.stack || err.message);
        if (!cb) return;
        cb(file, ignore);
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
    if (typeof cmd === 'undefined') cmd = noop;
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
