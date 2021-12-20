// https://gibberlings3.github.io/iesdp/file_formats/ie_formats/itm_v1.htm
// So, this is showing how we can go from a known file name
// into getting the proper strref values out, and ideally
// referencing in tlk-parser.js - but, how do we get to the proper
// .itm file contents each time?  Likely need to parse items.bif and
// index them, then build up a set of objects from override/ directory

const fs = require('fs')
const p = require('process')

// Directly using buf.buffer here does not work for some odd reason
// Had to use the intermediate step found here:
// https://stackoverflow.com/questions/57429401/using-dataview-with-nodejs-buffer
const buf = fs.readFileSync('thbag05.itm')
const uint8 = new Uint8Array(buf.byteLength)
buf.copy(uint8, 0, 0, buf.byteLength)
const dv = new DataView(uint8.buffer)

console.log(dv)

const sigV = buf.slice(0, 8).toString('ascii')

const strrefUnidentifed = dv.getUint32(8, 1)
const strref = dv.getUint32(12, 1)

console.log(sigV)
console.log(strrefUnidentifed) // 56859
console.log(strref) // 305344

export default class Item {
  static fromSavFile (fileName) {
    const buf = fs.readFileSync(fileName)

    return Item.fromBuf(buf)
  }

  static fromBuf (buf) {
    const uint8 = new Uint8Array(buf.byteLength)
    buf.copy(uint8, 0, 0, buf.byteLength)

    const dv = new DataView(uint8.buffer)

    const sigV = buf.slice(0, 8).toString('ascii')
    const strrefUnidentifed = dv.getUint32(8, 1)
    const strref = dv.getUint32(12, 1)


    return new Item({ sigV, strref, strrefUnidentifed })
  }

  constructor({ strref, strrefUnidentifed, sigV }) {
    this.strref = strref
    this.strrefUnidentifed = strrefUnidentifed
    this.sigV = sigV
  }
}
