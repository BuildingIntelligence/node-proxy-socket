"use strict";
var _	= require('lodash');
var ProxySocket = require('./proxy_socket.js');


var Proxy = modules.export = function(options){
	_.defaults(options, {
		port: 8123,
		host: 'localhost'
	});
}

/* Factory method */
Proxy.prototype.connect = function(options, connectListener) {
	var socket = new ProxySocket(options);

}


