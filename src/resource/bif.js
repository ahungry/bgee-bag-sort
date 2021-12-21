// https://gibberlings3.github.io/iesdp/file_formats/ie_formats/bif_v1.htm

const p = require('process')

const Itm = require('./itm')
const Tlk = require('./tlk')
const Resource = require('./resource')
const util = require('../util')

const tlk = Tlk.fromBuf(util.slurp('./data-samples/dialog.tlk'))

class BifFileEntry extends Resource {
  static fromBuf (buf, dv, offset) {
    console.log('buflen: ' + buf.buffer.byteLength)
    console.log('dv byteLen: ' + dv.byteLength)
    console.log('offset: ' + offset)

    const resourceLocator = dv.getUint32(offset + 0, 1)
    const resourceDataOffset = dv.getUint32(offset + 4, 1)
    const resourceSize = dv.getUint32(offset + 8, 1)
    const resourceType = dv.getUint16(offset + 12, 1)

    // // FIXME: BEGIN - Just testing out associated data (in-file biff resource I guess)
    // // Do some kind of check on resourceType for only items I guess...
    const resourceData = buf.slice(resourceDataOffset, resourceDataOffset + resourceSize)
    const itm = Itm.fromBuf(resourceData)
    let name = ''

    if (itm && 'ITM V1  ' == itm.sigV) {
      try {
        console.log(itm.strref)
        console.log(tlk.getStrRef(itm.strref))
        console.log(resourceLocator & ((1 << 12) - 1))
      } catch (e) {}
    }
    // FIXME: END - Just testing out associated data (in-file biff resource I guess)

    return new BifFileEntry({ itm, resourceData, resourceLocator, resourceDataOffset, resourceSize, resourceType })
  }

  constructor({ itm, resourceData, resourceLocator, resourceDataOffset, resourceSize, resourceType }) {
    super()
    this.itm = itm
    this.resourceData = resourceData
    this.resourceLocator = resourceLocator
    this.resourceDataOffset = resourceDataOffset
    this.resourceSize = resourceSize
    this.resourceType = resourceType
  }
}

class Bif extends Resource {
  static fromBuf (buf) {
    const dv = util.makeDataView(buf)

    const sigV = buf.slice(0, 8).toString('ascii')
    const fileCount = dv.getUint32(8, 1)
    const tilesetCount = dv.getUint32(12, 1)
    const fileOffset = dv.getUint32(16, 1)

    const instance = new Bif({ buf, sigV, fileCount, tilesetCount, fileOffset })
    let offset = 0

    // Each is 16 bytes
    for (let i = 0; i < fileCount; i++) {
      try {
        const entry = BifFileEntry.fromBuf(buf, dv, offset + fileOffset)
        instance.fileEntries.push(entry)
        offset += 16
      } catch (e) {}
    }

    return instance
  }

  constructor({ buf, sigV, fileCount, tilesetCount, fileOffset }) {
    super()
    this.buf = buf
    this.sigV = sigV
    this.fileCount = fileCount
    this.tilesetCount = tilesetCount
    this.fileOffset = fileOffset
    this.fileEntries = []
    this.tilesetEntries = []
  }

  // FIXME: How do I get this to match?
  // Comparing last 12 bits is stated in in one part, another
  // says that only 0-13 are in another etc.
  getFileByIdx (idx) {
    return this.fileEntries[idx]

    for (let i = 0; i < this.fileEntries.length; i++) {
      const bif = this.fileEntries[i]
      // let bifIdx = bif.resourceLocator & ((1 << 12) - 1)
      let bifIdx = bif.resourceLocator >> (32 - 12)

      if (bifIdx == idx) {
        return bif
      }
    }
  }
}

module.exports = Bif
