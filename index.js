const readline = require('readline')

const { Game } = require('./lib/game.js')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

;(async function () {
  const game = new Game()
  await game.init(() => {
    console.log('GG! WP!')
    rl.close()
    process.exit(0)
  })

  rl.question('paste friend\'s key: ', async function (pK) {
    await game.start(pK)
    console.log('GL! HF!')
    rl.on('line', game.handleMyInput)
  })
})()
