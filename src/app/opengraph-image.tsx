import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const alt = 'Starwoven: A question, seen from many angles.'

// Pastel oracle colors (softened from the five oracle accent colors)
const RAYS = [
  { color: '#7dd4b8', angle: -90 }, // Iris (teal)
  { color: '#c9a6e8', angle: -18 }, // Luna (lavender)
  { color: '#7db8f4', angle: 54 }, // Echo (sky blue)
  { color: '#a8a4f4', angle: 126 }, // Shade (periwinkle)
  { color: '#f4a8a8', angle: 198 }, // Nova (rose)
]

function rayPath(
  angleDeg: number,
  cx: number,
  cy: number,
  inner: number,
  outer: number,
  spread: number
): string {
  const rad = (angleDeg * Math.PI) / 180
  const leftRad = rad - (spread * Math.PI) / 180
  const rightRad = rad + (spread * Math.PI) / 180
  const tipX = cx + Math.cos(rad) * outer
  const tipY = cy + Math.sin(rad) * outer
  const lx = cx + Math.cos(leftRad) * inner
  const ly = cy + Math.sin(leftRad) * inner
  const rx = cx + Math.cos(rightRad) * inner
  const ry = cy + Math.sin(rightRad) * inner
  return `M${lx},${ly} L${tipX},${tipY} L${rx},${ry} Z`
}

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(180deg, #070711 0%, #030308 100%)',
        fontFamily: 'Georgia, serif',
      }}
    >
      {/* Star mark */}
      <svg width="100" height="100" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 40 }}>
        {RAYS.map((ray, i) => (
          <path
            key={i}
            d={rayPath(ray.angle, 12, 12, 3.5, 11, 12)}
            fill={ray.color}
            opacity="0.85"
          />
        ))}
        <circle cx="12" cy="12" r="2.5" fill="#e8e4dc" opacity="0.9" />
      </svg>

      {/* Title */}
      <div
        style={{
          fontSize: 64,
          fontWeight: 400,
          color: '#e8e4dc',
          letterSpacing: '-0.02em',
          marginBottom: 16,
        }}
      >
        Starwoven
      </div>

      {/* Tagline */}
      <div
        style={{
          fontSize: 24,
          color: '#9a9488',
          letterSpacing: '0.02em',
        }}
      >
        A question, seen from many angles.
      </div>
    </div>,
    { ...size }
  )
}
