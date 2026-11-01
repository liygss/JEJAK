interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  stroke?: string
  fill?: string
  className?: string
}

const Sparkline = ({
  data,
  width = 96,
  height = 32,
  stroke = '#059669',
  fill = 'rgba(5, 150, 105, 0.12)',
  className,
}: SparklineProps) => {
  if (data.length < 2) return <div className={className} style={{ width, height }} />

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const stepX = width / (data.length - 1)
  const pad = 2

  const points = data.map((v, i) => {
    const x = i * stepX
    const y = pad + (height - pad * 2) * (1 - (v - min) / range)
    return [x, y] as const
  })

  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={area} fill={fill} />
      <path d={line} fill="none" stroke={stroke} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default Sparkline
