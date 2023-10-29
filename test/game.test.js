const test = require('brittle')
const { addMove, getWinner } = require('../lib/game.js')
const { convexHull } = require('../lib/2d.js')

test('addMove', (t) => {
  const hull = convexHull([[0, 0], [0, 2], [2, 0]])
  const otherHull = convexHull([[2, 2], [2, 3], [3, 2]])

  let res = addMove(hull, [0, 1], otherHull) // inside
  t.is(res.gameOver, true)
  t.alike(res.hull, hull)

  res = addMove(hull, [2, 2], otherHull) // collision
  t.is(res.gameOver, true)
  t.alike(res.hull, convexHull([[0, 0], [2, 0], [0, 2], [2, 2]]))

  res = addMove(hull, [3, 3], otherHull) // outside
  t.is(res.gameOver, true)
  t.alike(res.hull, convexHull([[0, 0], [0, 2], [2, 0], [3, 3]]))
})

test('getWinner', (t) => {
  t.plan(3)

  let us = convexHull([[0, 0], [0, 2], [2, 0]])
  let them = convexHull([[0, 0], [0, 1], [1, 0]])

  getWinner(us, them, t.pass)

  us = convexHull([[0, 0], [0, 2], [2, 0]])
  them = convexHull([[0, 0], [0, 2], [2, 0]])

  getWinner(us, them, t.pass)

  them = convexHull([[0, 0], [0, 2], [2, 0]])
  us = convexHull([[0, 0], [0, 1], [1, 0]])

  getWinner(us, them, t.pass)
})
