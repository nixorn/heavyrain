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

  var started = false;
  var counter = 0;
  socket.on("connect", function(){
    console.log("Socket.IO: connected");
    if (!(started)) {
      socket.emit('start');
      started = true;
    }
    counter++;
    console.log("CONNECT", counter);
    $("#ok").on("click", function(){
      socket.emit("set_name", {name: $("#name").val()});
      $("#overlay").css('display', 'none');
    });
  });

  socket.on("disconnect", function() { console.log("Socket.IO: disconnected"); });
  socket.on("put_success", function() { console.log("Socket.IO: put_success"); });
  socket.on("put_failed", function() { console.log("Socket.IO: put_failed"); });

  socket.on('start_game', function(data) {
    console.log(data);
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
      holes_by_uid[hole.uid] = body;
      knowAbout(body);
    });

    if ("opponent" in data.data) {
      if (data.data.opponent) {
        var name = data.data.opponent.name;
        if (name.length > 0) {
          $("#opponent").text(name);
          console.log("setting name to", name);
        } else {
          console.log("empty name");
          $("#opponent").text("пока никого, ждём");
        }
      } else {
        console.log("no name");
        $("#opponent").text("пока никого, ждём");
      }

    } else {
      console.log("no name");
      $("#opponent").text("пока никого, ждём");
    }

  });

  socket.on("opponent_update", function(data) {
    console.log("opponent_update");
    console.log(data);
    if ("opponent" in data.data) {
      var name = data.data.opponent.name;
      if (name.length < 1) {
        $("#opponent").text("кто-то подключается...");
      } else {
        $("#opponent").text(name);
      }
    }
    if ("opponent" in data) {
      var name = data.opponent.name;
      if (name.length < 1) {
        $("#opponent").text("кто-то подключается...");
      } else {
        $("#opponent").text(name);
      }
    }
  });

  socket.on("opponent_left", function(){
    console.log("opponent_left");
    $("#opponent").text("ушёл :[");
  });

  socket.on("new_figure", function(data) {
    console.log("Socket.IO: new_figure");
    var figure_uid = data.data.figure.uid;
    var hole_uid = data.data.hole_uid;
    var old_body = bodies_by_uid["from_hole_"+hole_uid];
    Body.set(old_body, "uid", figure_uid);
    bodies_by_uid[figure_uid] = old_body;
    delete bodies_by_uid["from_hole_"+hole_uid];
    Body.setStatic(bodies_by_uid[figure_uid], false);
    Body.setMass(bodies_by_uid[figure_uid], 5);
    Body.setVertices(bodies_by_uid[figure_uid], bodies_by_uid[figure_uid].vertices);
  });

  socket.on("figure_is_coming", function(data) {
    console.log("Socket.IO: figure_is_coming");
    var hole_uid = data.data.hole_uid;
    var x = parseFloat(aimDepthReverse(holes_by_uid[hole_uid].position.x, center.x, DEPTH));
    var y = parseFloat(aimDepthReverse(holes_by_uid[hole_uid].position.y, center.y, DEPTH));
    var body = generateBody({
      x: x,
      y: y,
      angles: holes_by_uid[hole_uid].vertices.length,
      purpose: "body",
      uid: "from_hole_" + hole_uid
    });
    Body.setStatic(body, true);
    World.add(engine.world, body);
    knowAbout(body);
  });

  socket.on("hit", function(data) {
    var hole_uid = data.data.hole;
    console.log("hitted with", hole_uid);
    restoreBody(hole_uid);
  });

  socket.on("remove_figure", function(uid) {
    console.log("Socket.IO: remove_figure");
    // Composite.removeBody(engine.world, bodies[uid]);
  });

});
