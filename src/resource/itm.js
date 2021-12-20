// https://gibberlings3.github.io/iesdp/file_formats/ie_formats/itm_v1.htm
// So, this is showing how we can go from a known file name
// into getting the proper strref values out, and ideally
// referencing in tlk-parser.js - but, how do we get to the proper
// .itm file contents each time?  Likely need to parse items.bif and
// index them, then build up a set of objects from override/ directory


const Resource = require('./resource')
const util = require('../util')

class Itm extends Resource {
  static fromBuf (buf) {
    const dv = util.makeDataView(buf)

    const sigV = buf.slice(0, 8).toString('ascii')
    const strrefUnidentifed = dv.getUint32(8, 1)
    const strref = dv.getUint32(12, 1)

    return new Itm({ sigV, strrefUnidentifed, strref })
  }

  constructor({ strref, strrefUnidentifed, sigV }) {
    super()
    this.strref = strref
    this.strrefUnidentifed = strrefUnidentifed
    this.sigV = sigV
  }
}

module.exports = Itm
