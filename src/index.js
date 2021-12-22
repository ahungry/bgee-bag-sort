const p = require('process')

const BagSort     = require('./service/bag-sort')
const Bif         = require('./resource/bif')
const Itm         = require('./resource/itm')
const Key         = require('./resource/key')
const NameService = require('./service/name')
const Tlk         = require('./resource/tlk')
const util        = require('./util')

function help() {
  console.error(
    'Usage: \n\n' + p.argv[0] + ' ' + p.argv[1] +
      ' --sav /path/to/save/BALDUR.sav --override /path/to/override --bag THBAG05.sto --out new.sav \n'
  )
  p.exit()
}

if (p.argv.length < 4) {
  help()
}

const opts = {}

for (let i = 2; i < p.argv.length; i++) {
  switch (p.argv[i]) {
    case '--sav': opts.sav = p.argv[++i]; break
    case '--override': opts.overrides = p.argv[++i]; break
    case '--bag': opts.bag = p.argv[++i]; break
    case '--out': opts.out = p.argv[++i]; break
    case '--item': opts.item = p.argv[++i]; break
    default: help(); break
  }
}

if (opts.item) {
  if ([opts.overrides].includes(undefined)) {
    help()
  }

  NameService.setOverrideDir(opts.overrides)
  console.log(NameService.getItem(opts.item))
  console.log(NameService.getName(opts.item))

  p.exit()
}

if ([opts.sav, opts.overrides, opts.bag, opts.out].includes(undefined)) {
  help()
}

NameService.setOverrideDir(opts.overrides)

const entries = BagSort.fromSavFile(opts.sav)
const thbag05 = entries.getOneByName(opts.bag)
thbag05.sortItems()
entries.toSavFile(opts.out)
