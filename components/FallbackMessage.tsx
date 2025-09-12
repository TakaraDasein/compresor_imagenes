import { AlertTriangle } from "lucide-react"

interface FallbackMessageProps {
  title: string
  message: string
}

export default function FallbackMessage({ title, message }: FallbackMessageProps) {
  return (
    <div className="bg-yellow-900/20 rounded-lg overflow-hidden flex items-center justify-center p-6">
      <div className="text-white text-center flex flex-col items-center">
        <AlertTriangle className="w-10 h-10 text-yellow-400 mb-3" />
        <h3 className="text-lg font-bold mb-2">{title}</h3>
        <p className="text-sm text-white/80">{message}</p>
      </div>
    </div>
  )
}
