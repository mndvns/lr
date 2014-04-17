
/**
 * Module dependencies.
 */

var debug = require('debug')('lr:server');
var fs = require('fs');
var path = require('path');
var Protocol = require('livereload-protocol');
var wsio = require('websocket.io');

var DEFAULT_CLIENT = __dirname + '/client.js';

/**
 * Expose livereload server
 *
 * @param {Object} opts
 */

exports = module.exports = function(server) {
  var sockets = {};

  // attach the websocket listener
  wsio
    .attach(server)
    .on('connection', function(socket) {
      debug('connecting client');
      connection(socket, sockets);
    });

  // return a function to reload a file at 'path'
  return function reload(path, fn) {
    debug('reloading ' + path);
    var message = {
      command: 'reload',
      path: path,
      liveCSS: true
    };
    for(var k in sockets) {
      sockets[k](message);
    };
  };
};

/**
 * Establish a livereload protocol
 */

var ids;
function connection(socket, sockets) {
  var id = ids++;
  var timeout;

  var parser = new Protocol('server', {
    monitoring: [Protocol.protocols.MONITORING_7],
    conncheck: [Protocol.protocols.CONN_CHECK_1]
  });

  socket.on('message', function(data) {
    debug('got data', data);
    parser.received(data);
  });
  socket.on('close', clear);
  socket.on('error', cleanup);

  parser.on('error', cleanup);
  parser.on('command', function(command) {
    if (command.command === 'ping') return send({command: 'pong', token: command.token});
  });
  parser.on('connected', function() {
    debug('client connected');
    clear();
    sockets[id] = send;

    send(parser.hello({
      id: 'lr',
      name: 'LR',
      version: require('../package.json').version
    }));
  });

  function send(msg) {
    debug('sending message', msg);
    parser.sending(msg);
    socket.send(JSON.stringify(msg));
  }

  function clear() {
    debug('clearing timeout');
    if (!timeout) return;
    clearTimeout(timeout);
    timeout = null;
  }

  function cleanup(err) {
    if (err) debug(err.stack || err.message)
    debug('cleanup socket');
    clear();
    delete sockets[id];
    try {
      socket.close();
    } catch(e) { };
  }

  timeout = setTimeout(function() {
    cleanup();
  }, 1000);
}
