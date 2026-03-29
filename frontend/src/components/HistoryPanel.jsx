// import { useState, useEffect } from 'react'
// import {
//   Search, FileText, Zap, MessageSquare, Database,
//   Clock, RefreshCw, Loader2, ChevronRight, BookOpen,
//   BarChart3, ExternalLink, Cpu
// } from 'lucide-react'
// import {
//   getStats, getSearchHistory, getSavedPapers,
//   getSummaryHistory, getPDFHistory, loadPDFRag
// } from '../utils/api'

// const SECTIONS = [
//   { id: 'overview', label: 'Overview', icon: BarChart3 },
//   { id: 'searches', label: 'Searches', icon: Search },
//   { id: 'papers',   label: 'Saved Papers', icon: BookOpen },
//   { id: 'summaries',label: 'Summaries', icon: Zap },
//   { id: 'pdfs',     label: 'PDFs', icon: FileText },
// ]

// const DIFFICULTY_COLOR = {
//   Beginner:     'text-green-400 bg-green-400/10',
//   Intermediate: 'text-yellow-400 bg-yellow-400/10',
//   Advanced:     'text-red-400 bg-red-400/10',
//   Unknown:      'text-gray-400 bg-gray-400/10',
// }

// function timeAgo(dateStr) {
//   if (!dateStr) return ''
//   const diff = Date.now() - new Date(dateStr).getTime()
//   const m = Math.floor(diff / 60000)
//   if (m < 1) return 'just now'
//   if (m < 60) return `${m}m ago`
//   const h = Math.floor(m / 60)
//   if (h < 24) return `${h}h ago`
//   return `${Math.floor(h / 24)}d ago`
// }

// export default function HistoryPanel({ onLoadPDF }) {
//   const [section, setSection]   = useState('overview')
//   const [loading, setLoading]   = useState(false)
//   const [stats, setStats]       = useState({})
//   const [searches, setSearches] = useState([])
//   const [papers, setPapers]     = useState([])
//   const [summaries, setSummaries] = useState([])
//   const [pdfs, setPdfs]         = useState([])
//   const [loadingPdf, setLoadingPdf] = useState(null)

//   const refresh = async () => {
//     setLoading(true)
//     try {
//       const [s, sh, sp, su, pd] = await Promise.all([
//         getStats(), getSearchHistory(), getSavedPapers(),
//         getSummaryHistory(), getPDFHistory(),
//       ])
//       setStats(s)
//       setSearches(sh.searches || [])
//       setPapers(sp.papers || [])
//       setSummaries(su.summaries || [])
//       setPdfs(pd.pdfs || [])
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => { refresh() }, [])

//   const handleLoadPDF = async (pdf) => {
//     setLoadingPdf(pdf._id)
//     try {
//       await loadPDFRag(pdf._id)
//       if (onLoadPDF) onLoadPDF(pdf)
//     } catch (e) {
//       alert('Failed to reload PDF: ' + e.message)
//     } finally {
//       setLoadingPdf(null)
//     }
//   }

//   return (
//     <div className="glass rounded-2xl overflow-hidden">
//       {/* Top bar */}
//       <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
//         <div className="flex items-center gap-2">
//           <Database size={16} className="text-blue-400" />
//           <span className="font-display font-semibold text-sm text-white">MongoDB History</span>
//           <span className="text-xs px-1.5 py-0.5 rounded bg-green-400/15 text-green-400 border border-green-400/20 font-mono">
//             LIVE
//           </span>
//         </div>
//         <button
//           onClick={refresh}
//           disabled={loading}
//           className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all"
//         >
//           {loading ? <Loader2 size={14} className="spin" /> : <RefreshCw size={14} />}
//         </button>
//       </div>

//       {/* Section tabs */}
//       <div className="flex border-b border-white/5 overflow-x-auto">
//         {SECTIONS.map(s => {
//           const Icon = s.icon
//           const active = section === s.id
//           return (
//             <button
//               key={s.id}
//               onClick={() => setSection(s.id)}
//               className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold whitespace-nowrap
//                 transition-all border-b-2 ${
//                   active
//                     ? 'border-blue-400 text-blue-400 bg-blue-400/5'
//                     : 'border-transparent text-gray-600 hover:text-gray-400'
//                 }`}
//             >
//               <Icon size={12} />
//               {s.label}
//             </button>
//           )
//         })}
//       </div>

//       {/* Content */}
//       <div className="p-4 max-h-[520px] overflow-y-auto">

//         {/* ── OVERVIEW ── */}
//         {section === 'overview' && (
//           <div className="space-y-4">
//             <p className="text-xs text-gray-600 font-mono">Everything saved in your MongoDB database</p>
//             <div className="grid grid-cols-2 gap-3">
//               {[
//                 { label: 'Searches',  value: stats.searches,  icon: Search,      color: 'blue' },
//                 { label: 'Papers',    value: stats.papers,    icon: BookOpen,    color: 'purple' },
//                 { label: 'Summaries', value: stats.summaries, icon: Zap,         color: 'yellow' },
//                 { label: 'PDFs',      value: stats.pdfs,      icon: FileText,    color: 'green' },
//                 { label: 'Chats',     value: stats.chats,     icon: MessageSquare, color: 'pink' },
//               ].map(item => {
//                 const Icon = item.icon
//                 const colors = {
//                   blue:   'bg-blue-400/10 border-blue-400/20 text-blue-400',
//                   purple: 'bg-purple-400/10 border-purple-400/20 text-purple-400',
//                   yellow: 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400',
//                   green:  'bg-green-400/10 border-green-400/20 text-green-400',
//                   pink:   'bg-pink-400/10 border-pink-400/20 text-pink-400',
//                 }
//                 return (
//                   <div key={item.label} className={`rounded-xl p-3 border ${colors[item.color]}`}>
//                     <div className="flex items-center gap-2 mb-1">
//                       <Icon size={12} />
//                       <span className="text-xs font-mono">{item.label}</span>
//                     </div>
//                     <p className="text-2xl font-display font-bold">
//                       {item.value ?? <Loader2 size={16} className="spin inline" />}
//                     </p>
//                   </div>
//                 )
//               })}

//               {/* MongoDB status card */}
//               <div className="rounded-xl p-3 border bg-white/3 border-white/8 col-span-1">
//                 <div className="flex items-center gap-2 mb-1">
//                   <Cpu size={12} className="text-gray-500" />
//                   <span className="text-xs font-mono text-gray-500">Database</span>
//                 </div>
//                 <div className="flex items-center gap-1.5 mt-1">
//                   <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
//                   <span className="text-xs text-green-400">Connected</span>
//                 </div>
//                 <p className="text-xs text-gray-600 mt-1 font-mono">localhost:27017</p>
//               </div>
//             </div>

//             <div className="text-xs text-gray-700 bg-white/2 rounded-xl p-3 border border-white/5 space-y-1 font-mono">
//               <p className="text-gray-500 font-semibold mb-2">Collections</p>
//               <p>📦 research_assistant.papers</p>
//               <p>📦 research_assistant.searches</p>
//               <p>📦 research_assistant.summaries</p>
//               <p>📦 research_assistant.pdfs</p>
//               <p>📦 research_assistant.chats</p>
//             </div>
//           </div>
//         )}

//         {/* ── SEARCHES ── */}
//         {section === 'searches' && (
//           <div className="space-y-2">
//             {searches.length === 0 && (
//               <p className="text-xs text-gray-600 text-center py-8">No searches yet</p>
//             )}
//             {searches.map((s, i) => (
//               <div key={s._id || i} className="flex items-center justify-between
//                 px-3 py-2.5 rounded-xl bg-white/3 border border-white/5 hover:bg-white/5 transition-all">
//                 <div className="flex items-center gap-2">
//                   <Search size={11} className="text-blue-400 shrink-0" />
//                   <span className="text-sm text-gray-200 font-mono">{s.query}</span>
//                   <span className="text-xs text-gray-600">{s.count} papers</span>
//                 </div>
//                 <span className="text-xs text-gray-600 flex items-center gap-1">
//                   <Clock size={10} /> {timeAgo(s.searchedAt)}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* ── SAVED PAPERS ── */}
//         {section === 'papers' && (
//           <div className="space-y-3">
//             {papers.length === 0 && (
//               <p className="text-xs text-gray-600 text-center py-8">No papers saved yet — search to discover papers</p>
//             )}
//             {papers.map((p, i) => (
//               <div key={p._id || i} className="rounded-xl bg-white/3 border border-white/5 p-3 space-y-1.5">
//                 <p className="text-xs font-semibold text-white leading-snug line-clamp-2">{p.title}</p>
//                 <div className="flex items-center gap-2 flex-wrap">
//                   {p.year && <span className="text-xs text-gray-500 font-mono">{p.year}</span>}
//                   {p.publicationDate && (
//                     <span className="text-xs text-blue-400">{p.publicationDate}</span>
//                   )}
//                   <span className="text-xs text-gray-600 flex items-center gap-1 ml-auto">
//                     <Clock size={9} /> {timeAgo(p.savedAt)}
//                   </span>
//                 </div>
//                 {p.url && (
//                   <a
//                     href={p.url} target="_blank" rel="noopener noreferrer"
//                     className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
//                   >
//                     <ExternalLink size={10} /> View paper
//                   </a>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}

//         {/* ── SUMMARIES ── */}
//         {section === 'summaries' && (
//           <div className="space-y-3">
//             {summaries.length === 0 && (
//               <p className="text-xs text-gray-600 text-center py-8">No summaries yet — click Summarize on any paper</p>
//             )}
//             {summaries.map((s, i) => (
//               <div key={s._id || i} className="rounded-xl bg-white/3 border border-white/5 p-3 space-y-2">
//                 <div className="flex items-start justify-between gap-2">
//                   <p className="text-xs font-semibold text-white line-clamp-2 flex-1">
//                     {s.title || 'Untitled paper'}
//                   </p>
//                   <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${DIFFICULTY_COLOR[s.difficulty] || DIFFICULTY_COLOR.Unknown}`}>
//                     {s.difficulty || 'Unknown'}
//                   </span>
//                 </div>
//                 {s.research_area && (
//                   <span className="text-xs text-purple-400 font-mono">{s.research_area}</span>
//                 )}
//                 <p className="text-xs text-gray-400 line-clamp-2">{s.summary}</p>
//                 <span className="text-xs text-gray-600 flex items-center gap-1">
//                   <Clock size={9} /> {timeAgo(s.createdAt)}
//                 </span>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* ── PDFs ── */}
//         {section === 'pdfs' && (
//           <div className="space-y-3">
//             {pdfs.length === 0 && (
//               <p className="text-xs text-gray-600 text-center py-8">No PDFs uploaded yet</p>
//             )}
//             {pdfs.map((p, i) => (
//               <div key={p._id || i} className="rounded-xl bg-white/3 border border-white/5 p-3 space-y-2">
//                 <div className="flex items-start justify-between gap-2">
//                   <div>
//                     <p className="text-xs font-semibold text-white">{p.filename}</p>
//                     <p className="text-xs text-gray-500 mt-0.5">
//                       {p.pages} pages · {p.fullLength?.toLocaleString()} chars
//                     </p>
//                   </div>
//                   <span className="text-xs px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">
//                     RAG ready
//                   </span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span className="text-xs text-gray-600 flex items-center gap-1">
//                     <Clock size={9} /> {timeAgo(p.uploadedAt)}
//                   </span>
//                   <button
//                     onClick={() => handleLoadPDF(p)}
//                     disabled={loadingPdf === p._id}
//                     className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg
//                       bg-blue-500/15 text-blue-300 border border-blue-500/25
//                       hover:bg-blue-500/25 disabled:opacity-50 transition-all"
//                   >
//                     {loadingPdf === p._id
//                       ? <Loader2 size={11} className="spin" />
//                       : <ChevronRight size={11} />}
//                     Load into RAG
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//       </div>
//     </div>
//   )
// }