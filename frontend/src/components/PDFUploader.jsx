// import { useState, useRef } from 'react'
// import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Brain, X } from 'lucide-react'
// import { uploadPDF, summarizeText } from '../utils/api'

// export default function PDFUploader({ onPDFLoaded }) {
//   const [dragging, setDragging] = useState(false)
//   const [uploading, setUploading] = useState(false)
//   const [result, setResult] = useState(null)
//   const [error, setError] = useState('')
//   const [summarizing, setSummarizing] = useState(false)
//   const [pdfSummary, setPdfSummary] = useState(null)
//   const inputRef = useRef()

//   const handleFile = async (file) => {
//     if (!file || !file.name.endsWith('.pdf')) {
//       setError('Please upload a valid PDF file.')
//       return
//     }

//     setUploading(true)
//     setError('')
//     setResult(null)
//     setPdfSummary(null)

//     try {
//       const data = await uploadPDF(file)
//       setResult(data)
//       if (onPDFLoaded) onPDFLoaded(data)
//     } catch (e) {
//       setError(e.message)
//     } finally {
//       setUploading(false)
//     }
//   }

//   const handleDrop = (e) => {
//     e.preventDefault()
//     setDragging(false)
//     const file = e.dataTransfer.files[0]
//     handleFile(file)
//   }

//   const handleSummarizePDF = async () => {
//     if (!result?.text) return
//     setSummarizing(true)
//     try {
//       const data = await summarizeText(result.text, result.filename)
//       setPdfSummary(data)
//     } catch (e) {
//       setError(e.message)
//     } finally {
//       setSummarizing(false)
//     }
//   }

//   return (
//     <div className="space-y-4">
//       {/* Drop Zone */}
//       <div
//         onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
//         onDragLeave={() => setDragging(false)}
//         onDrop={handleDrop}
//         onClick={() => inputRef.current?.click()}
//         className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
//           transition-all duration-200 ${
//             dragging
//               ? 'border-blue-400 bg-blue-400/10'
//               : 'border-white/10 hover:border-white/20 hover:bg-white/3'
//           }`}
//       >
//         <input
//           ref={inputRef}
//           type="file"
//           accept=".pdf"
//           className="hidden"
//           onChange={e => handleFile(e.target.files[0])}
//         />

//         {uploading ? (
//           <div className="flex flex-col items-center gap-3">
//             <Loader2 size={32} className="text-blue-400 spin" />
//             <p className="text-sm text-gray-400">Extracting text from PDF…</p>
//             <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
//               <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse w-3/4" />
//             </div>
//           </div>
//         ) : result ? (
//           <div className="flex flex-col items-center gap-2">
//             <CheckCircle size={28} className="text-green-400" />
//             <p className="text-sm font-semibold text-white">{result.filename}</p>
//             <p className="text-xs text-gray-500">{result.pages} pages · {result.full_length.toLocaleString()} characters extracted</p>
//             {result.rag_ready && (
//               <span className="text-xs px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">
//                 RAG Index Ready
//               </span>
//             )}
//           </div>
//         ) : (
//           <div className="flex flex-col items-center gap-3">
//             <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
//               <Upload size={24} className="text-gray-500" />
//             </div>
//             <div>
//               <p className="text-sm font-semibold text-gray-300">Drop your PDF here</p>
//               <p className="text-xs text-gray-600 mt-1">or click to browse · Max 20MB</p>
//             </div>
//           </div>
//         )}
//       </div>

//       {error && (
//         <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
//           <AlertCircle size={12} />
//           {error}
//           <button onClick={() => setError('')} className="ml-auto"><X size={12} /></button>
//         </div>
//       )}

//       {/* Post-upload actions */}
//       {result && (
//         <div className="space-y-3">
//           <button
//             onClick={handleSummarizePDF}
//             disabled={summarizing}
//             className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
//               bg-gradient-to-r from-blue-600/20 to-purple-600/20
//               border border-blue-400/20 text-blue-300 text-sm font-semibold
//               hover:from-blue-600/30 hover:to-purple-600/30 transition-all
//               disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {summarizing ? <Loader2 size={15} className="spin" /> : <Brain size={15} />}
//             {summarizing ? 'Generating Summary…' : 'Summarize This PDF'}
//           </button>

//           {/* Text Preview */}
//           <div className="bg-white/2 border border-white/5 rounded-xl p-4">
//             <p className="text-xs text-gray-600 mb-2 font-mono uppercase tracking-wider">Extracted Text Preview</p>
//             <p className="text-xs text-gray-400 leading-relaxed line-clamp-4 font-mono">
//               {result.text}
//             </p>
//           </div>

//           {/* PDF Summary */}
//           {pdfSummary && (
//             <div className="bg-white/3 border border-white/8 rounded-2xl p-5 space-y-3">
//               <div className="flex items-center gap-2">
//                 <Brain size={16} className="text-purple-400" />
//                 <span className="text-sm font-semibold text-white">PDF Summary</span>
//                 <span className={`text-xs px-2 py-0.5 rounded-full ml-auto
//                   ${pdfSummary.difficulty === 'Beginner' ? 'text-green-400 bg-green-400/10' :
//                     pdfSummary.difficulty === 'Intermediate' ? 'text-yellow-400 bg-yellow-400/10' :
//                     'text-red-400 bg-red-400/10'}`}
//                 >
//                   {pdfSummary.difficulty}
//                 </span>
//               </div>
//               <p className="text-sm text-gray-300 leading-relaxed">{pdfSummary.summary}</p>
//               {pdfSummary.key_points?.map((pt, i) => (
//                 <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
//                   <span className="text-blue-400 font-mono mt-0.5">→</span>
//                   {pt}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }

import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Brain, X } from 'lucide-react'
import { uploadPDF, summarizeText } from '../utils/api'

export default function PDFUploader({ onPDFLoaded }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [summarizing, setSummarizing] = useState(false)
  const [pdfSummary, setPdfSummary] = useState(null)
  const inputRef = useRef()

  const handleFile = async (file) => {
    if (!file || !file.name.endsWith('.pdf')) {
      setError('Please upload a valid PDF file.')
      return
    }

    setUploading(true)
    setError('')
    setResult(null)
    setPdfSummary(null)

    try {
      const data = await uploadPDF(file)
      setResult(data)
      if (onPDFLoaded) onPDFLoaded(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const handleSummarizePDF = async () => {
    if (!result?.text) return
    setSummarizing(true)
    try {
      const data = await summarizeText(result.text, result.filename)
      setPdfSummary(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setSummarizing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-200 ${
            dragging
              ? 'border-blue-400 bg-blue-400/10'
              : 'border-white/10 hover:border-white/20 hover:bg-white/3'
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={e => handleFile(e.target.files[0])}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="text-blue-400 spin" />
            <p className="text-sm text-gray-400">Extracting text from PDF…</p>
            <div className="w-48 h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        ) : result ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle size={28} className="text-green-400" />
            <p className="text-sm font-semibold text-white">{result.filename}</p>
            <p className="text-xs text-gray-500">{result.pages} pages · {result.full_length.toLocaleString()} characters extracted</p>
            {result.rag_ready && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">
                RAG Index Ready
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
              <Upload size={24} className="text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-300">Drop your PDF here</p>
              <p className="text-xs text-gray-600 mt-1">or click to browse · Max 20MB</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          <AlertCircle size={12} />
          {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={12} /></button>
        </div>
      )}

      {/* Post-upload actions */}
      {result && (
        <div className="space-y-3">
          <button
            onClick={handleSummarizePDF}
            disabled={summarizing}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
              bg-gradient-to-r from-blue-600/20 to-purple-600/20
              border border-blue-400/20 text-blue-300 text-sm font-semibold
              hover:from-blue-600/30 hover:to-purple-600/30 transition-all
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {summarizing ? <Loader2 size={15} className="spin" /> : <Brain size={15} />}
            {summarizing ? 'Generating Summary…' : 'Summarize This PDF'}
          </button>

          {/* Text Preview */}
          <div className="bg-white/2 border border-white/5 rounded-xl p-4">
            <p className="text-xs text-gray-600 mb-2 font-mono uppercase tracking-wider">Extracted Text Preview</p>
            <p className="text-xs text-gray-400 leading-relaxed line-clamp-4 font-mono">
              {result.text}
            </p>
          </div>

          {/* PDF Summary */}
          {pdfSummary && (
            <div className="bg-white/3 border border-white/8 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-purple-400" />
                <span className="text-sm font-semibold text-white">PDF Summary</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ml-auto
                  ${pdfSummary.difficulty === 'Beginner' ? 'text-green-400 bg-green-400/10' :
                    pdfSummary.difficulty === 'Intermediate' ? 'text-yellow-400 bg-yellow-400/10' :
                    'text-red-400 bg-red-400/10'}`}
                >
                  {pdfSummary.difficulty}
                </span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{pdfSummary.summary}</p>
              {pdfSummary.key_points?.map((pt, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-400">
                  <span className="text-blue-400 font-mono mt-0.5">→</span>
                  {pt}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}