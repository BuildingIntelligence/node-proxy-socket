"use strict";
var util = require('util');
var EventEmitter = require('events');
var _   = require('lodash');
var net = require('net');
var tls = require('tls');
var debug = require('debug')('ProxySocket');


/** REQUIREMENTS for AMQP:
Support socket#setNoDelay()
Support socket.connect({noDelay:true})

Example to set up proxy methods:

  // Proxy events.
  // Note that if we don't attach a 'data' event, no data will flow.
  var events = ['close', 'connect', 'data', 'drain', 'error', 'end', 'secureConnect', 'timeout'];
  _.forEach(events, function(event){
    self.socket.on(event, self.emit.bind(self, event));
  });

  // Proxy a few methods that we use / previously used.
  var methods = ['destroy', 'write', 'pause', 'resume', 'setEncoding', 'ref', 'unref', 'address'];
  _.forEach(methods, function(method){
    self[method] = function(){
      self.socket[method].apply(self.socket, arguments);
    };
  });

*/



/* Wrapper around Socket */
var ProxySocket = modules.export = function(opts){
	EventEmitter.call(this);
	if ('string' == typeof opts) opts = url.parse(opts);
	if (opts.host && opts.path) {
		// if both a `host` and `path` are specified then it's most likely the
		// result of a `url.parse()` call... we need to remove the `path` portion so
		// that `net.connect()` doesn't attempt to open that as a unix socket file.
		delete opts.path;
		delete opts.pathname;
	}

	// if `true`, then connect to the proxy server over TLS. defaults to `false`.
	this.secureProxy = proxy.protocol ? /^https:?$/i.test(proxy.protocol) : false;

	this.proxy = opts;
	this.socket = new net.Socket();
}
util.inherits(ProxySocket, EventEmitter);




ProxySocket.prototype.connect = function(options, connectListener){
	var socket = this.socket;
	var proxy = this.proxy;

	var buffers = [];
	var buffersLength = 0;

	function ondata(data){
		buffers.push(b);
		buffersLength += b.length;
		var buffered = Buffer.concat(buffers, buffersLength);
		var str = buffered.toString('ascii');

		if (!~str.indexOf('\r\n\r\n')) {
			// keep buffering
			debug('have not received end of HTTP headers yet...');
			socket.once('data', ondata);
			return;
		}

		var firstLine = str.substring(0, str.indexOf('\r\n'));
		var statusCode = +firstLine.split(' ')[1];
		debug('got proxy server response: %o', firstLine);

		if (200 == statusCode) {
			// 200 Connected status code!
			var sock = socket;

			// nullify the buffered data since we won't be needing it
			buffers = buffered = null;

			if (opts.secureEndpoint) {
				// since the proxy is connecting to an SSL server, we have
				// to upgrade this socket connection to an SSL connection
				debug('upgrading proxy-connected socket to TLS connection: %o', opts.host);
				opts.socket = socket;
				opts.servername = opts.host;
				opts.host = null;
				opts.hostname = null;
				opts.port = null;
				sock = tls.connect(opts);
			}

			cleanup();
			fn(null, sock);
		} else {
			// some other status code that's not 200... need to re-play the HTTP header
			// "data" events onto the socket once the HTTP machinery is attached so that
			// the user can parse and handle the error status code
			cleanup();

			// save a reference to the concat'd Buffer for the `onsocket` callback
			buffers = buffered;

			// need to wait for the "socket" event to re-play the "data" events
			req.once('socket', onsocket);
			fn(null, socket);
		}
	}

	function onsocket(socket){
		socket.emit('data', buffers);
		buffers = null;
	}

	function onclose(err){
		debug('onclose had error %o', err);
	}

	function onerror(err){
		debug('onerror called with %o', err);
		cleanup();
		connectListener(err);
	}

	function cleanup(){
		socket.removeListener('data', ondata);
		socket.removeListener('end', onend);
		socket.removeListener('error', onerror);
		socket.removeListener('close', onclose);
	}

	socket.on('error', onerror);
	socket.on('close', onclose);
	socket.on('end', onend);
	socket.once('data', ondata);

	function openTunnel() {
		socket.write('CONNECT ' + options.host + ':' + options.port + ' HTTP/1.1\r\n');
		socket.write('Connection: close\r\n');
		if (proxy.auth) {
			socket.write('Proxy-Authorization: Basic ' + new Buffer(proxy.auth).toString('base64');)
		}

		socket.write('\r\n'); //End request
	}

	socket.connect(proxy, openTunnel);

	return this;
}