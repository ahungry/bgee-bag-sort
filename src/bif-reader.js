// http://wiki.xentax.com/index.php/Baldurs_Gate_BIF
// This doesn't really work - I think a lot of the data we would want to read
// is mixed in with chitin.key
const fs = require('fs')
const p = require('process')

const buf = fs.readFileSync('items.bif')
const dv = new DataView(buf.buffer)

console.log(dv)

const numFiles = dv.getUint32(8, 1)

const itemType = buf.slice(24, 30).toString('ascii')
const
console.log(itemType)
p.exit()

// First 20 bytes who cares
const fileId = dv.getUint16(24, 1)
const unknown = dv.getUint16(26, 1)
const fileOffset = dv.getUint32(28, 1)
const fileSize = dv.getUint32(32, 1)
const fileType = dv.getUint32(36, 1)

console.log({ numFiles, fileId, unknown, fileOffset, fileSize, fileType })
