const test = require('brittle')
const { parseLine, parseRemoteLine } = require('../lib/helpers.js')

test('parseLine', (t) => {
  let line = '1,2'
  let res = parseLine(line)
  t.is(res[0], 1)
  t.is(res[1], 2)

  line = '1,2,3'
  t.exception(() => parseLine(line), 'invalid input: must be 2d array')

  line = '1,a'
  t.exception(() => parseLine(line), 'invalid input: must be 2d array of integers')

  line = '1,11'
  t.exception(() => parseLine(line), 'invalid input: must be 2d array of integers in range')
})

test('parseRemoteLine', (t) => {
  let line = '[1,2]'
  let res = parseRemoteLine(line)
  t.is(res[0], 1)
  t.is(res[1], 2)

  line = '[1,2,3]'
  t.exception(() => parseRemoteLine(line), 'invalid input: must be 2d array')

  line = '[1,"a"]'
  t.exception(() => parseRemoteLine(line), 'invalid input: must be 2d array of integers')

  line = '[1,11]'
  t.exception(() => parseRemoteLine(line), 'invalid input: must be 2d array of integers in range')
})
