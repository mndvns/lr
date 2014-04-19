/**
 * Module dependencies
 */

var should = require('should');
var watch = require('../lib/watch');
var exec = require('child_process').exec;

describe('watcher', function(){
  var watcher;
  afterEach(function() {
    watcher.close();
  });

  it('should call a function on change', function(done) {
    var path = 'fixtures/component.json';
    var globs = {
      '*/*.json': {
        cmd: function(file, cb) {
          file.should.eql(path);
          cb();
        }
      }
    };
    watcher = watch(globs, {root: __dirname}, function(file) {
      file.should.eql(path);
      done();
    });

    watcher.on('ready', function() {
      touch(path);
    });
  });

  it('should execute a command line string', function(done) {
    var json = 'fixtures/component.json';
    var yml = 'fixtures/.lr.yml';

    var globs = {
      '*/*.json': {
        cmd: 'touch ' + yml,
        ignore: true
      },
      '*/.*.yml': {
        cmd: function(file, cb) {
          file.should.eql(yml);
          cb();
        }
      }
    };
    watcher = watch(globs, {root: __dirname}, function(file, ignore) {
      if (ignore) return file.should.eql(json);
      file.should.eql(yml);
      done();
    });

    watcher.on('ready', function() {
      touch(json);
    });
  });
});

function touch(path, fn) {
  exec('touch ' + path, {cwd: __dirname}, function(err) {
    if (err) console.error(err.stack || err);
    if (fn) fn();
  });
}
