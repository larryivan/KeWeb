// geo/frame.mjs — projection constants shared by the atlas data loader (atlas.data.ts)
// and the land-dot generator (scripts/home-land.mjs). Plain JS; d3-geo is passed in so this
// file has no dependencies. Build-time only: never import it from client code.

export const MAP_W = 1000
export const STEP = 7
export const ROTATE = [-65, 0]
export const FRAME = { lon: [-18, 148], lat: [-36, 62] }

/**
 * The frame as a MultiPoint of the 4 corners + the top/bottom midpoints.
 * NOT a Polygon: with spherical winding a polygon would fit the whole globe.
 */
export function frameGeo() {
  const [lon0, lon1] = FRAME.lon
  const [lat0, lat1] = FRAME.lat
  const m = (lon0 + lon1) / 2
  return {
    type: 'MultiPoint',
    coordinates: [
      [lon0, lat0], [lon1, lat0], [lon0, lat1], [lon1, lat1],
      [m, lat1], [m, lat0],
    ],
  }
}

/** Map height: fitWidth, then H = ceil(y(midLon, latMin) − y(midLon, latMax) + 2·STEP) → 738. */
export function computeH(d3) {
  const p = d3.geoNaturalEarth1().rotate(ROTATE)
  p.fitWidth(MAP_W, frameGeo())
  const m = (FRAME.lon[0] + FRAME.lon[1]) / 2
  return Math.ceil(p([m, FRAME.lat[0]])[1] - p([m, FRAME.lat[1]])[1] + 2 * STEP)
}

/** Natural Earth projection fitted to [MAP_W, H] with the frame. */
export function makeProjection(d3, H) {
  const p = d3.geoNaturalEarth1().rotate(ROTATE)
  p.fitSize([MAP_W, H], frameGeo())
  return p
}
