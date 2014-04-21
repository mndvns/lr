/**
 * Module dependencies
 */

var should = require('should');
var watch = require('../lib/watch');
var touch = require('./utils').touch;

describe('watcher', function(){
  var watcher;
  afterEach(function() {
    watcher.close();
  });

  it('should call a function on change', function(done) {
    var path = 'fixtures/watcher/component.json';
    var globs = {
      'fixtures/*/*.json': {
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
    var json = 'fixtures/watcher/component.json';
    var yml = 'fixtures/watcher/.lr.yml';

    var globs = {
      'fixtures/*/*.json': {
        cmd: 'touch ' + yml,
        ignore: true
      },
      'fixtures/*/.*.yml': {
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
