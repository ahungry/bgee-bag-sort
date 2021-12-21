// https://gibberlings3.github.io/iesdp/file_formats/ie_formats/bif_v1.htm

const Itm = require('./itm')
const Tlk = require('./tlk')
const Resource = require('./resource')
const util = require('../util')

const tlk = Tlk.fromBuf(util.slurp('./data-samples/dialog.tlk'))

class BifFileEntry extends Resource {
  static fromBuf (buf, dv, offset) {
    // const dv = util.makeDataView(buf)

    const resourceLocator = dv.getUint32(offset + 0, 1)
    const resourceDataOffset = dv.getUint32(offset + 4, 1)
    const resourceSize = dv.getUint32(offset + 8, 1)
    const resourceType = dv.getUint16(offset + 12, 1)

    // FIXME: BEGIN - Just testing out associated data (in-file biff resource I guess)
    // Do some kind of check on resourceType for only items I guess...
    const resourceData = buf.slice(resourceDataOffset, resourceDataOffset + resourceSize)
    const itm = Itm.fromBuf(resourceData)

    try {
      console.log(tlk.getStrRef(itm.strref))
      console.log(resourceLocator & ((1 << 14) - 1))
    } catch (e) {}
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
      const entry = BifFileEntry.fromBuf(buf, dv, offset + fileOffset)
      offset = 16 * i
      instance.fileEntries.push(entry)
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

  getFileByIdx (idx) {
    for (let i = 0; i < this.fileCount; i++) {
      const bif = this.fileEntries[i]
      const bifIdx = bif.resourceLocator & ((1 << 14) - 1)

      console.log({bifIdx, idx})
      // console.log(bif.resourceLocator.toString(2))
      // console.log(bifIdx.toString(2))

      if (bifIdx == idx) {
        return bif
      }
    }
  }
}

module.exports = Bif
