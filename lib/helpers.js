function parseLine (line, fieldSize = 10) {
  const split = line.split(',')
  if (split.length !== 2) throw new Error('invalid input: must be 2d array')
  if (split.some(el => isNaN(el))) throw new Error('invalid input: must be 2d array of integers')
  if (split.some(el => el < 0 || el > fieldSize)) throw new Error('invalid input: must be 2d array of integers in range')

  return split.map(el => parseInt(el))
}

function parseRemoteLine (line, fieldSize = 10) {
  const parsed = JSON.parse(line)
  if (parsed.length !== 2) throw new Error('invalid input: must be 2d array')
  if (parsed.some(el => isNaN(el))) throw new Error('invalid input: must be 2d array of integers')
  if (parsed.some(el => el < 0 || el > fieldSize)) throw new Error('invalid input: must be 2d array of integers in range')

  return parsed.map(el => parseInt(el))
}

module.exports = {
  parseLine,
  parseRemoteLine
}
