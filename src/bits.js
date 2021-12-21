// Given something like 11, 0b1011
// We want to treat data A, bits 3-2 as 0b10 = 2
// And want to treat data B, bits 1-0 as 0b11 = 3
const x = 11
const setA = x >> (4 - 2)
const setB = x & ((1 << 2) - 1) //

console.log(x.toString(2))
console.log(setA.toString(2))
console.log(setB.toString(2))

// https://medium.com/@parkerjmed/practical-bit-manipulation-in-javascript-bfd9ef6d6c30
// create n 1's with (1 << n) - 1
// This works, because with a 10, it sets to 1024 - sub 1 = 1023, which would require all
// of the other one bits to be set
const mask = (1 << 10) - 1
console.log(mask.toString(2))
console.log(0b10000000000 - 1)
