// https://gibberlings3.github.io/iesdp/file_formats/ie_formats/itm_v1.htm
// So, this is showing how we can go from a known file name
// into getting the proper strref values out, and ideally
// referencing in tlk-parser.js - but, how do we get to the proper
// .itm file contents each time?  Likely need to parse items.bif and
// index them, then build up a set of objects from override/ directory


const Resource = require('./resource')

class Item extends Resource {
  static fromFile = Resource.fromFile.bind(null, Item)
  static fromBuf  = Resource.fromBuf.bind(null, Item)

  static getFileFormat () {
    return {
      sigV:              { offset: 0  , size: 8, type: 'ascii' },
      strrefUnidentifed: { offset: 8  , size: 4, type: 'uint32' },
      strref:            { offset: 12 , size: 4, type: 'uint32' },
    }
  }

  constructor({ strref, strrefUnidentifed, sigV }) {
    super()
    this.strref = strref
    this.strrefUnidentifed = strrefUnidentifed
    this.sigV = sigV
  }
}

module.exports = Item
