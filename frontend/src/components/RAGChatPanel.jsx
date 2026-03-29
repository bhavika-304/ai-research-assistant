import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, AlertCircle, Brain, Info } from 'lucide-react'
import { chatWithPaper } from '../utils/api'

export default function RAGChatPanel({ ragReady, chunksCount }) {
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e.preventDefault()
    const q = question.trim()
    if (!q) return

    setMessages(prev => [...prev, { role: 'user', text: q }])
    setQuestion('')
    setLoading(true)
    setError('')

    try {
      const result = await chatWithPaper(q)
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: result.answer,
        meta: `${result.context_source} · ${result.chunks_used} chunks`,
      }])
    } catch (e) {
      setError(e.message)
      setMessages(prev => [...prev, {
        role: 'error',
        text: e.message,
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Status bar */}
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4 text-xs
        ${ragReady
          ? 'bg-green-400/8 border border-green-400/20 text-green-400'
          : 'bg-yellow-400/8 border border-yellow-400/20 text-yellow-400'}`}
      >
        <span className={`w-2 h-2 rounded-full ${ragReady ? 'bg-green-400' : 'bg-yellow-400'} animate-pulse`} />
        {ragReady
          ? `RAG Active · ${chunksCount} chunks indexed · Deep answers enabled`
          : 'Upload a PDF to enable deep RAG chat (abstract-only mode now)'}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[200px] max-h-[400px]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Brain size={32} className="text-gray-700 mb-3" />
            <p className="text-sm text-gray-600">Ask anything about your uploaded paper</p>
            <p className="text-xs text-gray-700 mt-1">
              {ragReady ? 'Using RAG for accurate answers' : 'Upload PDF for better context'}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0
              ${msg.role === 'user' ? 'bg-blue-500/20' :
                msg.role === 'error' ? 'bg-red-500/20' : 'bg-purple-500/20'}`}
            >
              {msg.role === 'user'
                ? <User size={13} className="text-blue-400" />
                : msg.role === 'error'
                ? <AlertCircle size={13} className="text-red-400" />
                : <Bot size={13} className="text-purple-400" />
              }
            </div>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
              ${msg.role === 'user'
                ? 'bg-blue-500/15 border border-blue-500/20 text-white'
                : msg.role === 'error'
                ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                : 'bg-white/4 border border-white/8 text-gray-200'}`}
            >
              {msg.text}
              {msg.meta && (
                <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                  <Info size={10} /> {msg.meta}
                </p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Bot size={13} className="text-purple-400" />
            </div>
            <div className="bg-white/4 border border-white/8 rounded-2xl px-4 py-3">
              <Loader2 size={14} className="text-purple-400 spin" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder={ragReady ? "Ask about the paper (RAG-powered)…" : "Ask about the paper…"}
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm
            text-white placeholder-gray-600 outline-none focus:border-purple-400/40
            focus:bg-white/7 transition-all"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-4 py-3 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30
            hover:bg-purple-500/30 disabled:opacity-40 disabled:cursor-not-allowed
            transition-all flex items-center gap-1.5 text-sm font-semibold"
        >
          {loading ? <Loader2 size={15} className="spin" /> : <Send size={15} />}
        </button>
      </form>
    </div>
  )
}
