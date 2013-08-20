var connect = require('connect');

var app = connect.createServer(
  connect.static( __dirname + '/' )
).listen(6969)

var io = require('socket.io').listen(app);

function random(min,max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

var ball = {
	x: random(50,250),
	y: random(50,250),
	r: 15,
	color: "white",
	vx: random(4,8),
	vy: random(4,8)
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
    else if (data.success === "vertical") {
      // Just a placeholder: add a check if lost or went to different screen.
      ball.vx = -ball.vx;
    }

    io.sockets.emit('updateBall', ball);
  });

});

function updateStage () {
  stage.height = 69000;
  for (var key in players) {
    stage.width += players[key].screenWidth,
    stage.height = Math.min(stage.height, players[key].screenHeight);
  }
  io.sockets.emit('setStage', stage);
  // TODO: for n-gons we need to recalculate if the ball goes out of stage
  io.sockets.emit('updateBall', ball);
}