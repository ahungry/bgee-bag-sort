const p = require('process')

const Bif = require('./resource/bif')
const Itm = require('./resource/itm')
const Tlk  = require('./resource/tlk')
const util = require('./util')

const itm = Itm.fromBuf(util.slurp('./data-samples/thbag05.itm'))
const tlk = Tlk.fromBuf(util.slurp('./data-samples/dialog.tlk'))

console.log(itm)
console.log(tlk.getStrRef(305344))
console.log(tlk.getStrRef(56859))
console.log(tlk.getStrRef(itm.strref))

// Try out the bag sort stuff

// const BagSort = require('./service/bag-sort')
// const entries = BagSort.fromSavFile('./data-samples/test.sav')
// const thbag05 = entries.getOneByName('THBAG05.sto')
// console.log(thbag05)
// console.log(thbag05.sortItems())
// entries.toSavFile('oop.sav')

const bif = Bif.fromBuf(util.slurp('./data-samples/items.bif'))

console.log(bif)
