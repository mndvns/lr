
/**
 * Expose `connect`.
 */

module.exports = connect;

/**
 * Connect to a livereload server from the browser.
 * @param {Number} port
 */

function connect(port) {

  /**
   * We set a global variable to be referenced by `lib/client.js`.
   */

  window.livereload_port = port;

  /**
   * Write a script to the window. This is essentially all that the livereload browser
   * extensions do; we are just doing it ourselves so we can set the port.
   *
   * Also we don't have to click any buttons :D
   */

  document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] +
  ':' + port + '/livereload.js?snipver=1"></' + 'script>')

  /**
   * Initialize the client script.
   */

  require('./lib/client.js');
}