import { useState } from 'react'
import {
  BookOpen, Zap, MessageSquare, Download, ExternalLink,
  ChevronDown, ChevronUp, Loader2, Users, Calendar,
  CheckCircle, AlertCircle, Star
} from 'lucide-react'
import { summarizeText, chatWithPaper } from '../utils/api'

const DIFFICULTY_COLORS = {
  Beginner: 'text-green-400 bg-green-400/10 border-green-400/30',
  Intermediate: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  Advanced: 'text-red-400 bg-red-400/10 border-red-400/30',
  Unknown: 'text-gray-400 bg-gray-400/10 border-gray-400/30',
}

export default function PaperCard({ paper, index }) {
  const [expanded, setExpanded] = useState(false)
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState('')

  const [chatOpen, setChatOpen] = useState(false)
  const [chatQuestion, setChatQuestion] = useState('')
  const [chatAnswer, setChatAnswer] = useState(null)
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState('')

  const handleSummarize = async () => {
    if (summary) { setExpanded(true); return }
    setSummaryLoading(true)
    setSummaryError('')
    try {
      const result = await summarizeText(paper.abstract, paper.title)
      setSummary(result)
      setExpanded(true)
    } catch (e) {
      setSummaryError(e.message)
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleChat = async (e) => {
    e.preventDefault()
    if (!chatQuestion.trim()) return
    setChatLoading(true)
    setChatError('')
    setChatAnswer(null)
    try {
      const result = await chatWithPaper(chatQuestion, paper.abstract)
      setChatAnswer(result)
    } catch (e) {
      setChatError(e.message)
    } finally {
      setChatLoading(false)
    }
  }

  const handleDownload = () => {
    if (!paper.pdfUrl) return
    const a = document.createElement('a')
    a.href = paper.pdfUrl
    a.download = `${paper.title?.slice(0, 40)}.pdf`
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.click()
  }

  return (
    <div
      className="glass glass-hover rounded-2xl p-6 card-animate"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="font-display font-semibold text-white text-base leading-snug flex-1">
          {paper.title}
        </h3>
        <span className="text-xs font-mono text-blue-400 bg-blue-400/10 px-2 py-1 rounded shrink-0">
          #{index + 1}
        </span>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs text-gray-400">
        {paper.authors?.length > 0 && (
          <span className="flex items-center gap-1">
            <Users size={11} />
            {paper.authors.slice(0, 3).join(', ')}
            {paper.authors.length > 3 && ` +${paper.authors.length - 3}`}
          </span>
        )}
        {paper.year && (
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {paper.year}
          </span>
        )}
        {paper.publicationDate && (
          <span className="text-blue-400">{paper.publicationDate}</span>
        )}
      </div>

      {/* Abstract preview */}
      <p className="text-sm text-gray-400 leading-relaxed mb-5 line-clamp-3">
        {paper.abstract}
      </p>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={handleSummarize}
          disabled={summaryLoading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display font-semibold
            bg-blue-500/15 text-blue-300 border border-blue-500/25 hover:bg-blue-500/25
            disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
        >
          {summaryLoading ? <Loader2 size={12} className="spin" /> : <Zap size={12} />}
          {summaryLoading ? 'Summarizing…' : 'Summarize'}
        </button>

        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display font-semibold
            bg-purple-500/15 text-purple-300 border border-purple-500/25 hover:bg-purple-500/25
            transition-all duration-150"
        >
          <MessageSquare size={12} />
          Chat
        </button>

        {paper.pdfUrl && (
          <>
            <a
              href={paper.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display font-semibold
                bg-green-500/15 text-green-300 border border-green-500/25 hover:bg-green-500/25
                transition-all duration-150"
            >
              <ExternalLink size={12} />
              Open PDF
            </a>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display font-semibold
                bg-orange-500/15 text-orange-300 border border-orange-500/25 hover:bg-orange-500/25
                transition-all duration-150"
            >
              <Download size={12} />
              Download
            </button>
          </>
        )}

        {paper.url && !paper.pdfUrl && (
          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display font-semibold
              bg-gray-500/15 text-gray-300 border border-gray-500/25 hover:bg-gray-500/25
              transition-all duration-150"
          >
            <ExternalLink size={12} />
            View Paper
          </a>
        )}
      </div>

      {/* Summary error */}
      {summaryError && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mb-3">
          <AlertCircle size={12} />
          {summaryError}
        </div>
      )}

      {/* Summary Panel */}
      {summary && (
        <div className="mt-4 border-t border-white/5 pt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-xs text-blue-400 font-semibold mb-3 hover:text-blue-300 transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Hide' : 'Show'} AI Summary
          </button>

          {expanded && (
            <div className="space-y-4 text-sm">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${DIFFICULTY_COLORS[summary.difficulty] || DIFFICULTY_COLORS.Unknown}`}>
                  {summary.difficulty}
                </span>
                {summary.research_area && (
                  <span className="text-xs px-2 py-0.5 rounded-full border border-purple-400/30 text-purple-400 bg-purple-400/10 font-mono">
                    {summary.research_area}
                  </span>
                )}
              </div>

              {/* Summary */}
              <div className="bg-white/3 rounded-xl p-4 border border-white/5">
                <p className="text-sm text-gray-300 leading-relaxed">{summary.summary}</p>
              </div>

              {/* Novelty */}
              {summary.novelty && summary.novelty !== 'N/A' && (
                <div className="flex items-start gap-2 text-yellow-400/80 text-xs">
                  <Star size={12} className="mt-0.5 shrink-0" />
                  <span>{summary.novelty}</span>
                </div>
              )}

              {/* Key Points */}
              {summary.key_points?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Key Points</p>
                  <ul className="space-y-1.5">
                    {summary.key_points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                        <CheckCircle size={11} className="text-green-400 mt-0.5 shrink-0" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chat Panel */}
      {chatOpen && (
        <div className="mt-4 border-t border-white/5 pt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Chat with this paper
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={chatQuestion}
              onChange={e => setChatQuestion(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleChat(e)}
              placeholder="Ask anything about this paper…"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm
                text-white placeholder-gray-600 outline-none focus:border-purple-400/50
                focus:bg-white/8 transition-all"
            />
            <button
              onClick={handleChat}
              disabled={chatLoading || !chatQuestion.trim()}
              className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30
                text-sm font-semibold hover:bg-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed
                transition-all flex items-center gap-1.5"
            >
              {chatLoading ? <Loader2 size={13} className="spin" /> : <MessageSquare size={13} />}
              {chatLoading ? 'Thinking…' : 'Ask'}
            </button>
          </div>

          {chatError && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mt-3">
              <AlertCircle size={12} />
              {chatError}
            </div>
          )}

          {chatAnswer && (
            <div className="mt-3 bg-purple-500/5 border border-purple-500/15 rounded-xl p-4">
              <p className="text-sm text-gray-200 leading-relaxed">{chatAnswer.answer}</p>
              <p className="text-xs text-gray-600 mt-2">
                Source: {chatAnswer.context_source} · {chatAnswer.chunks_used} chunks used
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
