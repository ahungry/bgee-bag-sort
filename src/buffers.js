const buf = new ArrayBuffer(8)
const dv = new DataView(buf)

dv.setInt32(4, 15, 1)

console.log({dv, buf})
