const p = require('process')

const Itm = require('./resource/itm')
const Tlk  = require('./resource/tlk')
const util = require('./util')

const itm = Itm.fromBuf(util.slurp('./data-samples/thbag05.itm'))
const tlk = Tlk.fromBuf(util.slurp('./data-samples/dialog.tlk'))

console.log(itm)
console.log(tlk.getStrRef(305344))
console.log(tlk.getStrRef(56859))
console.log(tlk.getStrRef(itm.strref))
