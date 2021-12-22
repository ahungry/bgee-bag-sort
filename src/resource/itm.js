// https://gibberlings3.github.io/iesdp/file_formats/ie_formats/itm_v1.htm
// So, this is showing how we can go from a known file name
// into getting the proper strref values out, and ideally
// referencing in tlk-parser.js - but, how do we get to the proper
// .itm file contents each time?  Likely need to parse items.bif and
// index them, then build up a set of objects from override/ directory


const Resource = require('./resource')
const util = require('../util')

class Itm extends Resource {
  // https://gibberlings3.github.io/iesdp/file_formats/ie_formats/itm_v1.htm#Header_ItemType
  static getReadableType (n) {
      const m = {
        0x00: 'MISC',
        0x01: 'AMUL',
        0x02: 'ARMR',
        0x03: 'BELT',
        0x04: 'BOOT',
        0x05: 'ARRO',
        0x06: 'BRAC',
        0x07: 'HELM',
        0x08: 'KEYS',
        0x09: 'POTN',
        0x0a: 'RING',
        0x0b: 'SCRL',
        0x0c: 'SHLD',
        0x0d: 'FOOD',
        0x0e: 'BULL',
        0x0f: 'BOWS',
        0x10: 'DAGG',
        0x11: 'MACE',
        0x12: 'SLNG',
        0x13: 'SW1H',
        0x14: 'SW2h',
        0x15: 'HAMM',
        0x16: 'MRNG',
        0x17: 'FLAL',
        0x18: 'DART',
        0x19: 'AX1H',
        0x1a: 'STAF',
        0x1b: 'XBOW',
        0x1c: 'HAND',
        0x1d: 'SPER',
        0x1e: 'HALB',
        0x1f: 'BOLT',
        0x20: 'CLCK',
        0x21: 'GOLD',
        0x22: 'GEMS',
        0x23: 'WAND',
        0x24: 'CONT',
        0x25: 'BOOK',
        0x26: 'FAML',
        0x27: 'TATT',
        0x28: 'LENS',
        0x29: 'SHBU', // buckler
        0x2a: 'CAND',
        0x2b: 'UNKN',
        0x2c: 'CLUB',
        0x2d: 'UNKN',
        0x2e: 'UNKN',
        0x2f: 'SHLG', // large shield
        0x30: 'UNKN',
        0x31: 'MSHI',
        0x31: 'SHMD', // medium shield
        0x32: 'NOTE',
        0x33: 'UNKN',
        0x34: 'UNKN',
        0x35: 'SHSM', // small shield
        0x36: 'UNKN',
        0x37: 'TELE',
        0x38: 'DRNK',
        0x39: 'SW3H',
        0x3a: 'CONT',
        0x3b: 'PELT',
        0x3c: 'LEAT',
        0x3d: 'SLEA',
        0x3e: 'CHAN',
        0x3f: 'SPLI',
        0x40: 'PLAH',
        0x41: 'PLAF',
        0x42: 'HIDE',
        0x43: 'ROBE',
        0x44: 'UNKN',
        0x45: 'SW1H',
        0x46: 'SCRF',
        0x47: 'FOOD',
        0x48: 'HATT',
        0x49: 'GAUN',
      }

      if (m[n]) {
        return m[n]
      }

      return 'MISC'
  }

  static fromBuf (buf) {
    if (buf.length < 16) { return null }

    const dv = util.makeDataView(buf)

    const sigV = buf.slice(0, 8).toString('ascii')
    const strrefUnidentifed = dv.getUint32(8, 1)
    const strref = dv.getUint32(12, 1)
    const type = dv.getUint16(0x001c, 1)
    const rtype = Itm.getReadableType(type)

    return new Itm({ sigV, strrefUnidentifed, strref, type, rtype })
  }

  constructor({ strref, strrefUnidentifed, sigV, type, rtype }) {
    super()
    this.strref = strref
    this.strrefUnidentifed = strrefUnidentifed
    this.sigV = sigV
    this.type = type
    this.rtype = rtype
  }
}

module.exports = Itm
