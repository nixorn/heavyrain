// Render stuff
var figures = {};
var stage;
var center = {
  x: 400,
  y: 200
};
var DEPTH = 10;

acgraph.useAbsoluteReferences(true);


function extractCoords(point) {
  return [parseFloat(point.x.toFixed(1)), parseFloat(point.y.toFixed(1))]
}

function drawFigure(options) {
  var figure_id = options.figure_id,
      angles = options.angles,
      purpose = options.purpose,
      color = options.color;

  switch (purpose) {
    case 'body':
      drawBody({
        figure_id: figure_id,
        angles: angles,
        color: color
      });
      break;
    case 'wall':
      // drawWall(figure_id, angles, color);
      break;
    case 'hole':
      drawHole(figure_id, angles);
      break;
  }
}

function DrawSingle(options) {
  var figure_id = options.figure_id,
      angles = options.angles,
      color = options.color,
      is3d = options.is3d,
      z_index = options.z_index;
  if (!(figure_id in figures)) {
    figures[figure_id] = {};
  }
  if (is3d) {
    draw_3d(figure_id, angles, '#'+darken(color), z_index);
  }
  var linePath = acgraph.path();
  linePath.parent(stage);
  $.each(angles, function(index, value) {
    if (index == 0) { linePath.moveTo(
      pushCoordinate(value.x, center.x, figures[figure_id]['offset']),
      pushCoordinate(value.y, center.y, figures[figure_id]['offset'])
    ); } else { linePath.lineTo(
      pushCoordinate(value.x, center.x, figures[figure_id]['offset']),
      pushCoordinate(value.y, center.y, figures[figure_id]['offset'])
    );}
  });
  linePath.fill('#'+color);
  linePath.stroke("#"+darken(color));
  linePath.close();
  figures[figure_id]['main'] = linePath;
  figures[figure_id]['main'].fill('#'+color);
  figures[figure_id]['main'].zIndex(z_index);
}

var attract_direction = 0.01;

function pushCoordinate(coord, target, offset) {
  if (!(offset == 0)) {
    var coord_real = coord;
    var coord_walled = aimDepth(coord, target, DEPTH);
    return coord_real - (coord_real - coord_walled)*offset;
  } else {
    return coord;
  }
}

function drawBody(options) {
  var figure_id = options.figure_id,
      angles = options.angles,
      color = options.color;

  // If body removed we fading figure away
  if (!(figure_id in bodies)) {
    figures[figure_id]['state'] = "fading";
  }

  var figure_attr = '';
  var k = (angles.length/2-1).toFixed();
  var center_figure = {
    x: (angles[0].x+angles[k].x)/2,
    y: (angles[0].y+angles[k].y)/2
  };
  var z_index = 20000 - Math.ceil(
    Math.abs(center.x-center_figure.x)
    +
    Math.abs(center.y-center_figure.y)
  );

  if (!(figure_id in figures)) {
    figures[figure_id] = {};
  }

  if (figure_id in figures && 'main' in figures[figure_id]) {
    var steps = [];
    steps.push("M");
    $.each(angles, function(index, value) {
      steps.push(pushCoordinate(extractCoords(value)[0], center.x, figures[figure_id]['offset']));
      steps.push(pushCoordinate(extractCoords(value)[1], center.y, figures[figure_id]['offset']));
    });
    steps.splice(3, 0, "L");
    steps.push("Z");
    figure_attr = steps.join(" ");
    if (figures[figure_id]['main'].attr('d') == figure_attr) {

    } else {
      draw_3d(figure_id, angles, '#'+darken(color), z_index);
      figures[figure_id]['main'].attr('d', figure_attr);
      figures[figure_id]['main'].zIndex(z_index);
    }
  } else {
    figures[figure_id] = {};
    figures[figure_id]['state'] = 'growing';
    figures[figure_id]['offset'] = 1.0;
    DrawSingle({
      figure_id: figure_id,
      angles: angles,
      color: color,
      is3d: true,
      z_index: z_index
    });
    figures[figure_id]['main'].zIndex(z_index);
    figures[figure_id]['main'].stroke("#"+darken(color));
  }

  // ATTRACT OFFSET
  if ('offset' in figures[figure_id]) {

    if (figures[figure_id]['state'] == "growing" || figures[figure_id]['state'] == "growing_fast") {
      if (figures[figure_id]['offset'] > 0) {

        if (figures[figure_id]['state'] == "growing_fast") {
          figures[figure_id]['offset'] = figures[figure_id]['offset'] - 0.1;
        } else {
          figures[figure_id]['offset'] = figures[figure_id]['offset'] - 0.01;
        }
      } else {
        figures[figure_id]['offset'] = 0;
        figures[figure_id]['state'] = "calm";
      }
    }

    if (figures[figure_id]['state'] == "fading" || figures[figure_id]['state'] == "fading_fast" ) {
      if (figures[figure_id]['offset'] < 1) {
        if (figures[figure_id]['state'] == "fading_fast") {
          figures[figure_id]['offset'] = figures[figure_id]['offset'] + 0.1;
        } else {
          figures[figure_id]['offset'] = figures[figure_id]['offset'] + 0.02;
        }
      } else {
        figures[figure_id]['offset'] = 1;

        // Ensure that we don't need this body anymore
        if (!(figure_id in bodies)) {
          // Removing parts
          for (var key in figures[figure_id]) {
            if (!(key == 'state' || key == 'offset')) {
              figures[figure_id][key].remove();
            }
          }
          // Removing key
          delete bodies_display[figure_id];
          delete figures[figure_id];
        }
      }
    }
  }
  // ATTRACT OFFSET

  acgraph.updateReferences();
}

function removeFigureFromRenderer(id) {
  $.each(figures[id], function(index, value) {
    value.remove();
  });
}

function drawWall(figure_id, angles, color) {
  if (!(figure_id in figures)) {
    figures[figure_id] = {};
    figures[figure_id]["offset"] = 0;
    DrawSingle({
      figure_id: figure_id,
      angles: angles,
      color: color,
      is3d: true,
      z_index: 0
    });
    draw_3d(figure_id, angles, "#" + darken(color),-1000);
  }
}

function drawHole(figure_id, angles) {
  var figure_attr = '';
  if (!(figure_id in figures && 'main' in figures[figure_id])) {
    figures[figure_id] = {};
    figures[figure_id]["offset"] = 0;
    DrawSingle({
      figure_id: figure_id,
      angles: angles,
      color: "444444",
      is3d: false,
      z_index: -1000
    });
  }
}

function aim(point) {
  return [(point.x+(center.x-point.x)/DEPTH).toFixed(1), (point.y+(center.y-point.y)/DEPTH).toFixed(1)];
}
function aimAxis(point, axis) {
  return (point[axis]+(center[axis]-point[axis])/DEPTH).toFixed(1);
}
function aimDepth(point, target, depth) {
  return (point+(target-point)/depth).toFixed(1);
}
function aimDepthReverse(point, target, depth) {
  return (point-(target-point)/depth).toFixed(1);
}
function draw_3d(figure_id, angles, color, z_index) {
  var k = (angles.length/2-1).toFixed();
  var center_figure = {
    x: (angles[0].x+angles[k].x)/2,
    y: (angles[0].y+angles[k].y)/2
  };
  var angles = Object.assign({},angles);
  angles[Object.keys(angles).length]=angles[0];
  if ('0' in figures[figure_id]) {
    for (var n = 0; n < Object.keys(angles).length - 1; n++) {
      var figure_attr = '';
      var steps = [];
      steps.push("M");
      steps.push(pushCoordinate(extractCoords(angles[n])[0], center.x, figures[figure_id]['offset']));
      steps.push(pushCoordinate(extractCoords(angles[n])[1], center.y, figures[figure_id]['offset']));
      steps.push("L");
      steps.push(aim(angles[n]));
      steps.push(aim(angles[n+1]));
      steps.push(pushCoordinate(extractCoords(angles[n+1])[0], center.x, figures[figure_id]['offset']));
      steps.push(pushCoordinate(extractCoords(angles[n+1])[1], center.y, figures[figure_id]['offset']));
      steps.push("Z");
      figures[figure_id][n].attr('d', steps.join(" "));
      figures[figure_id][n].zIndex(z_index-1);
    }
  } else {
     for (var n=0;n<Object.keys(angles).length-1;n++) {
      var linePath3d = acgraph.path();
      linePath3d.parent(stage);
      linePath3d.moveTo(
        pushCoordinate(angles[n].x, center.x, figures[figure_id]['offset']),
        pushCoordinate(angles[n].y, center.y, figures[figure_id]['offset']))
        .lineTo(aimAxis(angles[n], "x"), aimAxis(angles[n], "y"))
        .lineTo(aimAxis(angles[n+1], "x"), aimAxis(angles[n+1], "y"))
        .lineTo(
          pushCoordinate(angles[n+1].x, center.x, figures[figure_id]['offset']),
          pushCoordinate(angles[n+1].y, center.y, figures[figure_id]['offset'])
        );
      linePath3d.close();
      linePath3d.fill(color).stroke(color);
      figures[figure_id][n] = linePath3d;
      figures[figure_id][n].zIndex(z_index-1);
    }
  }
}


$(document).ready(function(){
  stage = acgraph.create('container');
  center.x = size.width/2;
  center.y = size.height/2;

  (function render() {
    window.requestAnimationFrame(render); // перенести в конец?
    var raw_bodies = Composite.allBodies(engine.world);
    for (var bid in bodies_display) { // перебор всех объектов в сцене
      var body = bodies_display[bid];
      var object_id = body.id; // id объекта
      var vertices = body.vertices; // вертексы объекта вида [{x: 243, y: 123}, {x: 141, y: 232}]
      drawFigure({
        figure_id: object_id,
        angles: vertices,
        purpose: body.purpose,
        color: body.color
      });
    }
    countFPS("#fps");
  })();

});
