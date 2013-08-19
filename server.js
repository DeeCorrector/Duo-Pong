var connect = require('connect');

var app = connect.createServer(
  connect.static( __dirname + '/' )
).listen(6969)

var io = require('socket.io').listen(app);



io.sockets.on('connection', function(socket){
  
  socket.on('draw', function(data){
    io.sockets.emit( 'update', data );
  });
  
});
