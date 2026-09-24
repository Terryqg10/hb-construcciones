export const location = {
  label: "Villanueva de la Cañada, Madrid",
  address: "Calle Empedrada, Villanueva de la Cañada, 28691 Madrid",
  lat: 40.4481749,
  lon: -4.0043324,
} as const;

export function buildGoogleMapsHref(lat: number, lon: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
}

export function buildOsmEmbedSrc(
  lat: number,
  lon: number,
  lonDelta = 0.008,
  latDelta = 0.005,
): string {
  const minLon = lon - lonDelta;
  const maxLon = lon + lonDelta;
  const minLat = lat - latDelta;
  const maxLat = lat + latDelta;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik`;
}
