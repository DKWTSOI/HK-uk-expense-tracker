'use client'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Props {
  data: { name: string; amount: number }[]
}

export default function SpendingChart({ data }: Props) {
  if (data.length === 0) return null
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -28, bottom: 0 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: '#d1d5db', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={0}
          angle={-30}
          textAnchor="end"
          height={55}
        />
        <YAxis
          tick={{ fill: '#d1d5db', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ background: '#fff', border: '1px solid #f3f4f6', borderRadius: 8, boxShadow: '0 1px 4px rgb(0 0 0 / 0.04)' }}
          labelStyle={{ color: '#374151', fontSize: 12 }}
          itemStyle={{ color: '#9ca3af', fontSize: 12 }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [`£${Number(v).toFixed(2)}`, '']}
        />
        <Bar dataKey="amount" radius={[3, 3, 0, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={i === 0 ? '#292524' : '#e7e5e4'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
