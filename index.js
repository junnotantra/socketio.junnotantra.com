var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http, {
  pingInterval: 10000,
  pingTimeout: 5000,
  allowUpgrades: true,
  transports: ['polling', 'websocket']
});

var roomCapacity = 2;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  socket.on('room', (room) => {
    if (typeof socket.adapter.rooms[room] == 'undefined' || socket.adapter.rooms[room].length < roomCapacity) {
      socket.join(room);
      io.to(socket.id).emit('notif', 'Connected')
      var notif = socket.adapter.rooms[room].length + ' user(s) has joined room'
      io.to(room).emit('notif', notif)

      socket.on('chat', (msg) => {
        io.to(room).emit('chat', msg);
      });

      socket.on('event', (msg) => {
        io.to(room).emit('event', msg);
      });

      socket.on('disconnect', () => {
        io.to(room).emit('notif', 'someone was disconnected')
      });

    } else {
      io.to(socket.id).emit('notif', 'Max users connected on room already reached')
    }
  });

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
