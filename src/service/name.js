// Class to get the name from a resres
// for instance, PLAT06 should become 'Ankheg Plate Mail'
const Itm = require('../resource/itm')
const Tlk = require('../resource/tlk')
const util = require('../util')

const itemNames = require('./items.json')
const itemMap = {}
const itemCache = {}
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

  if (itemCache[key]) {
    return itemCache[key]
  }

  // if (itemMap[key]) {
  //   return itemMap[key]
  // }

  try {
    const itm = Itm.fromBuf(util.slurp(overrideDir + '/' + key + '.itm'))
    const strref = tlk.getStrRef(itm.strref)

    itemCache[key] = strref

    return strref
  } catch (_) {
    // Fallback - possible file didn't exist in overrides
    if (itemMap[key]) {
      itemCache[key] = itemMap[key]

      return itemCache[key]
    }

    console.error('Could not find strref for: ' + key)

    itemCache[key] = 'zzz' + key

    return itemCache[key]
  }
}

const setOverrideDir = s => overrideDir = s

module.exports = { getName, setOverrideDir }
