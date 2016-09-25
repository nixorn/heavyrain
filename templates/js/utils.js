// Darken color (in: "ff0000", return: "df0000")
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

// Return random number from min to max
function roundRand(min, max) {
  var range = max - min;
  return min + Math.round(Math.random()*range);
}

// Return random element from array
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// FPS counter stuff
var fpsContainer;
var lastCalledTime;
var fps;
var average_fps = 0;

// Holds up on an element and sink FPS into it
function countFPS(element) {
  if (!fpsContainer) {
    fpsContainer = $(element);
  }
  if (!lastCalledTime) {
     lastCalledTime = Date.now();
     fps = 0;
  } else {
    delta = (Date.now() - lastCalledTime)/1000;
    lastCalledTime = Date.now();
    fps = 1/delta;
    average_fps = average_fps + ((fps - average_fps)/10);
    fpsContainer.text(Math.round(average_fps));
  }
}

// Return nearst to body from targets
function findNearest(body, targets) {
  var dist = 20000;
  var result = false;
  for (var key in targets) {
    var target = targets[key];
    var newdist = Math.abs(body.position.x - target.position.x) + Math.abs(body.position.y - target.position.y);
    if (newdist < dist) {
      result = target;
      dist = newdist;
    }
  }
  return {
    body: result,
    dist: dist
  };
}

// Generate
function generateBody(options) {
  var x = options.x,
      y = options.y,
      angles = options.angles,
      purpose = options.purpose,
      uid = options.uid;
  var color = pickRandom(COLORS);

  var body = Bodies.polygon(x, y, angles, FIGURE_SIZE);
  if (uid) { Body.set(body, "uid", uid); }
  if (purpose) { Body.set(body, "purpose", purpose); }
  Body.set(body, "color", color);
  return body;
}
