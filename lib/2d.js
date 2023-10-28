function distance(p1, p2) {
  const dx = Math.abs(p2[0] - p1[0])
  const dy = Math.abs(p2[1] - p1[1])
  return Math.sqrt(dx * dx + dy * dy);
}

// a, b - points of line
// c - point to check
function findSide(a, b, c) {
  const val = (c[0] - a[0]) * (b[1] - a[1]) - (b[0] - a[0]) * (c[1] - a[1]);
  if (val > 0) return 1; // left, or up
  if (val < 0) return -1; // right, or down
  return 0; // on the line
}

function convexHull(points) {
  const n = points.length;
  if (n < 3) return points;

  // Find the point with the minimum x-coordinate.
  let minX = 0;
  for (let i = 1; i < n; i++) {
    if (points[i][0] < points[minX][0]) minX = i
  }

  const hull = [];
  let p1 = minX;
  let p2;
  do {
    hull.push(points[p1]);
    p2 = (p1 + 1) % n;
    for (let i = 0; i < n; i++) {
      if (findSide(points[p1], points[p2], points[i]) === -1) p2 = i;
    }
    p1 = p2;
  } while (p1 !== minX);

  return hull;
}

// Get the edges of a convex hull
function getEdges(hull) {
  let edges = [];
  for (let i = 0; i < hull.length; i++) {
    let p1 = hull[i];
    let p2 = hull[(i + 1) % hull.length];
    let edge = [p1, p2];
    edges.push(edge);
  }
  return edges;
}

// Get the axis perpendicular to an edge
function getAxis(edge) {
  let dx = edge[1][0] - edge[0][0];
  let dy = edge[1][1] - edge[0][1];
  let length = Math.sqrt(dx * dx + dy * dy);
  let axis = [dy / length, (dx ? -dx : 0) / length];
  return axis;
}

// Check if two polygons overlap on an axis
function isOverlap(axis, hull1, hull2) {
  let min1 = Number.MAX_VALUE;
  let max1 = Number.MIN_VALUE;
  let min2 = Number.MAX_VALUE;
  let max2 = Number.MIN_VALUE;

  for (let i = 0; i < hull1.length; i++) {
    let p = hull1[i];
    let dot = p[0] * axis[0] + p[1] * axis[1];
    min1 = Math.min(min1, dot);
    max1 = Math.max(max1, dot);
  }

  for (let i = 0; i < hull2.length; i++) {
    let p = hull2[i];
    let dot = p[0] * axis[0] + p[1] * axis[1];
    min2 = Math.min(min2, dot);
    max2 = Math.max(max2, dot);
  }

  if (max1 < min2 || max2 < min1) {
    return false;
  }

  return true;
}

// Check if two convex hulls intersect using the Separating Axis Theorem (SAT)
function doHullsIntersect(hull1 = [], hull2 = []) {
  if (hull1.length === 0 || hull2.length === 0) {
    return false;
  }
  // Get the edges of the hulls
  let edges1 = getEdges(hull1);
  let edges2 = getEdges(hull2);

  // Check for overlap on each axis
  for (let i = 0; i < edges1.length; i++) {
    let axis = getAxis(edges1[i]);

    if (!isOverlap(axis, hull1, hull2)) {
      return false;
    }
  }

  for (let i = 0; i < edges2.length; i++) {
    let axis = getAxis(edges2[i]);

    if (!isOverlap(axis, hull1, hull2)) {
      return false;
    }
  }

  return true;
}


module.exports = {
  distance,
  findSide,
  convexHull,
  getEdges,
  getAxis,
  isOverlap,
  doHullsIntersect
}