function distance (p1, p2) {
  const dx = Math.abs(p2[0] - p1[0])
  const dy = Math.abs(p2[1] - p1[1])
  return Math.sqrt(dx * dx + dy * dy)
}

// a, b - points of line
// c - point to check
function findSide (a, b, c) {
  const val = (c[0] - a[0]) * (b[1] - a[1]) - (b[0] - a[0]) * (c[1] - a[1])
  if (val > 0) return 1 // left, or up
  if (val < 0) return -1 // right, or down
  return 0 // on the line
}

function convexHull (points) {
  const n = points.length
  if (n === 1) return points

  if (n === 2) {
    if (points[0][0] === points[1][0] && points[0][1] === points[1][1]) {
      return [points[0]]
    }
  }

  // 3 points return points without those on the same line
  if (n === 3) {
    const side = findSide(points[0], points[1], points[2])
    if (side !== 0) {
      return points
    }

    if (distance(points[0], points[1]) >= distance(points[0], points[2])) {
      return [points[0], points[1]]
    }

    return [points[0], points[2]]
  }

  // Find the point with the minimum x-coordinate.
  let minX = 0
  for (let i = 1; i < n; i++) {
    if (points[i][0] < points[minX][0]) minX = i
  }

  const hull = []
  let p1 = minX
  let p2
  do {
    hull.push(points[p1])
    p2 = (p1 + 1) % n
    for (let i = 0; i < n; i++) {
      if (findSide(points[p1], points[p2], points[i]) === -1) p2 = i
    }
    p1 = p2
  } while (p1 !== minX)

  return hull
}

// Get the edges of a convex hull
function getEdges (hull) {
  const edges = []
  for (let i = 0; i < hull.length; i++) {
    const p1 = hull[i]
    const p2 = hull[(i + 1) % hull.length]
    const edge = [p1, p2]
    edges.push(edge)
  }
  return edges
}

// Get the axis perpendicular to an edge
function getAxis (edge) {
  const dx = edge[1][0] - edge[0][0]
  const dy = edge[1][1] - edge[0][1]
  const length = Math.sqrt(dx * dx + dy * dy)
  const axis = [dy / length, (dx ? -dx : 0) / length]
  return axis
}

// Check if two polygons overlap on an axis
function isOverlap (axis, hull1, hull2) {
  let min1 = Number.MAX_VALUE
  let max1 = Number.MIN_VALUE
  let min2 = Number.MAX_VALUE
  let max2 = Number.MIN_VALUE

  for (let i = 0; i < hull1.length; i++) {
    const p = hull1[i]
    const dot = p[0] * axis[0] + p[1] * axis[1]
    min1 = Math.min(min1, dot)
    max1 = Math.max(max1, dot)
  }

  for (let i = 0; i < hull2.length; i++) {
    const p = hull2[i]
    const dot = p[0] * axis[0] + p[1] * axis[1]
    min2 = Math.min(min2, dot)
    max2 = Math.max(max2, dot)
  }

  if (max1 < min2 || max2 < min1) {
    return false
  }

  return true
}

// Check if two convex hulls intersect using the Separating Axis Theorem (SAT)
function doHullsIntersect (hull1 = [], hull2 = []) {
  if (hull1.length < 2 || hull2.length < 2) {
    return false
  }
  // Get the edges of the hulls
  const edges1 = getEdges(hull1)
  const edges2 = getEdges(hull2)

  // Check for overlap on each axis
  for (let i = 0; i < edges1.length; i++) {
    const axis = getAxis(edges1[i])

    if (!isOverlap(axis, hull1, hull2)) {
      return false
    }
  }

  for (let i = 0; i < edges2.length; i++) {
    const axis = getAxis(edges2[i])

    if (!isOverlap(axis, hull1, hull2)) {
      return false
    }
  }

  return true
}

function getConvexHullArea (hull) {
  let total = 0

  for (let i = 0, l = hull.length; i < l; i++) {
    const addX = hull[i][0]
    const addY = hull[i === hull.length - 1 ? 0 : i + 1][1]
    const subX = hull[i === hull.length - 1 ? 0 : i + 1][0]
    const subY = hull[i][1]

    total += (addX * addY * 0.5)
    total -= (subX * subY * 0.5)
  }

  return Math.abs(total)
}

module.exports = {
  distance,
  findSide,
  convexHull,
  getEdges,
  getAxis,
  isOverlap,
  doHullsIntersect,
  getConvexHullArea
}
