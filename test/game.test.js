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

  await game.init()

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

//test('Game:e2e', async (t) => {
//  const testnet = await createTestnet(3, t.teardown)
//  const game = new Game(testnet.bootstrap)
//
//  await game.init()
//  //const them = testnet.createNode()
//  //await game.start(them.defaultKeyPair.publicKey.toString('hex'))
//  await game.start(testnet.nodes[0].defaultKeyPair.publicKey.toString('hex'))
//
//  t.ok(game.them.key)
//
//  await game.exitCallback()
//})
