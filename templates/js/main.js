var autoRotator = false;

var bodies_saved_by_hole_uid = {};

function saveUpBody(hole_uid, body) {
  bodies_saved_by_hole_uid[hole_uid] = body;
}

function restoreBody(hole_uid) {
  var body = bodies_saved_by_hole_uid[hole_uid];
  console.log("restoring", body);
  Body.setStatic(body, false);
  Body.setMass(body, 5);
  Body.setVertices(body, body.vertices);
  World.add(engine.world, body);
  knowAbout(body);
  if (body.id in figures) {
    figures[body.id]['state'] = 'growing_fast';
  }
  delete bodies_saved_by_hole_uid[hole_uid];
}

function throwBody(body_uid, hole_uid) {
  socket.emit('put',
    {
      figure_uid: body_uid,
      hole_uid: hole_uid
    },
    function(message) {
      if (message == 'ok') {
        console.log("Socket.IO: put:", message);
      } else {
        console.log("Socket.IO: put:", message);
      }
    }
  );

  var body = bodies_by_uid[body_uid];
  Composite.removeBody(engine.world, body);
  saveUpBody(hole_uid, body);
  unknowAbout(body);
}

function decrementBody(body_uid) {

}

// var bobr1 = new bobr('143jf',$('#container'));
// bobr1.beaver_run(400, "abc");

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

  bobr_index = bobr_index + 1;
  var bobr_int = new bobr('143jf'+bobr_index,$('#container'));
  bobr_int.beaver_run(parseInt(targ.position.x), targ_uid);

}, 15000);


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
      return true;
    } else {
      return false;
    }
  } else {
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
  console.log("picked:", body.uid, body.purpose);
  if (body.uid.indexOf("from_hole") > -1) {
    var from_hole = body.uid.replace("from_hole_","");
    socket.emit("hit", from_hole);
    Composite.removeBody(engine.world, body);
    unknowAbout(body);
  } else {
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
        if (body.angle != nearest.angle) {
          Body.setAngle(body, body.angle - (body.angle - nearest.angle)/(dist*0.1));
        }
        var diff_x = Math.abs(aimAxis(body.position, "x") - nearest.position.x);
        var diff_y = Math.abs(aimAxis(body.position, "y") - nearest.position.y);
        if (diff_x < 5 && diff_y < 5 && body.vertices.length == nearest.vertices.length && body.speed < 5 && Math.abs(body.angle - nearest.angle) < 0.05) {
          console.log("throwing", body.uid, "to hole", nearest.uid);
          throwBody(body.uid, nearest.uid);
          autoRotator = false;
        }
      }
      if (autoRotator) { window.requestAnimationFrame(autoRotate); }
    })();
  }
});

Events.on(mouseconstraint, "enddrag", function(event){
  autoRotator = false;
});
