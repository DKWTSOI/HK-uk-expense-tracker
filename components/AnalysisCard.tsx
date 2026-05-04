interface Props {
  text: string
}

export default function AnalysisCard({ text }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        AI Analysis
      </p>
      <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{text}</div>
    </div>
  )
}
