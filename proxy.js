"use strict";
var _	= require('lodash');
var ProxySocket = require('./proxy_socket.js');


var Proxy = modules.export = function(options){
	options = 
	this.socket = new ProxySocket(options)
}

/* Factory method */
Proxy.prototype.connect = function(options, connectListener) {
	var socket = new ProxySocket(options);

}


