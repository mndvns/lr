
var exec = require('child_process').exec;

describe('lr', function() {
  it('--help', function(done) {
    exec('bin/lr --help', function(err, stdout) {
      if (err) return done(err);
      stdout.should.include('Usage:');
      stdout.should.include('Options:');
      stdout.should.include('-h, --help');
      stdout.should.include('-V, --version');
      done();
    });
  });
  it('--version', function(done) {
    exec('bin/lr --version', function(err, stdout) {
      if (err) return done(err);
      stdout.should.include('0.1');
      done();
    });
  });
});
