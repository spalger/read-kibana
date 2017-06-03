export function fcb(fn) {
  return new Promise((resolve, reject) => {
    fn((err, arg) => {
      if (err) reject(err)
      else resolve(arg)
    })
  })
}
