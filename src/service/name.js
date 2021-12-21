// Class to get the name from a resres
// for instance, PLAT06 should become 'Ankheg Plate Mail'
const Itm = require('../resource/itm')
const Tlk = require('../resource/tlk')
const util = require('../util')

const itemNames = require('./items.json')
const itemMap = {}
const tlk = Tlk.fromBuf(util.slurp('./data-samples/dialog.tlk'))

let overrideDir = './data-samples'

// Downcase all the keys
function hydrateItemMap () {
  const ks = Object.keys(itemNames)

  ks.forEach(k => {
    itemMap[k.toLowerCase()] = itemNames[k]
  })
}

hydrateItemMap()

function getName (resres) {
  const key = resres.toLowerCase()

  if (itemMap[key]) {
    return itemMap[key]
  }

  // TODO: Add some smartness around the casing here
  const itm = Itm.fromBuf(util.slurp('./data-samples/' + key + '.itm'))

  return tlk.getStrRef(itm.strref)
}

const setOverrideDir = s => overrideDir = s

module.exports = { getName, setOverrideDir }
