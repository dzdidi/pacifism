const test = require('brittle')
const { distance, findSide, convexHull, getEdges, getAxis, isOverlap, doHullsIntersect, getConvexHullArea } = require('../lib/2d')

test('distance', t => {
  let p1 = [0, 0]
  let p2 = [3, 4]
  t.is(distance(p1, p2), 5)

  p1 = [0, 0]
  p2 = [0, 0]
  t.is(distance(p1, p2), 0)

  p1 = [0, 0]
  p2 = [1, 1]
  t.is(distance(p1, p2), Math.sqrt(2))

  p1 = [0, 0]
  p2 = [1, 0]
  t.is(distance(p1, p2), 1)

  p1 = [0, 0]
  p2 = [0, -1]
  t.is(distance(p1, p2), 1)
})

test('findSide', t => {
  let a = [0, 0]
  let b = [0, 1]
  let c = [1, 1]
  t.is(findSide(a, b, c), 1)

  a = [0, 0]
  b = [0, 1]
  c = [-1, 1]
  t.is(findSide(a, b, c), -1)

  a = [0, 0]
  b = [0, 1]
  c = [0, 2]
  t.is(findSide(a, b, c), 0)
})

test('convexHull', t => {
  let points = [[0, 0], [0, 1], [1, 1], [1, 0]]
  let hull = [[0, 0], [0, 1], [1, 1], [1, 0]]
  t.alike(convexHull(points), hull)

  points = [[0, 0], [0, 1], [1, 1], [1, 0], [1, 1]]
  hull = [[0, 0], [0, 1], [1, 1], [1, 0]]
  t.alike(convexHull(points), hull)

  points = [[0, 0], [0, 1], [1, 1], [1, 0], [0.5, 0.5]]
  hull = [[0, 0], [0, 1], [1, 1], [1, 0]]
  t.alike(convexHull(points), hull)

  points = [[0, 0], [0, 1], [1, 1], [1, 0], [0.5, 0.5], [0.5, 0.75]]
  hull = [[0, 0], [0, 1], [1, 1], [1, 0]]
  t.alike(convexHull(points), hull)

  points = [[0, 0], [0, 1], [1, 1], [1, 0], [0.5, 0.5], [0.5, 0.75], [0.5, 0.25]]
  hull = [[0, 0], [0, 1], [1, 1], [1, 0]]
  t.alike(convexHull(points), hull)

  points = [[0, 0], [0, 1], [1, 1], [1, 0], [0.5, 0.5], [0.5, 0.75], [0.5, 0.25], [0.5, 0.125]]
  hull = [[0, 0], [0, 1], [1, 1], [1, 0]]
  t.alike(convexHull(points), hull)

  points = [[0, 0]]
  hull = [[0, 0]]
  t.alike(convexHull(points), hull)

  points = [[0, 0], [0, 1]]
  hull = [[0, 0], [0, 1]]
  t.alike(convexHull(points), hull)

  points = [[0, 0], [0, 1], [1, 1]]
  hull = [[0, 0], [0, 1], [1, 1]]
  t.alike(convexHull(points), hull)

  points = [[0, 0], [1, 1], [2, 2]]
  hull = [[0, 0], [2, 2]]
  t.alike(convexHull(points), hull)
})

test('getEdges', t => {
  let hull = [[0, 0], [0, 1], [1, 1], [1, 0]]
  t.alike(getEdges(hull), [[[0, 0], [0, 1]], [[0, 1], [1, 1]], [[1, 1], [1, 0]], [[1, 0], [0, 0]]])
})

test('getAxis', t => {
  let edge = [[0, 0], [0, 1]]
  t.alike(getAxis(edge), [1, 0])

  edge = [[0, 1], [1, 1]]
  t.alike(getAxis(edge), [0, -1])

  edge = [[1, 1], [1, 0]]
  t.alike(getAxis(edge), [-1, 0])

  edge = [[1, 0], [0, 0]]
  t.alike(getAxis(edge), [0, 1])
})

test('isOverlap', t => {
  let axis = [1, 0]
  let a = [[0, 0], [0, 1]]
  let b = [[0, 0], [0, 1]]
  t.is(isOverlap(axis, a, b), true)

  axis = [1, 0]
  a = [[0, 0], [0, 1]]
  b = [[1, 0], [1, 1]]
  t.is(isOverlap(axis, a, b), false)
})

test('doHullsIntersect', t => {
  let hull1 = [[0, 0], [0, 1], [1, 1], [1, 0]]
  let hull2 = [[0, 0], [0, 1], [1, 1], [1, 0]]

  t.is(doHullsIntersect(hull1, hull2), true)

  hull1 = [[0, 0], [0, 1], [1, 1], [1, 0]]
  hull2 = [[1, 0], [1, 1], [2, 1], [2, 0]]
  t.is(doHullsIntersect(hull1, hull2), true)

  hull1 = [[0, 0], [0, 1], [1, 1], [1, 0]]
  hull2 = [[2, 0], [2, 1], [3, 1], [3, 0]]
  t.is(doHullsIntersect(hull1, hull2), false)
})

test('getConvexHullArea', t => {
  let hull = convexHull([[0, 0], [1, 0], [1, 1], [0, 1]])
  t.is(getConvexHullArea(hull), 1)

  hull = convexHull([[0, 0], [0, 5], [6, 6]])
  t.is(getConvexHullArea(hull), 15)
})
