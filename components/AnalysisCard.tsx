interface Props {
  text: string
}

export default function AnalysisCard({ text }: Props) {
  return (
    <div className="bg-white rounded-2xl p-5">
      <p className="text-xs text-gray-300 uppercase tracking-widest mb-3">Analysis</p>
      <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{text}</div>
    </div>
  )
}
