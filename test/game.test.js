const test = require('brittle')

const createTestnet = require('@hyperswarm/testnet')

const { Game } = require('../lib/game.js')
const { convexHull } = require('../lib/2d.js')

test('Game:contructor', async (t) => {
  const { bootstrap } = await createTestnet(3, t.teardown)
  const game = new Game(bootstrap)

  t.is(game.fieldSize, 10)
  t.alike(game.myHull, [])
  t.alike(game.theirHull, [])

  t.ok(game.store)
  t.ok(game.me)

  t.alike(game.them, null)
  t.ok(game.swarm)

  await game.exitCallback()
})

test('Game:init', async (t) => {
  const { bootstrap } = await createTestnet(3, t.teardown)
  const game = new Game(bootstrap)

  await game.init(t.pass)

  t.ok(game.me.key)

  await game.exitCallback()
})

test('addMove', async (t) => {
  const game = new Game()

  const hull = convexHull([[0, 0], [0, 2], [2, 0]])
  const otherHull = convexHull([[2, 2], [2, 3], [3, 2]])

  let res = game.addMove(hull, [0, 1], otherHull) // inside
  t.is(res.gameOver, true)
  t.alike(res.hull, hull)

  res = game.addMove(hull, [2, 2], otherHull) // collision
  t.is(res.gameOver, true)
  t.alike(res.hull, convexHull([[0, 0], [2, 0], [0, 2], [2, 2]]))

  res = game.addMove(hull, [3, 3], otherHull) // outside
  t.is(res.gameOver, true)
  t.alike(res.hull, convexHull([[0, 0], [0, 2], [2, 0], [3, 3]]))

  await game.exitCallback()
})

test('announceWinner', async (t) => {
  const game = new Game()

  game.myHull = convexHull([[0, 0], [0, 2], [2, 0]])
  game.theirHull = convexHull([[0, 0], [0, 1], [1, 0]])

  game.announceWinner()

  game.myHull = convexHull([[0, 0], [0, 2], [2, 0]])
  game.theirHull = convexHull([[0, 0], [0, 2], [2, 0]])

  game.announceWinner()

  game.myHull = convexHull([[0, 0], [0, 2], [2, 0]])
  game.theirHull = convexHull([[0, 0], [0, 1], [1, 0]])

  game.announceWinner()

  await game.exitCallback()
})

test('Game:e2e', async (t) => {
  const testnet = await createTestnet(3, t.teardown)
  const gameA = new Game(testnet.bootstrap)
  const gameB = new Game(testnet.bootstrap)

  await gameA.init(t.pass)
  await gameB.init(t.pass)

  await gameA.start(gameB.me.key.toString('hex'))
  await gameB.start(gameA.me.key.toString('hex'))

  t.is(gameA.them.key.toString('hex'), gameB.me.key.toString('hex'))
  t.is(gameB.them.key.toString('hex'), gameA.me.key.toString('hex'))

  await gameA.handleMyInput('0,0')
  await new Promise((resolve, _reject) => setTimeout(resolve, 500))

  t.is(gameA.myHull.length, 1)
  t.alike(gameA.myHull, [[0, 0]])
  t.is(gameA.theirHull.length, 0)
  t.alike(gameA.theirHull, [])

  t.is(gameB.myHull.length, 0)
  t.alike(gameB.myHull, [])
  t.is(gameB.theirHull.length, 1)
  t.alike(gameB.theirHull, [[0, 0]])

  await gameB.handleMyInput('1,1')
  await new Promise((resolve, _reject) => setTimeout(resolve, 500))

  t.is(gameA.myHull.length, 1)
  t.alike(gameA.myHull, [[0, 0]])
  t.is(gameA.theirHull.length, 1)
  t.alike(gameA.theirHull, [[1, 1]])

  t.is(gameB.myHull.length, 1)
  t.alike(gameB.myHull, [[1, 1]])
  t.is(gameB.theirHull.length, 1)
  t.alike(gameB.theirHull, [[0, 0]])

  await gameA.handleMyInput('1,0')
  await new Promise((resolve, _reject) => setTimeout(resolve, 500))

  t.is(gameA.myHull.length, 2)
  t.alike(gameA.myHull, [[0, 0], [1, 0]])
  t.is(gameA.theirHull.length, 1)
  t.alike(gameA.theirHull, [[1, 1]])

  t.is(gameB.myHull.length, 1)
  t.alike(gameB.myHull, [[1, 1]])
  t.is(gameB.theirHull.length, 2)
  t.alike(gameB.theirHull, [[0, 0], [1, 0]])

  await gameB.handleMyInput('0,1')
  await new Promise((resolve, _reject) => setTimeout(resolve, 500))

  t.is(gameA.myHull.length, 2)
  t.alike(gameA.myHull, [[0, 0], [1, 0]])
  t.is(gameA.theirHull.length, 2)
  t.alike(gameA.theirHull, [[0, 1], [1, 1]])

  t.is(gameB.myHull.length, 2)
  t.alike(gameB.myHull, [[0, 1], [1, 1]])
  t.is(gameB.theirHull.length, 2)
  t.alike(gameB.theirHull, [[0, 0], [1, 0]])

  await gameA.handleMyInput('0,1')
  await new Promise((resolve, _reject) => setTimeout(resolve, 500))

  t.is(gameA.myHull.length, 3)
  t.alike(gameA.myHull, [[0, 0], [1, 0], [0, 1]])
  t.is(gameA.theirHull.length, 2)
  t.alike(gameA.theirHull, [[0, 1], [1, 1]])

  t.is(gameB.myHull.length, 2)
  t.alike(gameB.myHull, [[0, 1], [1, 1]])
  t.is(gameB.theirHull.length, 3)
  t.alike(gameB.theirHull, [[0, 0], [1, 0], [0, 1]])
})
