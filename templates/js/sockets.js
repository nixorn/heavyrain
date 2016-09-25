var socket;

$(document).ready(function(){

  var namespace = '/game';
  var options = {
    reconnection: false,
    reconnect: false
  };

  if (location.href.indexOf('file') > -1) {
    socket = io.connect('http://rain.cancode.ru' + namespace, options);
  } else {
    socket = io.connect('http://' + document.domain + ':' + location.port + namespace, options);
  }

  socket.on("connect", function(){
    console.log("Socket.IO: connected");
    socket.emit('start');
  });

  socket.on("disconnect", function() { console.log("Socket.IO: disconnected"); });
  socket.on("put_success", function() { console.log("Socket.IO: put_success"); });
  socket.on("put_failed", function() { console.log("Socket.IO: put_failed"); });

  socket.on('start_game', function(data) {
    console.log("Socket.IO: start_game");

    data.data.figures.forEach(function(figure){
      var body = generateBody({
        x: roundRand(100, size.width-100),
        y: -100,
        angles: figure.vertex,
        purpose: "body",
        uid: figure.uid
      });
      World.add(engine.world, body);
      knowAbout(body);
    });

    var holes_zone = size.width - size.width/4;
    var holes_offset = size.width/8;
    var holes_step = holes_zone / (data.data.holes.length);
    var holes_coords = [];
    for (var key in data.data.holes) {
      holes_coords.push((parseInt(key)+1)*holes_step);
      // holes_coords.push()
    }
    data.data.holes.forEach(function(hole){
      var body = generateBody({
        x: holes_coords.pop(),
        y: size.height/3,
        angles: hole.vertex,
        purpose: "hole",
        uid: hole.uid
      });
      Body.setStatic(body, true);
      Body.set(body, "isSensor", true);
      World.add(engine.world, body);
      holes.push(body);
      knowAbout(body);
    });

    // holes.forEach(function(hole){ addFigure(hole.vertex, "hole", hole.uid); });
  });

  socket.on("new_figure", function(data) {
    console.log("Socket.IO: new_figure");
    // var figure = data.data.figure;
    // pendingFigures[data.data.hole_uid] = data.data.figure.uid;
  });

  socket.on("figure_is_coming", function(data) {
    console.log("Socket.IO: figure_is_coming");
    // var hole = holes_by_id[data.data.hole_uid];
  });

  socket.on("remove_figure", function(uid) {
    console.log("Socket.IO: remove_figure");
    // Composite.removeBody(engine.world, bodies[uid]);
  });

});
