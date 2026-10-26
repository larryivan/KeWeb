// lib/land.ts — decode the relative-move land path (land.generated.ts) into dot centres.
// Path grammar (scripts/home-land.mjs): `M{x} {y}h0` starts a row, `m{dx} {dy}h0` adds a dot.
// Returns a flat Float32Array [x0, y0, x1, y1, …] in map units (0…LAND.w, 0…LAND.h).

export function decodeLand(d: string): Float32Array {
  const out: number[] = []
  const re = /([Mm])\s*(-?[\d.]+)[\s,]+(-?[\d.]+)\s*h0/g
  let x = 0
  let y = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(d))) {
    const a = +m[2]
    const b = +m[3]
    if (m[1] === 'M') { x = a; y = b } else { x += a; y += b }
    out.push(x, y)
  }
  return new Float32Array(out)
}
