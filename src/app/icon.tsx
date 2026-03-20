import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

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

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#030308',
        borderRadius: '6px',
      }}
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
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
    </div>,
    { ...size }
  )
}
