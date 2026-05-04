interface Props {
  text: string
}

export default function AnalysisCard({ text }: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
        AI Analysis
      </p>
      <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{text}</div>
    </div>
  )
}
