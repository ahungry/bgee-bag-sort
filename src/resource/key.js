// https://gibberlings3.github.io/iesdp/file_formats/ie_formats/key_v1.htm

const p = require('process')

const Resource = require('./resource')
const util = require('../util')

class KeyBifEntry extends Resource {
  static fromBuf (buf, dv, offset) {
    const bifLen = dv.getUint32(offset + 0, 1)
    const bifOff = dv.getUint32(offset + 4, 1)
    const bifFilenameLen = dv.getUint16(offset + 8, 1)
    const bifFileLoc = dv.getUint16(offset + 10, 1)

    const name = util.bufToStringNul(buf.slice(bifOff, bifOff + bifFilenameLen))
    console.log('bif namen: ' + name)

    return new KeyBifEntry({ bifLen, bifOff, bifFilenameLen, bifFileLoc, name })
  }

  constructor({ bifLen, bifOff, bifFilenameLen, bifFileLoc, name }) {
    super()
    this.bifLen = bifLen
    this.bifOff = bifOff
    this.bifFilenameLen = bifFilenameLen
    this.bifFileLoc = bifFileLoc
    this.name = name
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

  // bits 31-20: source index (the ordinal value giving the index of the corresponding BIF entry)
  // bits 19-14: tileset index
  // bits 13- 0: non-tileset file index (any 12 bit value, so long as it matches the value used in the BIF file)
  getBifSourceIndex () {
    // NI uses BIFFResourceEntry as such - close to what I came up with - why the mask...?
    // int sourceIndex = (locator >> 20) & 0xfff;
    return this.resourceLocator >> (32 - 12)
  }

  getFileIndex () {
    return this.resourceLocator & ((1 << 14) - 1)
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
      const entry = KeyBifEntry.fromBuf(buf, dv, offset + bifOffset)
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

  getBifByName (s) {
    for (let i = 0; i < this.bifCount; i++) {
      if (this.bifEntries[i].name == s) {
        return this.bifEntries[i]
      }
    }
  }

  getByResref (s) {
    for (let i = 0; i < this.resourceCount; i++) {
      if (this.resourceEntries[i].resref == s) {
        return this.resourceEntries[i].hydrate()
      }
    }
  }

  getBifByResRef (s) {
    const resref = this.getByResref(s)
    const sourceIdx = resref.getBifSourceIndex()

    return this.bifEntries[sourceIdx]
  }
}

module.exports = Key
