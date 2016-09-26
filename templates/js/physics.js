// Consts
var FIGURE_SIZE = 50;
var COLORS = ["ff9b25", "ffcf00", "16cc90", "3cd1e6", "a74fe4"];
var WALL_COLORS = ["eeeeee", "eeeeee", "ffffff"];

// Physics stuff
var bodies = {};
var bodies_by_uid = {};
var bodies_display = {};

var holes = [];
var holes_by_uid = {};

var size = {
  width: 800,
  height: 400
};

function knowAbout(body) {
  bodies[body.id] = body;
  bodies_by_uid[body.uid] = body;
  bodies_display[body.id] = body;
}

function unknowAbout(body) {
  delete bodies[body.id];
  delete bodies_by_uid[body.uid];
}

// Module aliases
var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    MouseConstraint = Matter.MouseConstraint,
    Events = Matter.Events,
    Body = Matter.Body,
    Composite = Matter.Composite,
    Vector = Matter.Vector;

// Create an engine
var engine = Engine.create();



// Bind to mouse
var mouseconstraint = MouseConstraint.create(engine, {
  element: document.getElementById("container")
});
World.add(engine.world, [mouseconstraint]);

// Run
Engine.run(engine);

$(document).ready(function(){
  // Update container size
  $("#container")[0].width = size.width = $("#container").width();
  $("#container")[0].height = size.height = $("#container").height();
  console.log("  Physics: world size is " + size.width + "x" + size.height);

  // Create walls
  var walls = [];
  walls.push(Bodies.rectangle(size.width/2, size.height, size.width, 5, { isStatic: true }));
  walls.push(Bodies.rectangle(size.width, size.height/2, 5, size.height*3, { isStatic: true }));
  walls.push(Bodies.rectangle(0, size.height/2, 5, size.height*3, { isStatic: true }));
  walls.push(Bodies.rectangle(size.width/2, -300, size.width, 5, { isStatic: true }));
  for (var key in walls) {
    var wall = walls[key];
    Body.set(wall, "color", WALL_COLORS.pop());
    Body.set(wall, "purpose", "wall");
    Body.set(wall, "uid", "wall_"+key);
    knowAbout(wall);
  }
  World.add(engine.world, walls);
});
