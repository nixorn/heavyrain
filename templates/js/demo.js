// module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    MouseConstraint = Matter.MouseConstraint,
    Events = Matter.Events,
    Body = Matter.Body,
    Composite = Matter.Composite;

// create an engine
var engine = Engine.create();

// create a ground
var ground = Bodies.rectangle(400, 350, 700, 5, { isStatic: true });
var wall_left = Bodies.rectangle(50, 210, 5, 300, { isStatic: true });
var wall_right = Bodies.rectangle(750, 210, 5, 300, { isStatic: true });

Body.set(ground, "purpose", "wall");
Body.set(wall_left, "purpose", "wall");
Body.set(wall_right, "purpose", "wall");

World.add(engine.world, [ground, wall_left, wall_right]);

// bind to mouse
var mouseconstraint = MouseConstraint.create(engine, {
  element: document.getElementById("container")
});
World.add(engine.world, [mouseconstraint]);

// run the engine
Engine.run(engine);



var colors = ["ff9b25", "ffcf00", "16cc90", "3cd1e6", "a74fe4"];

function roundRand(min, max) {
  var range = max - min;
  return min + Math.round(Math.random()*range);
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function darken(color) {
  var components_in = [],
      components_out = [];
  while (color) {
    components_in.push(color.slice(-2, color.length));
    color = color.slice(0, -2);
  }
  components_in.forEach(function(item) {
    var comp_10 = parseInt(item, 16) - 32;
    if (comp_10 < 0) { comp_10 = 0; }
    var comp_16 = comp_10.toString(16);
    if (comp_16.length < 2) {
      comp_16 = "0" + comp_16;
    }
    components_out.push(comp_16);
  });
  return components_out.reverse().join("")
}

function addFigure(angles, purpose, uid) {
  var color = pickRandom(colors);
  var body = Bodies.polygon(roundRand(100,700), roundRand(100,200), angles, 50);
  if (purpose) {
    console.log("setting purpose as", purpose);
    Body.set(body, "purpose", purpose);
    if (purpose == "hole") {
      Body.set(body, "isStatic", true);
      Body.set(body, "isSensor", true);
    }
    var state = $("<p></p>").addClass(purpose).text(purpose + " " + uid).attr("data-uid", uid);
    $("#states").append(state);
  }
  if (uid) {
    Body.set(body, "uid", uid);
  }
  World.add(engine.world, body);
}
var k =0;
var figures={};
var test;

var lastCalledTime;
var fps;
var average_fps = 0;
var socket;

$(document).ready(function(){
  $("#container")[0].width = $("#container").width();
  $("#container")[0].height = $("#container").height();

  stage = acgraph.create('container');

  (function render() {



    if(!lastCalledTime) {
       lastCalledTime = Date.now();
       fps = 0;
    } else {
      delta = (Date.now() - lastCalledTime)/1000;
      lastCalledTime = Date.now();
      fps = 1/delta;
      average_fps = average_fps + ((fps - average_fps)/10);
      $("#fps").text(Math.round(average_fps));
    }





    var bodies = Composite.allBodies(engine.world);
    window.requestAnimationFrame(render); // я бы перенёс это в конец, а может и нет
    for (var bid in bodies) { // перебор всех объектов в сцене
      var body = bodies[bid];
      var object_id = body.id; // id объекта
      var vertices = body.vertices; // вертексы объкта вида [{x: 243, y: 123}, {x: 141, y: 232}, {x: 412, y: 41}, {x: 232, y: 41}]
      draw_figure(object_id,vertices);
    }

  })();

  // UI
  $("#states").on("click", ".body", function(){
    $("#states").addClass("active");
    $(this).addClass("picked");
  });
  $("#states").on("click", ".hole", function(){
    var figure_uid = $("#states .body.picked").data("uid");
    var hole_uid = $(this).data("uid");
    console.log("TRYING:", figure_uid + " -> " + hole_uid);
    socket.emit('put', {
        figure_uid: figure_uid,
        hole_uid: hole_uid
      }
    );
    $("#states").removeClass("active");
    $(".picked").remove();
  });

  // for (var t=0;t<20;t++) {
  //   addFigure(roundRand(3,7));
  // }
  // for (var t=0;t<5;t++) {
  //   addFigure(4);
  // }

  var namespace = '/game';
  console.log("CONNECT ATTEMPT");
  socket = io.connect('http://rain.cancode.ru' + namespace);
  // socket = io.connect('http://127.0.0.1:4093' + namespace);
  var started = false;
  socket.on("connect", function(){
    if (!started) {
      socket.emit('start');
    }
    started = true;
  });
  socket.on("disconnect", function(){
    console.log("disconnected");
  });
  socket.on("put_success", function(message){
    console.log("success:", message.data);
  });
  socket.on("put_failed", function(message){
    console.log("failed:", message.data);
  });
  //
  socket.on('start_game', function(data) {
    var figures = data.data.figures;
    var holes = data.data.holes;
    holes.forEach(function(hole){
      addFigure(hole.vertex, "hole", hole.uid);
    });
    figures.forEach(function(figure){
      addFigure(figure.vertex, "body", figure.uid);
    });
  });

  // var figures = data.data.figures;
  // figures.forEach(function(figure){
  //   addFigure(figure.vertex);
  // });
});
var center = {
  x: 400,
  y: 200
};
var depth = 10;

function extractCoords(point) {
  return [point.x.toFixed(1), point.y.toFixed(1)]
}

function draw_figure(figure_id, angles) {
  var figure_attr = '';
  if (figure_id in figures && 'main' in figures[figure_id]) {
    var steps = [];
    steps.push("M");
    $.each(angles, function(index, value) {
      steps.push(extractCoords(value));
    });
    steps.splice(3, 0, "L");
    steps.push("Z");
    figure_attr = steps.join(" ");

    if (figures[figure_id]['main'].attr('d') == figure_attr) return false;
    draw_3d(figure_id, angles);
    figures[figure_id]['main'].attr('d', figure_attr);
    figures[figure_id]['main'].zIndex(Math.ceil(Math.abs(figures[figure_id]['main'].getAbsoluteX()-center.x)+Math.abs(figures[figure_id]['main'].getAbsoluteY()-center.y)));
  } else {
    figures[figure_id] = {};
    var color = pickRandom(colors);
    draw_3d(figure_id,angles,color);
    var linePath = acgraph.path();
    linePath.parent(stage);
    $.each(angles, function(index, value) {
      if (index == 0) { linePath.moveTo(value.x, value.y); }
                 else { linePath.lineTo(value.x, value.y); }
    });
    linePath.fill('#'+color);
    linePath.stroke("#"+darken(color));
    linePath.close();
    linePath.zIndex(Math.ceil(Math.abs(linePath.getAbsoluteX()-center.x)+Math.abs(linePath.getAbsoluteY()-center.y)));
    figures[figure_id]['main'] = linePath;

  }
}

function aim(point) {
  return [(point.x+(center.x-point.x)/depth).toFixed(1), (point.y+(center.y-point.y)/depth).toFixed(1)];
}
function aimAxis(point, axis) {
  return (point[axis]+(center[axis]-point[axis])/depth).toFixed(1);
}
function draw_3d(figure_id, angles,color) {
  var angles = Object.assign({},angles);
  angles[Object.keys(angles).length]=angles[0];
  if ('0' in figures[figure_id]) {
    for (var n = 0; n < Object.keys(angles).length - 1; n++) {
      var figure_attr = '';
      var steps = [];
      steps.push("M");
      steps.push(extractCoords(angles[n]));
      steps.push("L");
      steps.push(aim(angles[n]));
      steps.push(aim(angles[n+1]));
      steps.push(extractCoords(angles[n+1]));
      steps.push("Z");
      figures[figure_id][n].attr('d', steps.join(" "));
    }
  } else {
     for (var n=0;n<Object.keys(angles).length-1;n++) {
      var linePath3d = acgraph.path();
      linePath3d.parent(stage);
      linePath3d.moveTo(angles[n].x.toFixed(1), angles[n].y.toFixed(1))
        .lineTo(aimAxis(angles[n], "x"), aimAxis(angles[n], "y"))
        .lineTo(aimAxis(angles[n+1], "x"), aimAxis(angles[n+1], "y"))
        .lineTo(angles[n+1].x.toFixed(1), angles[n+1].y.toFixed(1));
      linePath3d.close();
      linePath3d.fill('#'+darken(color)).stroke('none');
      figures[figure_id][n] = linePath3d;
    }
  }
}
