// https://gibberlings3.github.io/iesdp/file_formats/ie_formats/bif_v1.htm

const Resource = require('./resource')
const util = require('../util')

class BifFileEntry extends Resource {
  static fromBuf (buf) {
    const dv = util.makeDataView(buf)

    const resourceLocator = dv.getUint32(0, 1)
    const resourceDataOffset = dv.getUint32(4, 1)
    const resourceSize = dv.getUint32(8, 1)
    const resourceType = dv.getUint16(12, 1)

    return new BifFileEntry({ resourceLocator, resourceDataOffset, resourceSize, resourceType })
  }

  constructor({ resourceLocator, resourceDataOffset, resourceSize, resourceType }) {
    super()
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
      const entry = BifFileEntry.fromBuf(buf.slice(offset + fileOffset))
      instance.fileEntries.push(entry)
      offset = 16 * i
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

  // Pre-indexing ~30MB of data takes too long, just keep the one buffer
  // and jump the strref index on demand.
  getStrRef (id) {
    const entry = BifEntry.fromBuf(
      this.buf,
      18 + (id * 26), // 18 bytes of header, each entry idx is 26 bytes
      this.stringsOffset,
    )

    return entry.stringContent.toString('ascii')
  }
}

module.exports = Bif
