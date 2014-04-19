/**
 * Module dependencies
 */

var LR = require('..');
var touch = require('./utils').touch;
var phantomjs = require('phantomjs').path;
var spawn = require('child_process').spawn;

describe('LR', function() {
  var lr;

  beforeEach(function() {
    lr = LR();

    lr.root = __dirname;

    lr.watch('*/*.json', 'echo json');
    lr.watch('*/.*.yml', 'echo yml');
    lr.watch('**', 'echo other json', true);
  });

  afterEach(function() {
    lr.stop();
  });

  it('should watch files', function(done) {
    var i = 5;

    lr.start(function(path, ignore) {
      if (!--i) done();
    });

    touch('fixtures/.lr.yml');
    touch('fixtures/component.json');
    touch('fixtures/package.json');
  });

  it('should start a server', function(done) {
    var i = 5;

    lr.listen(0);

    var port = lr._server.address().port;

    lr._app.get('/', function(req, res) {
      res.send('<script src="/livereload.js"></script>');
    });

    lr._app.get('/ready', function(req, res) {
      touch('fixtures/component.json');
      res.send(200);
    });

    lr._app.get('/it-worked', function() {
      done();
    });

    open('http://0.0.0.0:' + port);
  });
});

function open(host, ready) {
  var proc = spawn(phantomjs, [__dirname + '/phantom-client.js', host]);

  proc.stdout.on('data', function(data) {
    console.log(data.toString());
  });
}
