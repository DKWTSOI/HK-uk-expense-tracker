'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Props {
  data: { name: string; amount: number }[]
}

export default function SpendingChart({ data }: Props) {
  if (data.length === 0) return null
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: '#71717a', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tick={{ fill: '#71717a', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: 8 }}
          labelStyle={{ color: '#e4e4e7' }}
          itemStyle={{ color: '#a1a1aa' }}
          formatter={(v: number) => [`£${v.toFixed(2)}`, 'Spent']}
        />
        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? '#ffffff' : '#3f3f46'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
