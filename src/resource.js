const fs = require('fs')

class Resource {
  static fromFile (self, fileName) {
    const buf = fs.readFileSync(fileName)

    return self.fromBuf(buf)
  }

  static fromBuf (self, buf) {
    // Directly using buf.buffer here does not work for some odd reason
    // Had to use the intermediate step found here:
    // https://stackoverflow.com/questions/57429401/using-dataview-with-nodejs-buffer
    const uint8 = new Uint8Array(buf.byteLength)
    buf.copy(uint8, 0, 0, buf.byteLength)

    const dv = new DataView(uint8.buffer)

    const ff = self.getFileFormat()
    const ffKeys = Object.keys(ff)
    const m = {}

    ffKeys.forEach(key => {
      const k = ff[key]

      switch(k.type) {
        case 'ascii':
          m[key] = buf.slice(k.offset, k.offset + k.size).toString('ascii')
          break

        case 'uint32':
          m[key] = dv.getUint32(k.offset, 1)
          break
      }
    })

    return new self(m)
  }

  static getFileFormat () { return {} }

  constructor () {}
}

module.exports = Resource
