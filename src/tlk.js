// https://gibberlings3.github.io/iesdp/file_formats/ie_formats/tlk_v1.htm

const Resource = require('./resource')
const util = require('./util')

class TlkEntry extends Resource {
  static fromBuf (buf, offset, stringsOffset) {
    const dv = util.makeDataView(buf)

    const bitField = dv.getUint16(0, 1)
    // This is the resource reference for a sound file, NOT the key of something like THBAG05
    const resref = buf.slice(offset + 2, offset + 2 + 18)
    const stringStart = dv.getUint32(offset + 18, 1)
    const stringLen = dv.getUint32(offset + 22, 1)

    // pre-fetch the actual string content we would want via strref request
    const stringContent = buf.slice(
      stringStart + stringsOffset,
      stringStart + stringsOffset + stringLen
    )

    const prettyName = '' // util.bufToStringNul(resref)

    return new TlkEntry({ prettyName, resref, stringContent })
  }

  constructor({ prettyName, resref, stringContent }) {
    super()
    this.prettyName = prettyName
    this.resref = resref
    this.stringContent = stringContent
  }
}

class Tlk extends Resource {
  static fromBuf (buf) {
    const dv = util.makeDataView(buf)

    const sigV = buf.slice(0, 8).toString('ascii')
    const strrefLen = dv.getUint32(10, 1)
    const stringsOffset = dv.getUint32(14, 1)

    return new Tlk({ buf, sigV, strrefLen, stringsOffset })
  }

  constructor({ buf, sigV, strrefLen, stringsOffset }) {
    super()
    this.buf = buf
    this.sigV = sigV
    this.strrefLen = strrefLen
    this.stringsOffset = stringsOffset
    this.entries = []
  }

  // Pre-indexing ~30MB of data takes too long, just keep the one buffer
  // and jump the strref index on demand.
  getStrRef (id) {
    const entry = TlkEntry.fromBuf(
      this.buf,
      18 + (id * 26), // 18 bytes of header, each entry idx is 26 bytes
      this.stringsOffset,
    )

    return entry.stringContent.toString('ascii')
  }
}

module.exports = Tlk
