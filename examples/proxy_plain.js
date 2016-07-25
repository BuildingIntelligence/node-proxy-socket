/*
Example: Connect through HTTP proxy to regular socket
*/
var Proxy = require('../proxy');
var server = require('../echo_server');
var debug = require('debug')('test-proxy-plain');

var port = 8007;
server.start(port);

// Using HTTP_PROXY environment variable
var proxy = new Proxy();

var socket = proxy.connect({
	host: 'localhost',
	port: port
});
socket.on('connect', )



/*
describe('Proxy', function(){

	before(function(){
		server.start(port); //start echo server on 8004
	});

	it('It has a connect method', function(){
		expect(proxy.connect typeof function).to.be.true();
	});

});
*/