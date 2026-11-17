import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, relative } from 'node:path'
import { createHash } from 'node:crypto'
import { deflateSync } from 'node:zlib'

const dist = new URL('../dist/', import.meta.url).pathname
const iconsDir = join(dist, 'icons')
mkdirSync(iconsDir, { recursive: true })

// Generate a simple eye icon as PNG with Node's built-in zlib.
const crcTable = Array.from({ length: 256 }, (_, value) => {
  let v = value
  for (let i = 0; i < 8; i++) v = (v & 1) ? (0xedb88320 ^ (v >>> 1)) : v >>> 1
  return v >>> 0
})
function crc32(bytes) {
  let crc = 0xffffffff
  for (const b of bytes) crc = crcTable[(crc ^ b) & 255] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}
function chunk(name, bytes) {
  const data = Buffer.from(bytes)
  const type = Buffer.from(name)
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([type, data])))
  return Buffer.concat([len, type, data, crc])
}
function color(x, y) {
  const r = Math.hypot(x, y)
  let result = [16, 56, 56]
  if (r < 0.81 && r > 0.73) result = [67, 135, 113]
  if (r < 0.69) result = [20, 76, 67]
  const ax = Math.abs(x)
  const eyeEdge = ax < 0.60 ? 0.31 * Math.sqrt(1 - (ax / 0.60) ** 2) : 0
  if (ax < 0.60 && Math.abs(y) < eyeEdge) result = [229, 245, 226]
  const iris = Math.hypot(x, y)
  if (iris < 0.242) result = [94, 173, 135]
  if (iris < 0.135) result = [17, 67, 58]
  if (Math.hypot(x + 0.058, y + 0.069) < 0.045) result = [241, 252, 232]
  return result
}
function makePng(size) {
  const bytes = Buffer.alloc(size * (size * 4 + 1))
  const row = size * 4 + 1
  for (let y = 0; y < size; y++) {
    bytes[y * row] = 0
    for (let x = 0; x < size; x++) {
      const samples = [[-0.25,-0.25],[-0.25,0.25],[0.25,-0.25],[0.25,0.25]]
      const sum = [0, 0, 0]
      for (const [dx, dy] of samples) {
        const c = color((x + .5 + dx) / size * 2 - 1, (y + .5 + dy) / size * 2 - 1)
        sum[0] += c[0]; sum[1] += c[1]; sum[2] += c[2]
      }
      const p = y * row + 1 + x * 4
      bytes[p] = Math.round(sum[0] / 4)
      bytes[p+1] = Math.round(sum[1] / 4)
      bytes[p+2] = Math.round(sum[2] / 4)
      bytes[p+3] = 255
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(bytes, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}
for (const size of [192, 512]) writeFileSync(join(iconsDir, 'icon-' + size + '.png'), makePng(size))

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const target = join(dir, entry.name)
    return entry.isDirectory() ? walk(target) : [target]
  })
}
const assets = walk(dist)
  .filter(path => !path.endsWith('/sw.js') && !path.endsWith('.map'))
  .map(path => './' + relative(dist, path).replaceAll('\\', '/')).sort()
const cacheAssets = ['.', ...assets]
const version = createHash('sha256')
for (const asset of assets) {
  version.update(asset)
  version.update(createHash('sha256').update(readFileSync(join(dist, asset.slice(2)))).digest())
}
const cacheName = 'second-look-lab-shell-' + version.digest('hex').slice(0, 14)

const lines = [
  '// Generated at build time - do not edit by hand.',
  'const CACHE_NAME = ' + JSON.stringify(cacheName) + ';',
  'const PRECACHE = ' + JSON.stringify(cacheAssets) + ';',
  "self.addEventListener('install', event => {",
  '  event.waitUntil(caches.open(CACHE_NAME)',
  '    .then(cache => cache.addAll(PRECACHE.map(path => new URL(path, self.registration.scope))))',
  '    .then(() => self.skipWaiting()))',
  '})',
  "self.addEventListener('activate', event => {",
  '  event.waitUntil(Promise.all([',
  '    caches.keys().then(names => Promise.all(',
  "      names.filter(name => name.startsWith('second-look-lab-shell-') && name !== CACHE_NAME).map(name => caches.delete(name))",
  '    )),',
  '    self.clients.claim()',
  '  ]))',
  '})',
  "self.addEventListener('fetch', event => {",
  '  const request = event.request',
  "  if (request.method !== 'GET') return",
  '  const url = new URL(request.url)',
  '  const scope = new URL(self.registration.scope)',
  '  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return',
  "  if (request.mode === 'navigate') {",
  '    event.respondWith(fetch(request).then(response => {',
  "      if (!response.ok) throw new Error('Navigation failed')",
  '      return response',
  '    }).catch(async () => {',
  '      const cache = await caches.open(CACHE_NAME)',
  "      return (await cache.match(new URL('./index.html', self.registration.scope), { ignoreVary: true })) || Response.error()",
  '    }))',
  '    return',
  '  }',
  '  event.respondWith(caches.open(CACHE_NAME).then(cache => cache.match(request, { ignoreVary: true })).then(cached => cached || fetch(request)))',
  '})',
]
writeFileSync(join(dist, 'sw.js'), lines.join('\n'))
console.log('Mobile Lab PWA: generated icons and offline cache ' + cacheName + ' for ' + cacheAssets.length + ' assets.')
