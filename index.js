const readline = require('readline')

const RAM = require('random-access-memory')
const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')

const { convexHull, doPolygonsIntersect, getConvexHullArea } = require('./lib/2d.js')
const { parseLine } = require('./lib/helpers.js')

// TODO: communicate with other player
const fieldSize = 10

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

;(async () => {
  const store = new Corestore(RAM)
  const me = store.get({ name: 'me' })
  await me.ready()

  const swarm = new Hyperswarm()
  swarm.on('connection', (conn, _peerInfo) => store.replicate(conn))
  swarm.join(me.discoveryKey)

  console.log('your key', me.key.toString('hex'), 'share it with your friend')

  rl.question('paste friend\'s key: ', async (pK) => {
    const them = store.get(Buffer.from(pK, 'hex'))
    await them.ready()

    swarm.join(them.discoveryKey)
    await swarm.flush()

    let theirHull = []
    them.createReadStream({ live: true }).on('data', (data) => {
      // TODO: check field size

      console.log('thier last move:', theirHull, data.toString())
      const res = addPoint(theirHull, JSON.parse(data.toString()))
      if (res.gameOver) {
        console.log(getWinner(myHull, res.hull))
        rl.close()
      } else {
        theirHull = res.hull
      }

      console.log('Their hull:', theirHull)
    })

    console.log('Move fast!')
    let myHull = []
    rl.on('line', async (line) => {
      const point = parseLine(line, fieldSize)

      const res = addPoint(myHull, point)
      myHull = res.hull
      console.log('My hull:', myHull)
      await me.append(JSON.stringify(point))

      if (res.gameOver) {
        // Lag to make sure the other player sees the last move and game result
        await new Promise(r => setTimeout(r, 500));
        console.log(getWinner(res.hull, theirHull))
        rl.close()
      }
    })

    rl.on('close', async () => {
      console.log('Bye!')
      await me.session().close()
      await them.session().close()
      await me.close()
      await them.close()
      process.exit(0)
    })
  })
})()


function addPoint(hull, point) {
  const newHull = convexHull([...hull, point])
  const sameLength = newHull.length === hull.length
  const sameArea = getConvexHullArea(newHull) === getConvexHullArea(hull)
  if (sameLength && sameArea) return { hull, gameOver: true }

  return { hull: newHull, gameOver: false }
}

function getWinner(hullA, hullB) {
  const areaA = getConvexHullArea(hullA)
  const areaB = getConvexHullArea(hullB)
  if (areaA > areaB) {
    return 'A'
  } else if (areaA < areaB) {
    return 'B'
  } else {
    return 'D'
  }
}

