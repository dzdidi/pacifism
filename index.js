const readline = require('readline')

const RAM = require('random-access-memory')
const Corestore = require('corestore')
const Hyperswarm = require('hyperswarm')

const { addMove, getWinner } = require('./lib/game.js')
const { parseLine, parseRemoteLine } = require('./lib/helpers.js')

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
    them.createReadStream({ live: true }).on('data', async (data) => {
      console.log('thier last move:', theirHull, data.toString())
      const point = parseRemoteLine(data.toString(), fieldSize)

      const res = addMove(theirHull, point, myHull)
      theirHull = res.hull
      console.log('Their hull:', theirHull)

      if (res.gameOver) await getWinner(myHull, res.hull, exitCallback)
    })

    console.log('Move fast!')
    let myHull = []
    rl.on('line', async (line) => {
      const point = parseLine(line, fieldSize)

      const res = addMove(myHull, point, theirHull)
      myHull = res.hull
      console.log('My hull:', myHull)
      await me.append(JSON.stringify(point))
      if (res.gameOver) {
        // Lag to make sure the other player sees the last move and game result
        await new Promise((resolve, _reject) => setTimeout(resolve, 500))
        await getWinner(res.hull, theirHull, exitCallback)
      }
    })

    rl.on('close', exitCallback)

    async function exitCallback () {
      console.log('Bye!')
      await me.session().close()
      await them.session().close()
      await me.close()
      await them.close()
      process.exit(0)
    }
  })
})()
