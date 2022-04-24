let w = 0;
let h = 0;

class ControlPoint {
  constructor(x, y) {
    this.pos = { x, y };
    this.active = false;
    this.radius = config.control_point.radius;
    this.color = config.control_point.color;
  }

  view(label = "") {
    const { x, y } = this.pos;
    push();
    noStroke();
    fill(this.color);
    circle(x, y, this.radius);
    fill("black");
    text(label, x - 3, y + 3);
    pop();
  }

  setActive(state) {
    this.active = state;

    if (this.active) {
      this.color = config.control_point.active_color;
    } else {
      this.color = config.control_point.color;
    }
  }

  serialize() {
    return { x: this.pos.x, y: this.pos.y };
  }
}

function loadCurves(data) {
  curves = [];

  for (const item of data) {
    curves.push(new BezierCurve2(item));
  }
}

class BezierCurve2 {
  constructor(controlPoints) {
    if (controlPoints) {
      this.controlPoints = controlPoints.map(
        (controlPoint) => new ControlPoint(controlPoint.x, controlPoint.y)
      );
    } else {
      this.controlPoints = [
        new ControlPoint(w / 3, (2 * h) / 3),
        new ControlPoint(w / 2, h / 3),
        new ControlPoint((2 * w) / 3, (2 * h) / 3),
      ];
    }
  }

  serialize() {
    return this.controlPoints.map((controlPoint) => controlPoint.serialize());
  }

  view() {
    if (metadata) {
      this.viewPolygon();
      for (let i = 0; i < this.controlPoints.length; i += 1) {
        const controlPoint = this.controlPoints[i];
        controlPoint.view(i + 1);
      }
    }
    this.viewCurve();
  }

  viewPolygon() {
    push();
    setLineDash([5, 5]);
    stroke(config.polygon.edges.color);
    for (let i = 0; i < this.controlPoints.length; i += 1) {
      const a = this.controlPoints[i];
      const b = this.controlPoints[(i + 1) % this.controlPoints.length];
      line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
    }
    pop();
  }

  viewCurve() {
    const lines = [];

    for (let i = 0; i < this.controlPoints.length - 1; i += 1) {
      const a = this.controlPoints[i];
      const b = this.controlPoints[(i + 1) % this.controlPoints.length];
      lines.push({ a, b });
    }

    const curvePoints = [];

    for (let t = 0; t <= 1.01; t += dt) {
      const segmentPointA = this.segmentProportionPoint(lines[0], t);
      const segmentPointB = this.segmentProportionPoint(lines[1], t);
      const curvePoint = this.segmentProportionPoint(
        { a: segmentPointA, b: segmentPointB },
        t
      );
      curvePoints.push(curvePoint);
    }

    push();
    noFill();
    stroke(config.curve.color);
    beginShape();
    for (const curvePoint of curvePoints) {
      vertex(curvePoint.pos.x, curvePoint.pos.y);
    }
    endShape();
    pop();
  }

  segmentProportionPoint(segment, t) {
    const a = createVector(segment.a.pos.x, segment.a.pos.y);
    const v = createVector(
      segment.b.pos.x - segment.a.pos.x,
      segment.b.pos.y - segment.a.pos.y
    );
    v.setMag(v.mag() * t);
    return { pos: { x: a.x + v.x, y: a.y + v.y } };
  }
}
let input;
function setup() {
  w = windowWidth;
  h = windowHeight;
  createCanvas(w, h);

  input = createFileInput(handleFile);
  input.position(215, 10);
}

function handleFile(file) {
  if (file.type !== "application" || file.subtype !== "json") {
    alert("JSON required");
  }

  const data = file.data;
  loadCurves(data);
}

function draw() {
  background("#fff");

  for (const curve of curves) {
    curve.view();
  }

  // frameRate(30);
}

function mousePressed() {
  const { radius } = config.control_point;

  for (let i = curves.length - 1; i >= 0; i -= 1) {
    const curve = curves[i];
    for (const controlPoint of curve.controlPoints) {
      const distance = dist(
        mouseX,
        mouseY,
        controlPoint.pos.x,
        controlPoint.pos.y
      );

      controlPoint.setActive(distance < radius);

      if (distance < radius) {
        return;
      }
    }
  }

  // Prevent default functionality.
  return false;
}

function mouseReleased() {
  for (const curve of curves) {
    for (const controlPoint of curve.controlPoints) {
      if (controlPoint.active) {
        controlPoint.setActive(false);
      }
    }
  }
}

// Run when the mouse/touch is dragging.
function mouseDragged() {
  for (const curve of curves) {
    for (const controlPoint of curve.controlPoints) {
      if (controlPoint.active) {
        controlPoint.pos = createVector(mouseX, mouseY);
        break;
      }
    }
  }
  // Prevent default functionality.
  return false;
}

function setLineDash(list) {
  drawingContext.setLineDash(list);
}

function keyPressed() {
  if (keyCode === UP_ARROW) {
    curves.push(new BezierCurve2());
  } else if (keyCode === DOWN_ARROW) {
    curves.pop();
  }
}
