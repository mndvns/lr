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

exports.watch = function (glob, cmd, opts){
  opts = opts || {};
  opts.root = opts.root || process.cwd();
  if (typeof cmd !== 'function') cmd = run(cmd, opts);
  var watcher = watch(opts.root, [glob])
  watcher.on('ready', cmd);
  watcher.on('change', cmd);
  watcher.on('add', cmd);
  watcher.on('delete', cmd);

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
  return function(path){
    return exec(cmd, opts, function(err, stdout, stderr){
      if (err || stderr) return console.error(err.stack || stderr);
      if (silent !== true) return console.log(stdout);
    });
  };
}
