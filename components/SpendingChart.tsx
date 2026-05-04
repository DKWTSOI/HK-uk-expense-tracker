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
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={60}
        />
        <YAxis
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
          labelStyle={{ color: '#111827', fontWeight: 600 }}
          itemStyle={{ color: '#6b7280' }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [`£${Number(v).toFixed(2)}`, 'Spent']}
        />
        <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? '#111827' : '#e5e7eb'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
