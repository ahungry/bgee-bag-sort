// Derived from logic in SavResourceEntry in NearInfinity project
const fs = require('fs')
const p = require('process')
const zlib = require('zlib')

const buf = fs.readFileSync('./test.sav')
const header = buf.slice(0, 8).toString('ascii')

if (header !== 'SAV V1.0') {
  p.exit(1)
}

let offset = 8
const entries = {}

function get_entry (buf, offset) {
  const initial_offset = offset
  const dv = new DataView(buf.buffer)
  const fileNameLength = dv.getInt32(offset, 1) // little endian, tricky
  offset += 4

  const fileName = buf.slice(offset, offset + fileNameLength - 1).toString('ascii')
  offset += fileNameLength

  // console.log({dv, offset})
  const uncompressedLength = dv.getInt32(offset, 1)
  offset += 4

  const compressedLength = dv.getInt32(offset, 1)
  offset += 4

  const cdata = buf.slice(offset, offset + compressedLength)
  offset += compressedLength

  const entry = ''

  return {
    cdata,
    cdata_begin_offset: offset - compressedLength,
    compressedLength,
    fileName,
    initial_offset,
    offset, // ending offset
    uncompressedLength,
  }
}

// Build all the entries - equivalent of the .sav file
while (offset < buf.length) {
  const entry = get_entry(buf, offset)

  offset = entry.offset
  entries[entry.fileName] = entry
}

function sort_bag(key) {
  const x = entries[key].cdata
  const z = zlib.inflateSync(x)

  // First 8 of a store = type or something
  // const zheader = z.slice(0, 8).toString('ascii')

  // Item gets 28 bytes - store offset is at 147
  // Ending padding is offset is 144 + 4 extra, hmm..
  console.log(z.slice(0x90 + 12, 0x90 + 12 + 28).toString('ascii'))
  console.log(z.slice(156, 156 + 28).toString('ascii'))

  const offsetStart = 156
  const offsetEnd = 148
  const itemSize = 28
  const items = []

  for (let i = offsetStart; i < z.length - offsetEnd; i += itemSize) {
    const item = z.slice(i, i + itemSize)

    items.push({ bytes: item, name: item.toString('ascii') })
  }

  const sorted = items.sort((a, b) => a.bytes.slice(0, 8) > b.bytes.slice(0, 8) ? 1 : -1)

  console.log(sorted)

  const sortedEntry = Buffer.from(z)
  console.log(sortedEntry)

  // Add values from our sorted in here
  for (let i = offsetStart, c = 0; i < z.length - offsetEnd; i += itemSize, c++) {
    const item = sorted[c] // grab the item from this iteration
    const bytes = item.bytes // should be 28 here

    for (let x = 0; x < 28; x++) {
      sortedEntry[i + x] = bytes[x]
    }
  }

  return { unsortedEntry: z, sortedEntry }
}

const sortedBag = sort_bag('THBAG05.sto')
// sort_bag('THBAG03.sto')
// sort_bag('THBAG01.sto')

// test more readable files
// let fh = fs.openSync('test_unsorted.sto', 'w')
// fs.writeSync(fh, test.unsortedEntry, 0, test.unsortedEntry.length, 0)
// fs.closeSync(fh)

// fh = fs.openSync('test_sorted.sto', 'w')
// fs.writeSync(fh, test.sortedEntry, 0, test.sortedEntry.length, 0)
// fs.closeSync(fh)

// Ok, so buf is the entire .sav file
// entries contains the broken up contents in memory
// we can fetch/sort a bag easily enough
const bagInfo = entries['THBAG05.sto']
const newCdata = zlib.deflateSync(sortedBag.sortedEntry, { level: 9 })
console.log(bagInfo)
console.log(newCdata.length)

console.log(bagInfo.cdata, newCdata)

for (let i = 0; i < bagInfo.cdata; i++) {
  if (bagInfo[i] !== newCdata[i]) {
    console.log('difference/mismatch at: ', i)
    p.exit()
  }
}
console.log('they are identical...')

// console.log(newCdata)
// console.log(bagInfo.cdata)


// Error with 'unknown compression method' - could be mismatch between labelled compressed size
// and the actual encoding

// BEGIN testing of compression levels -- Level 9 will provide the identical level of compression that the IE is using
// const m = entries['THBAG05.sto']
// const x = entries['THBAG05.sto'].cdata
// const z = zlib.inflateSync(x)
// const y = zlib.deflateSync(z, { level: 9 })
// console.log({ m,x,y,z, xlen: x.length, ylen: y.length, zlen: z.length })
// END testing of compression levels

// Try to add newCdata in place of old
// TODO: Likely will need to update this in place, but due to compression alteration
// after writing this cdata, update the cdata compressed length value, and then
// ensure the original buf data afterwards is put in the proper place (shift diff)
function updateCdata (entry, newCdata) {
  // console.log(entry)
  for (let i = 0; i < entry.compressedLength; i++) {
    buf[entry.cdata_begin_offset + i] = newCdata[i] // || 0
    // console.log({
    //   buf: buf[entry.cdata_begin_offset + i],
    //   new: newCdata[i]
    // })
  }
}

updateCdata(bagInfo, newCdata)

// Well, it produces a .sav the BG game can open, but NI will crash on.
// Also, it unfortunately doesn't seem to have altered the order of bag contents at all...

// Also, the size of deflate vs compressedLengths do not match up

const fh = fs.openSync('hax.sav', 'w')
fs.writeSync(fh, buf, 0, buf.length, 0)
fs.closeSync(fh)
