var flatiron = require('flatiron')
  , fs = require('fs')
  , path = require('path')
  , io = require('socket.io')
  , pty = require('pty.js')
  , app = flatiron.app;

var buff = []
  , socket
  , term;

var term = pty.fork(process.env.SHELL || 'sh', [], {
  name: 'xterm',
  cols: 80,
  rows: 24,
  cwd: process.env.HOME
});

term.on('data', function(data) {
  return !socket
    ? buff.push(data)
    : socket.emit('data', data);
});

console.log('Created shell with pty master/slave pair (master: %d, pid: %d)', term.fd, term.pid);

io = io.listen(app.server);

io.configure(function() {
  io.disable('log');
});

io.sockets.on('connection', function(sock) {
  socket = sock;

  socket.on('data', function(data) {
    term.write(data);
  });

  socket.on('disconnect', function() {
    socket = null;
  });

  while (buff.length) {
    socket.emit('data', buff.shift());
  }
});
