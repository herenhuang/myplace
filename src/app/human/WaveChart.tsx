"use client"

import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import styles from './wave-chart.module.scss'

export interface WavePoint { x: number; percentile: number }

interface Props {
  data: WavePoint[]
}

export default function WaveChart({ data }: Props) {
  const chartData = data.map((p, i) => ({ name: `Q${i + 1}`, value: p.percentile }))

  return (
    <div className={styles.waveChart}>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }} layout="vertical">
          <defs>
            <linearGradient id="waveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
          {/* Horizontal axis becomes value (0-100%), vertical axis lists questions */}
          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ stroke: '#f97316', strokeWidth: 1 }} formatter={(v) => [`${v}%`, 'Unusual']} />
          <Area type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} fill="url(#waveFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}


