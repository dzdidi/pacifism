const readline = require('readline')

const { Game } = require('./lib/game.js')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

;(async function () {
  const game = new Game()
  await game.init()

  rl.question('paste friend\'s key: ', async function (pK) {
    await game.start(pK)
    console.log('Move fast!')
    rl.on('line', game.handleMyInput)
    rl.on('close', async () => {
      await game.exitCallback()
      process.exit(0)
    })
  })
})()
