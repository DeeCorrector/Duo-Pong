var connect = require('connect');

var app = connect.createServer(
  connect.static( __dirname + '/' )
).listen(6969)

var io = require('socket.io').listen(app);

function random(min,max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var ball = {
	x: 30, // Keep x and y in global, decode on client.
	y: 30,
	r: 15,
	color: "white",
	vx: 8,
	vy: 4
};

var players = {};

var stage = {};

io.sockets.on('connection', function(socket){

  socket.on('init', function (info) {
    info.socket = socket;
    players[socket.id] = info;
    updateStage();

    socket.emit('init', {
      ball: ball
    });
  });

  socket.on('disconnect', function () {
    delete players[socket.id];
    updateStage();
  });

  socket.on('didCollide', function(data) {
    ball = data.ball;

    if (data.success === "paddle") {
      ball.vx = -ball.vx;
    }
    else if (data.success === "horizontal") {
      ball.vy = -ball.vy;
    }

    io.sockets.emit('updateBall', ball);
  });

});

function updateStage () {
  stage.height = 69000;
  stage.width = 0;

  for (var key in players) {
    stage.width += players[key].width,
    stage.height = Math.min(stage.height, players[key].height);
  }
  var prev = null;
  for (var key in players) {
    var s = {
      width: stage.width,
      height: stage.height
    }
    if (prev !== null) {
      s.x = prev.x;
      s.y = prev.y;
    } else {
      prev = {x:players[key].width, y:0};
      s.x = 0;
      s.y = 0;
    }
    players[key].socket.emit('setStage', s);
  }
  // TODO: for n-gons we need to recalculate if the ball goes out of stage
  io.sockets.emit('updateBall', ball);
}