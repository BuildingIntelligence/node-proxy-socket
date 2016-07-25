var net = require('net');

// Create simple echo server
var server = net.createServer(function(socket){
	debug("Client connected.");

	socket.on('end', function(){
		debug("Client disconnected.");
	});
	c.write('hello\r\n');
	c.pipe(c);
});
server.on('error', function(err){
	throw err;
});

module.exports.start = function(port = 8004){
	server.listen(port, function(){
		debug('Server Listening on '+port);
	});
};

module.exports.stop = function(fn) {
	server.close(fn);
};
