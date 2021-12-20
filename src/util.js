const fs = require('fs')

function slurp (fileName) {
  return fs.readFileSync(fileName)
}

// Directly using buf.buffer here does not work for some odd reason
// Had to use the intermediate step found here:
// https://stackoverflow.com/questions/57429401/using-dataview-with-nodejs-buffer
function makeDataView (buf) {
  const uint8 = new Uint8Array(buf.byteLength)
  buf.copy(uint8, 0, 0, buf.byteLength)

  return new DataView(uint8.buffer)
}

// Given a buffer with a nul terminated word, read up until first null byte
function bufToStringNul (buf) {
  let i = 0
  for (; i < buf.length; i++) {
    if (buf[i] === 0) break
  }

  return buf.slice(0, i).toString('ascii')
}

module.exports = {
  bufToStringNul,
  makeDataView,
  slurp,
}
