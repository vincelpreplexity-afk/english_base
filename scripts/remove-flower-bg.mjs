import sharp from 'sharp'

const SRC = process.argv[2]
const OUT = process.argv[3] ?? 'public/flower.png'
// Euclidean per-step tolerance for region growing. Small enough that the
// flower's hard dark outline (a sharp light→dark ramp) stops the fill, large
// enough to walk the smooth black→gray→white vignette gradient.
const TOL = Number(process.argv[4] ?? 26)

const img = sharp(SRC).ensureAlpha()
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H, channels: C } = info

const idx = (x, y) => (y * W + x) * C
const visited = new Uint8Array(W * H)

// Seed from every border pixel.
const stack = []
for (let x = 0; x < W; x++) {
  stack.push([x, 0], [x, H - 1])
}
for (let y = 0; y < H; y++) {
  stack.push([0, y], [W - 1, y])
}

const tol2 = TOL * TOL
while (stack.length) {
  const [x, y] = stack.pop()
  if (x < 0 || y < 0 || x >= W || y >= H) continue
  const p = y * W + x
  if (visited[p]) continue
  visited[p] = 1
  const i = idx(x, y)
  const r = data[i], g = data[i + 1], b = data[i + 2]
  // Compare against each neighbour: enqueue if colour step is small.
  const neigh = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]
  for (const [nx, ny] of neigh) {
    if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
    const np = ny * W + nx
    if (visited[np]) continue
    const ni = idx(nx, ny)
    const dr = data[ni] - r, dg = data[ni + 1] - g, db = data[ni + 2] - b
    if (dr * dr + dg * dg + db * db <= tol2) stack.push([nx, ny])
  }
}

// Background pixels → fully transparent.
let cleared = 0
for (let p = 0; p < W * H; p++) {
  if (visited[p]) {
    data[p * C + 3] = 0
    cleared++
  }
}

await sharp(data, { raw: { width: W, height: H, channels: C } })
  .png()
  .toFile(OUT)

console.log(`cleared ${cleared}/${W * H} px (${((cleared / (W * H)) * 100).toFixed(1)}%) → ${OUT} (tol=${TOL})`)
