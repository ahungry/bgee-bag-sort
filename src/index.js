const p = require('process')

const Item = require('./item')

const item = Item.fromFile('./data-samples/thbag05.itm')

console.log(item)
