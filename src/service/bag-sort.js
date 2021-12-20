// This is basically a combo of code to read a .sav file
// decompress a particular entry in it (a store for instance)
// re-order the data within, and re-compress it

// Derived from logic in SavResourceEntry in NearInfinity project
const fs = require('fs')
const p = require('process')
const zlib = require('zlib')

// TODO: Look into StringTable / ResourceRef / ItmResource
// to figure out how lang/en_US/dialog.tlk is storing full item
// names based off of some offset from the specific key name
const itemNames = require('./items.json')

const { bufToStringNul } = require('../util')

/**
 * The basic data structure used in the .sav file - 8 bytes at start identify
 * the type+version info, and the rest of the data is Entry type.
 */
class Entry {
  /**
   * Entry begins at an offset in buffer, it has the following format
   *
   *   fileNameLen[4 bytes, little-endian]
   *   fileName[X bytes]
   *   uncompLen[4 bytes, LE]
   *   compLen[4 bytes, LE]
   *   cdata[Y bytes]
   *
   * Therefore it is always 12 bytes + X bytes (fileNameSize) + Y bytes (cdata size)
   *
   */
  static fromSavBuf (buf, offset, instance = Entry) {
    const initial_offset = offset
    const dv = new DataView(buf.buffer)
    const fileNameLen = dv.getInt32(offset, 1) // little endian, tricky

    // Just for checking data sanity, save original binary info
    const sanityHeader = buf.slice(initial_offset, initial_offset + fileNameLen + 12)

    offset += 4

    const fileName = buf.slice(offset, offset + fileNameLen - 1).toString('ascii')
    offset += fileNameLen

    // console.log({dv, offset})
    const uncompLen = dv.getInt32(offset, 1)
    offset += 4

    const compLen = dv.getInt32(offset, 1)
    offset += 4

    const cdata = buf.slice(offset, offset + compLen)
    offset += compLen

    const entry = ''

    return new instance({
      cdata,
      compLen,
      fileName,
      fileNameLen,
      uncompLen,
      sanityHeader,
    })
  }

  constructor ({ cdata, fileNameLen, fileName, compLen, uncompLen, sanityHeader }) {
    console.log('a new entry was found: ' + fileName)
    this.cdata = cdata
    this.fileNameLen = fileNameLen
    this.fileName = fileName
    this.compLen = compLen
    this.uncompLen = uncompLen
    this.sanityHeader = sanityHeader
  }

  // 4 fileNameLen, 4 cdataLen, 4 uncompData
  SIZE_BUFFERS = 12

  // The size doesn't include uncompLen because that's just a check after inflate
  getSize () {
    return this.fileNameLen + this.compLen + this.SIZE_BUFFERS
  }

  // The cdata is actually an object like a .STO (store) - it could
  // write to disk as it's own data file for the IE game.
  getData () {
    const unpacked = zlib.inflateSync(this.cdata)

    if (unpacked.length !== this.uncompLen) {
      throw new Error('Unpack on Entry failed - mismatched sizes!')
    }

    return unpacked
  }

  setData (data) {
    const packed = zlib.deflateSync(data, { level: 9 })
    this.uncompLen = data.length
    this.compLen = packed.length
    this.cdata = packed

    return this
  }

  toCompSavBuffer () {
    const len = this.getSize()
    const buf = Buffer.alloc(len)
    const dv = new DataView(buf.buffer)

    // Set the size headers - first fileNameLen
    dv.setInt32(0, this.fileNameLen, 1) // offset, value, little-endian

    const fileNameBuf = Buffer.from(this.fileName)
    fileNameBuf.copy(buf, 4)

    // Next, set the uncompLen
    dv.setInt32(4 + this.fileNameLen, this.uncompLen, 1) // offset, value, little-endian

    // Then the compLen
    dv.setInt32(8 + this.fileNameLen, this.compLen, 1) // offset, value, little-endian

    const cdataBuf = Buffer.from(this.cdata)
    cdataBuf.copy(buf, 12 + this.fileNameLen)

    return buf
  }
}

class StoreEntry extends Entry {
  constructor (m) {
    console.log('a new store entry was found: ' + m.fileName)
    super(m)
  }

  /**
   * Given an entry that is of .STO (store) type, sort all the
   * values that are in the data portion and re-pack.
   *
   * This involves not modifying the overall size of the thing being sorted -
   * it will retain it's byte size, although the compressed size may change
   * due to different compression being applicable on re-packaging
   */
  sortItems () {
    const z = this.getData()

    // First 8 of a store = type or something
    // const zheader = z.slice(0, 8).toString('ascii')

    // Item gets 28 bytes - store offset is at 147
    // Ending padding is offset is 144 + 4 extra, hmm..
    // console.log(z.slice(0x90 + 12, 0x90 + 12 + 28).toString('ascii'))
    // console.log(z.slice(156, 156 + 28).toString('ascii'))

    const offsetStart = 156
    const offsetEnd = 148
    const itemSize = 28
    const items = []

    for (let i = offsetStart; i < z.length - offsetEnd; i += itemSize) {
      const item = z.slice(i, i + itemSize)

      items.push({ bytes: item, name: item.toString('ascii') })
    }

    // TODO: Figure out how to translate the basic key used here into
    // an actual item name, so we can do alphabetical bag order
    const sorted = items.sort((a, b) => {
      let sa = bufToStringNul(a.bytes.slice(0, 14))
      let sb = bufToStringNul(b.bytes.slice(0, 14))

      sa = itemNames[sa] || 'zzz' + sa
      sb = itemNames[sb] || 'zzz' + sb

      return sa > sb ? 1 : -1
    })

    // console.log(sorted)

    const sortedEntry = Buffer.from(z)
    // console.log(sortedEntry)

    // Add values from our sorted in here
    for (let i = offsetStart, c = 0; i < z.length - offsetEnd; i += itemSize, c++) {
      const item = sorted[c] // grab the item from this iteration
      const bytes = item.bytes // should be 28 here

      for (let x = 0; x < 28; x++) {
        sortedEntry[i + x] = bytes[x]
      }
    }

    this.setData(sortedEntry)

    return sortedEntry
  }
}

/**
 * Collection to manage entries
 */
class Entries {
  static fromSavFile(fileName) {
    const buf = fs.readFileSync(fileName)

    return Entries.fromSavBuf(buf)
  }

  static fromSavBuf(buf) {
    const header = buf.slice(0, 8).toString('ascii')

    if (header !== 'SAV V1.0') {
      throw new Error('Invalid .SAV file format - first 8 bytes were not "SAV V1.0".')
    }

    let offset = 8
    const x = new Entries(buf)

    // Build all the entries - equivalent of the .sav file
    while (offset < buf.length) {
      // const entry = get_entry(buf, offset)
      let entry = Entry.fromSavBuf(buf, offset)

      // More specialized resource types
      if (/\.sto$/.test(entry.fileName)) {
        entry = StoreEntry.fromSavBuf(buf, offset, StoreEntry)
      }

      offset += entry.getSize()

      x.add(entry)
    }

    return x
  }

  constructor (originalBuf) {
    this.originalBuf = originalBuf
    this.xs = []
  }

  add (x) {
    this.xs.push(x)
  }

  getOneByName (s) {
    for (let i = 0; i < this.xs.length; i++) {
      if (this.xs[i].fileName === s) return this.xs[i]
    }
  }

  /**
   * Re-create a proper .sav file from the split entries in this collection.
   * Involves adding the header, and then re-combining the individual
   * components.
   */
  toSavBuf () {
    const buffers = []
    let byteLen = 8 // Initial 8 for file info header

    // Make each entry a compressed buffer, get total size
    for (let i = 0; i < this.xs.length; i++) {
      const entry = this.xs[i]
      const buf = entry.toCompSavBuffer()
      buffers.push(buf)
      byteLen += buf.buffer.byteLength
    }

    const savBuf = Buffer.alloc(byteLen)
    this.originalBuf.slice(0, 8).copy(savBuf, 0)

    let offset = 8

    for (let i = 0; i < buffers.length; i++) {
      buffers[i].copy(savBuf, offset)
      offset += buffers[i].buffer.byteLength
    }

    return savBuf
  }

  toSavFile (fileName) {
    const buf = this.toSavBuf()
    const fh = fs.openSync(fileName, 'w')
    fs.writeSync(fh, buf, 0, buf.length, 0)
    fs.closeSync(fh)

    return this
  }
}

module.exports = Entries

// const entries = Entries.fromSavFile('./test.sav')

// entries.getOneByName('THBAG05.sto').sortItems()

// entries.toSavFile('oop.sav')

// console.log(entries.getOneByName('THBAG05.itm'))

// p.exit()
