const RAM = require('random-access-memory')
const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')

const { convexHull, doHullsIntersect, getConvexHullArea } = require('./2d.js')
const { parseLine, parseRemoteLine } = require('./helpers.js')

class Game {
  constructor (bootstrap) {
    this.fieldSize = 10
    this.myHull = []
    this.theirHull = []

    this.store = new Corestore(RAM)
    this.me = this.store.get({ name: 'me' })
    this.them = null

    this.swarm = new Hyperswarm({ bootstrap })
    this.swarm.on('connection', (conn, _peerInfo) => this.store.replicate(conn))

    this.terminationCallback = function () {}
  }

  async init (terminationCallback) {
    await this.me.ready()
    this.swarm.join(this.me.discoveryKey)
    console.log('your key', this.me.key.toString('hex'), 'share it with your friend')

    this.handleMyInput = this.handleMyInput.bind(this)
    this.handleOponentInput = this.handleOponentInput.bind(this)
    this.exitCallback = this.exitCallback.bind(this)
    this.terminationCallback = terminationCallback
  }

  async start (pK) {
    this.them = this.store.get(Buffer.from(pK, 'hex'))
    await this.them.ready()
    this.swarm.join(this.them.discoveryKey)
    await this.swarm.flush()
    this.them.createReadStream({ live: true }).on('data', this.handleOponentInput)
  }

  addMove (hull, point, otherHull) {
    const newHull = convexHull([...hull, point])
    const sameLength = newHull.length === hull.length
    const sameArea = getConvexHullArea(newHull) === getConvexHullArea(hull)

    if (sameLength && sameArea) return { hull: newHull, gameOver: true }
    if (doHullsIntersect(newHull, otherHull)) return { hull: newHull, gameOver: true }

    return { hull: newHull, gameOver: false }
  }

  async announceWinner () {
    const ourArea = getConvexHullArea(this.myHull)
    const theirArea = getConvexHullArea(this.theirHull)
    if (ourArea > theirArea) {
      console.log('Congratulations! You won!')
    } else if (ourArea < theirArea) {
      console.log('Sorry, you lost.')
    } else {
      console.log('It\'s a draw!')
    }

    return await this.exitCallback()
  }

  async handleMyInput (line) {
    const point = parseLine(line, this.fieldSize)

    const res = this.addMove(this.myHull, point, this.theirHull)
    this.myHull = res.hull
    console.log('My hull:', this.myHull)
    await this.me.append(JSON.stringify(point))
    if (res.gameOver) {
      // Lag to make sure the other player sees the last move and game result
      await new Promise((resolve, _reject) => setTimeout(resolve, 500))
      await this.announceWinner()
    }
  }

  async handleOponentInput (data) {
    const point = parseRemoteLine(data.toString(), this.fieldSize)
    console.log('their last move:', this.theirHull, point)

    const res = this.addMove(this.theirHull, point, this.myHull)
    this.theirHull = res.hull
    console.log('Their hull:', this.theirHull)

    if (res.gameOver) await this.announceWinner()
  }

  async exitCallback () {
    await this.me?.session().close()
    await this.me?.close()
    await this.swarm?.destroy()
    await this.terminationCallback()
  }
}

module.exports = {
  Game
}
