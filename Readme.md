# Pacifism

## p2p game on covering territory while avoiding collision


### Install dependencies:
```sh
npm install
```

### Game:

The idea is to concur as much surface as possible while avoiding collision with opponent and not stepping into own land.

1. Start game by running `node index.js`
2. Copy printed out public key
3. Exchange keys with friend/peer
4. Provide coordinates into cli in format `<X>,<Y>`, where both coordinates are in `[0, 10]`

The game ends when either side collides with opponent or moves into own territory. The winner is identified by size of covered surface.

Enjoy!
