'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Paper = { id: string; title: string; duration_minutes: number; total_marks: number; negative_mark: number }
type Section = { id: string; name: string; position: number }
type Question = {
  id: string; section_id: string; position: number; passage: string | null
  question_text: string; option_a: string; option_b: string; option_c: string; option_d: string; marks: number
}

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
}

export default function TestClient({
  paper, sections, questions,
}: { paper: Paper; sections: Section[]; questions: Question[] }) {
  const router = useRouter()
  const storageKey = `test_${paper.id}`
  const [ready, setReady] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [marked, setMarked] = useState<Record<string, boolean>>({})
  const [current, setCurrent] = useState(0)
  const [endTime, setEndTime] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(paper.duration_minutes * 60)
  const [submitting, setSubmitting] = useState(false)
  const submittedRef = useRef(false)

  // Load saved progress (so a refresh doesn't lose the test)
  useEffect(() => {
    let saved: any = null
    try { saved = JSON.parse(localStorage.getItem(storageKey) || 'null') } catch {}
    setEndTime(saved?.endTime ?? Date.now() + paper.duration_minutes * 60 * 1000)
    if (saved) {
      setAnswers(saved.answers || {})
      setMarked(saved.marked || {})
      setCurrent(saved.current || 0)
    }
    setReady(true)
  }, [])

  // Save progress
  useEffect(() => {
    if (!ready || submittedRef.current) return
    try {
      localStorage.setItem(storageKey, JSON.stringify({ answers, marked, current, endTime }))
    } catch {}
  }, [ready, answers, marked, current, endTime])

  // Timer
  useEffect(() => {
    if (!ready) return
    const tick = () => {
      const left = Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
      setSecondsLeft(left)
      if (left <= 0) submit()
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [ready, endTime, answers])

  async function submit() {
    if (submittedRef.current) return
    submittedRef.current = true
    setSubmitting(true)

    let anonId = localStorage.getItem('anon_id')
    if (!anonId) {
      anonId = crypto.randomUUID()
      localStorage.setItem('anon_id', anonId)
    }
    const total = paper.duration_minutes * 60
    const timeTaken = Math.min(total, total - Math.max(0, Math.ceil((endTime - Date.now()) / 1000)))

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId: paper.id, anonId, answers, timeTaken }),
      })
      if (!res.ok) throw new Error('failed')
      const { attemptId } = await res.json()
      localStorage.removeItem(storageKey)
      router.push(`/result/${attemptId}`)
    } catch {
      submittedRef.current = false
      setSubmitting(false)
      alert('Could not submit. Please check your internet and try again.')
    }
  }

  function confirmSubmit() {
    const answered = Object.keys(answers).length
    if (window.confirm(`You have answered ${answered} of ${questions.length} questions. Submit the test?`)) {
      submit()
    }
  }

  if (!ready) return <p className="p-6">Loading test...</p>
  if (questions.length === 0) return <p className="p-6">This paper has no questions yet.</p>

  const q = questions[current]
  const sectionName = sections.find((s) => s.id === q.section_id)?.name
  const options: [string, string][] = [
    ['A', q.option_a], ['B', q.option_b], ['C', q.option_c], ['D', q.option_d],
  ]

  return (
    <main className="mx-auto max-w-5xl px-4 py-4">
      <div className="sticky top-0 z-10 mb-4 flex items-center justify-between border-b bg-white py-3">
        <div className="font-semibold">{paper.title}</div>
        <div className={`rounded-lg px-3 py-1 font-mono text-lg ${secondsLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`}>
          {fmt(secondsLeft)}
        </div>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex-1">
          <div className="mb-2 text-sm text-gray-600">
            {sectionName} · Question {current + 1} of {questions.length} · {q.marks} mark(s)
          </div>

          {q.passage && (
            <div className="mb-4 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border bg-gray-50 p-4 text-sm">
              {q.passage}
            </div>
          )}

          <p className="mb-4 whitespace-pre-wrap text-lg">{q.question_text}</p>

          <div className="space-y-3">
            {options.map(([letter, text]) => (
              <button
                key={letter}
                onClick={() => setAnswers({ ...answers, [q.id]: letter })}
                className={`block w-full rounded-lg border p-3 text-left transition ${
                  answers[q.id] === letter ? 'border-blue-600 bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <span className="mr-2 font-semibold">{letter}.</span>
                {text}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              disabled={current === 0}
              onClick={() => setCurrent(current - 1)}
              className="rounded-lg border px-4 py-2 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => {
                const next = { ...answers }
                delete next[q.id]
                setAnswers(next)
              }}
              className="rounded-lg border px-4 py-2"
            >
              Clear
            </button>
            <button
              onClick={() => setMarked({ ...marked, [q.id]: !marked[q.id] })}
              className="rounded-lg border px-4 py-2"
            >
              {marked[q.id] ? 'Unmark review' : 'Mark for review'}
            </button>
            <button
              disabled={current === questions.length - 1}
              onClick={() => setCurrent(current + 1)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        <aside className="md:w-64">
          <div className="mb-3 text-sm font-medium">Question palette</div>
          <div className="grid grid-cols-6 gap-2 md:grid-cols-5">
            {questions.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setCurrent(i)}
                className={`h-9 rounded text-sm ${
                  marked[item.id]
                    ? 'bg-purple-500 text-white'
                    : answers[item.id]
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200'
                } ${i === current ? 'ring-2 ring-blue-600 ring-offset-1' : ''}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-1 text-xs text-gray-600">
            <div>🟩 Answered &nbsp; 🟪 Marked for review &nbsp; ⬜ Not answered</div>
          </div>
          <button
            disabled={submitting}
            onClick={confirmSubmit}
            className="mt-6 w-full rounded-lg bg-red-600 py-3 font-semibold text-white disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit test'}
          </button>
        </aside>
      </div>
    </main>
  )
}