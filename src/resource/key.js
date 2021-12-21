// https://gibberlings3.github.io/iesdp/file_formats/ie_formats/key_v1.htm

const p = require('process')

const Resource = require('./resource')
const util = require('../util')

class KeyBifEntry extends Resource {
  static fromBuf (buf) {
    const dv = util.makeDataView(buf)

    const bifLen = dv.getUint32(0, 1)
    const bifOff = dv.getUint32(4, 1)
    const bifFilenameLen = dv.getUint16(8, 1)
    const bifFileLoc = dv.getUint16(10, 1)

    return new KeyBifEntry({ bifLen, bifOff, bifFilenameLen, bifFileLoc })
  }

  constructor({ bifLen, bifOff, bifFilenameLen, bifFileLoc }) {
    super()
    this.bifLen = bifLen
    this.bifOff = bifOff
    this.bifFilenameLen = bifFilenameLen
    this.bifFileLoc = bifFileLoc
  }
}

class KeyResourceEntry extends Resource {
  static fromBuf (buf) {
    // Defer the data view creation until we need to realize it, otherwise this
    // takes a long time to get the int values out.
    // const dv = util.makeDataView(buf)

    // const resref = buf.slice(0, 8).toString('ascii') // .toString('ascii')
    const resref = util.bufToStringNul(buf.slice(0, 8)) // .toString('ascii')
    const resourceType = null // dv.getUint16(8, 1)
    const resourceLocator = null // dv.getUint32(10, 1)

    return new KeyResourceEntry({ buf, resref, resourceType, resourceLocator })
  }

  constructor({ buf, resref, resourceType, resourceLocator }) {
    super()
    this.buf = buf
    this.resref = resref
    this.resourceType = resourceType
    this.resourceLocator = resourceLocator
  }

  hydrate () {
    const dv = util.makeDataView(this.buf)

    this.resourceType = dv.getUint16(8, 1)
    this.resourceLocator = dv.getUint32(10, 1)

    return this
  }
}

class Key extends Resource {
  static fromBuf (buf) {
    const dv = util.makeDataView(buf)

    const sigV = buf.slice(0, 8).toString('ascii')
    const bifCount = dv.getUint32(8, 1)
    const resourceCount = dv.getUint32(12, 1)
    const bifOffset = dv.getUint32(16, 1)
    const resourceOffset = dv.getUint32(20, 1)

    const instance = new Key({ buf, sigV, bifCount, resourceCount, bifOffset, resourceOffset })
    let offset = 0

    // Each is 12 bytes
    for (let i = 0; i < bifCount; i++) {
      offset = 12 * i
      const entry = KeyBifEntry.fromBuf(buf.slice(offset + bifOffset))
      instance.bifEntries.push(entry)
    }

    // Each is 14 bytes
    for (let i = 0; i < resourceCount; i++) {
      offset = 14 * i
      const entry = KeyResourceEntry.fromBuf(buf.slice(offset + resourceOffset))

      instance.resourceEntries.push(entry)
    }

    return instance
  }

  constructor({ buf, sigV, bifCount, resourceCount, bifOffset, resourceOffset }) {
    super()
    this.buf = buf
    this.sigV = sigV
    this.bifCount = bifCount
    this.resourceCount = resourceCount
    this.bifOffset = bifOffset
    this.resourceOffset = resourceOffset
    this.bifEntries = []
    this.resourceEntries = []
  }

  getByResref (s) {
    for (let i = 0; i < this.resourceCount; i++) {
      if (this.resourceEntries[i].resref == s) {
        return this.resourceEntries[i].hydrate()
      }
    }
  }
}

module.exports = Key
