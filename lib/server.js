
/**
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var log;

/**
 * Expose livereload server.
 * @param {Object} opts
 */

module.exports = function(opts) {
  opts = opts || {};

  if (opts.port) process.env.LRPortOverride = opts.port;

  log = require('./utils').log(opts)
  var getClient = client(opts.client || path.resolve(__dirname, './client.js'));
  var Server = require('livereload-server');
  var app = new Server({
    id: 'com.github.camshaft',
    name: 'Better LR',
    version: '1.0',
    protocols: {
      monitoring: 7,
      saving: 1
    }
  });

  app.on('connected', function(connection) {
    log('active', 'client-server connection established');
    connection.socket.on('error', function(err) {
      if (err.code === "ECONNRESET") return;
      console.error(err.stack || err);
    });
  });

  app.on('livereload.js', function(request, response) {
    getClient(function(err, data) {
      if (err) {
        var msg = err.stack || err.toString();
        response.writeHead(500, { 'content-length': Buffer.byteLength(msg)});
        return response.end(msg);
      }
      response.writeHead(200, {
        'content-length': Buffer.byteLength(data),
        'content-type': 'text/javascript'
      });
      response.end(data);
    });
  });

  app.on('httprequest', function(url, request, response) {
    response.writeHead(404);
    response.end();
  });

  app.listen(function(err) {
    if (err) return console.error("Listening failed on %s - %s", app.port, err.message);
    log('listening', 'on port ' + app.port);
  });

  function reload(path) {
    var message = {
      command: 'reload',
      path: path,
      liveCSS: true
    };
    app.monitoringConnections().forEach(function(c) {
      c.send(message);
    });
  }

  return reload;
};

/**
 * Resolve `client.js` path and return file data.
 * @param {String} path
 */

function client(path) {
  var file;
  return function(fn) {
    if (file) return fn(null, file);
    fs.readFile(path, 'utf8', function(err, data) {
      if (err) return fn(err);
      file = data;
      fn(null, file);
    });
  };
}
