/**
 * Module dependencies.
 */

var watch = require('sane');
var exec = require('child_process').exec;

/**
 * Watch a `glob` and run `cmd` on changes.
 *
 * @param {String} glob
 * @param {String|Function} cmd
 * @param {Object} opts
 */

exports = module.exports = function (glob, cmd, opts, cb){
  opts = opts || {};
  opts.root = opts.root || process.cwd();
  if (typeof cmd === 'undefined') cmd = noop;
  if (typeof cmd !== 'function') cmd = run(cmd, opts);

  var watcher = watch(opts.root, [glob])
  watcher.on('ready', handle);
  watcher.on('change', handle);
  watcher.on('add', handle);
  watcher.on('delete', handle);

  function handle(file) {
    cmd(file, function(err) {
      if (err) return console.error(err.stack || err.message);
      if (cb) cb(file);
    });
  }

  process.once('SIGINT', close);
  process.once('SIGTERM', close);

  function close(){
    return watcher.close();
  }

  return watcher;
};

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
      if (silent !== true) console.log(stdout);
      cb();
    });
  };
}

function noop(path, cb) {
  cb();
}
