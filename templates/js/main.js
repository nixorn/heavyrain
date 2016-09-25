var autoRotator = false;

function throwBody(body_uid, hole_uid) {
  socket.emit('put',
    {
      figure_uid: body_uid,
      hole_uid: hole_uid
    },
    function(message) {
      if (message == 'ok') {
        console.log("put ok");
        var score = bodies_by_uid[body_uid].vertices.length;
        if (score > 10) {
          $("#score").text(parseInt($("#score").text())+1);
        } else {
          $("#score").text(parseInt($("#score").text())+score);
        }

        var body = bodies_by_uid[body_uid];
        Composite.removeBody(engine.world, body);
        unknowAbout(body);
      } else {
        console.log("Socket.IO: put:", message);
      }
    }
  );
}

function decrementBody(body_uid) {

}

var bobr1 = new bobr('143jf',$('#container'));
bobr1.beaver_run(400, "abc");

var bobr_index = 0;
setInterval(function(){

  var good_bodies = [];
  for (var key in bodies) {
    var body = bodies[key];
    if (body.purpose == "body") {
      good_bodies.push(body);
    }
  }
  var targ = pickRandom(good_bodies);
  var targ_uid = targ.uid;
  console.log("want eat", targ_uid);
  console.log("targ", targ);
  console.log("at pos", targ.position.x);

  bobr_index = bobr_index + 1;
  var bobr_int = new bobr('143jf'+bobr_index,$('#container'));
  bobr_int.beaver_run(parseInt(targ.position.x), targ_uid);

}, 20000);


function eatFigure(x, body_uid) {
  var good_bodies = {};
  for (var key in bodies) {
    var body = bodies[key];
    if (body.purpose == "body") {
      good_bodies[body.uid] = body;
    }
  }
  if (body_uid in good_bodies) {
    var eated = good_bodies[body_uid];
    var eated_x = eated.position.x;
    if (Math.abs(eated_x - x) < 200) {
      console.log("eat!");
      return true;
    } else {
      console.log("too far");
      return false;
    }
  } else {
    console.log("no figure to eat");
    return false;
  }

  return true;
}

function decrementFigure(body_uid) {
  socket.emit("decrement", {figure_uid: body_uid},
    function(message) {
      if (message == "ok") {
        decrementBody(body_uid);
      }
    }
  );
}

Events.on(mouseconstraint, "startdrag", function(event){
  autoRotator = true;
  var body = event.body;
  var good_holes = [];
  holes.forEach(function(hole) {
    if (hole.vertices.length == body.vertices.length) {
      good_holes.push(hole);
    }
  });
  (function autoRotate(){
    var nearest = findNearest(body, good_holes).body;
    var dist = findNearest(body, good_holes).dist;
    if (nearest) {
      Body.setAngle(body, body.angle - (body.angle - nearest.angle)/dist);
      var diff_x = Math.abs(aimAxis(body.position, "x") - nearest.position.x);
      var diff_y = Math.abs(aimAxis(body.position, "y") - nearest.position.y);
      if (diff_x < 30 && diff_y < 30 && body.vertices.length == nearest.vertices.length && body.speed < 2 && Math.abs(body.angle - nearest.angle) < 0.05) {
        throwBody(body.uid, nearest.uid);
        autoRotator = false;
      }
    }
    if (autoRotator) { window.requestAnimationFrame(autoRotate); }
  })();
});

Events.on(mouseconstraint, "enddrag", function(event){
  autoRotator = false;
});
