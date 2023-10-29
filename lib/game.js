const { convexHull, doHullsIntersect, getConvexHullArea } = require('./2d.js')

function addMove(hull, point, otherHull) {
  const newHull = convexHull([...hull, point])
  const sameLength = newHull.length === hull.length
  const sameArea = getConvexHullArea(newHull) === getConvexHullArea(hull)

  if (sameLength && sameArea) return { hull: newHull, gameOver: true }
  if (doHullsIntersect(newHull, otherHull)) return { hull: newHull, gameOver: true }

  return { hull: newHull, gameOver: false }
}

async function getWinner(us, them, cb) {
  const ourArea = getConvexHullArea(us)
  const theirArea = getConvexHullArea(them)
  if (ourArea > theirArea) {
    console.log('Congratulations! You won!')
  } else if (ourArea < theirArea) {
    console.log('Sorry, you lost.')
  } else {
    console.log('It\'s a draw!')
  }

  return await cb()
}

module.exports = {
  addMove,
  getWinner
}
