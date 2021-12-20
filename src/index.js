const p = require('process')

const Item = require('./item')
const Tlk  = require('./tlk')
const util = require('./util')

const item = Item.fromBuf(util.slurp('./data-samples/thbag05.itm'))
const tlk = Tlk.fromBuf(util.slurp('./data-samples/dialog.tlk'))

console.log(item)
console.log(tlk.getStrRef(305344))
console.log(tlk.getStrRef(56859))
console.log(tlk.getStrRef(item.strref))
