"use strict";
var util = require('util');
var EventEmitter = require('events');
var _   = require('lodash');
var net = require('net');
var tls = require('tls');

/* Wrapper around Socket */
var ProxySocket = modules.export = function(options){
	EventEmitter.call(this);
	this.proxy = options;
	this.socket = new net.Socket();
}
util.inherits(ProxySocket, EventEmitter);

ProxySocket.prototype.connect = function(options, connectListener){
	var self = this;

	function parseResponse(data){
		
	}

	self.socket.addListener('data', parseResponse);

	function openTunnel() {
		self.socket.write('CONNECT ' + options.host + ':' + options.port + ' HTTP/1.0\r\n\r\n');
	}

	self.socket.connect(self.proxy, openTunnel);

}