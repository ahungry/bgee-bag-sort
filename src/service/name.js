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

function getItem (key) {
  key = key.toLowerCase()

  try {
    return Itm.fromBuf(util.slurp(overrideDir + '/' + key + '.itm'))
  } catch (e) {
    return { err: e.message }
  }
}

function _getName (key) {
  if (itemCache[key]) {
    return itemCache[key]
  }

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

    itemCache[key] = key

    return itemCache[key]
  }
}

function getPrefixGroup (rawName, prefix, prefix3) {
  if (/^bow/.test(prefix3)) {
    prefix3 = 'boww'
  }

  if (/robe/i.test(rawName)) {
    prefix3 = 'robe'
  }

  if (/scimitar/i.test(rawName)) {
    prefix3 = 'scim'
  }

  if (/(waki|ninja)/i.test(rawName)) {
    prefix3 = 'waki'
  }

  if (/katana/i.test(rawName)) {
    prefix3 = 'kata'
  }

  if (/ioun/i.test(rawName)) {
    prefix3 = 'ioun'
  }

  if (/(cowl|hood)/i.test(rawName)) {
    prefix3 = 'cowl'
  }

  if (/cloak/i.test(rawName)) {
    prefix3 = 'clck'
  }

  if (/boot/i.test(rawName)) {
    prefix3 = 'boot'
  }

  if (/aegi/i.test(prefix3)) {
    prefix3 = 'hamm'
  }

  // reaver
  if (/ohre/i.test(prefix3)) {
    prefix3 = 'sw2h'
  }

  if (/^hel/i.test(prefix3)) {
    prefix3 = 'helm'
  }

  if (['robe', 'leat', 'chan', 'plat', 'armr', 'slea', 'pelt', 'hide',
       'chan', 'spli', 'plah', 'plaf'].includes(prefix3)) {
    prefix = 'armr'
  }

  if (['amul', 'boot', 'belt', 'clck', 'ring', 'brac'].includes(prefix3)) {
    prefix = 'arm1'
  }

  if (['helm', 'ioun', 'cowl'].includes(prefix3)) {
    prefix = 'arm2'
  }

  // Group ranged
  if (['xbow', 'boww', 'slng'].includes(prefix3)) {
    prefix = 'rang'
  }

  // Group weapons
  if (['sw1h', 'sw2h', 'dagg', 'ax1h', 'staf', 'sper', 'hamm', 'halb', 'blun',
       'scim', 'waki', 'kata', 'sw3h', 'mace'].includes(prefix3)) {
    prefix = 'weap'
  }

  if (['shld', 'shbu', 'shlg', 'shmd', 'shsm'].includes(prefix3)) {
    prefix = 'wep1'
  }

  if (['wand'].includes(prefix3)) {
    prefix = 'wep2'
  }

  if (['misc'].includes(prefix3)) {
    prefix = 'yyyy'
  }

  if (['plot'].includes(prefix3)) {
    prefix = 'zzzz'
  }

  return { prefix, prefix3 }
}

// Wrapper for _getName that will attempt to group items by their type (via prefix)
// and then alphabetize afterwards
function getName (resres) {
  const key = resres.toLowerCase()
  let prefix = 'xxxx'
  let prefix3 = key
    .replace(/^bd/, '')
    .replace(/^th/, '')
    .replace(/^.*?#[v]*/, '')
    .slice(0, 4)

  const rawName = _getName(key)
  let prefixGroup = getPrefixGroup(rawName, prefix, prefix3)
  prefix = prefixGroup.prefix
  prefix3 = prefixGroup.prefix3

  // Fallback group for things that didn't get matched earlier
  if (prefix === 'xxxx') {
    const item = getItem(key)
    prefix3 = (item.rtype || prefix3).toLowerCase()
    let prefixGroup = getPrefixGroup(rawName, prefix, prefix3)
    prefix = prefixGroup.prefix
    prefix3 = prefixGroup.prefix3
  }

  const name = `${prefix}${prefix3}${rawName}`

  // console.log('prefix: ' + prefix + ' resres: ' + resres + ' name: ' + name)
  console.log({ name })

  return name
}

const setOverrideDir = s => overrideDir = s

module.exports = { getItem, getName, setOverrideDir }
