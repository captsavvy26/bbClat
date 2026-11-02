import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase-admin'

function fmtTime(sec: number | null) {
  if (sec == null) return '-'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}m ${s}s`
}

async function sectionRank(sectionId: string, score: number) {
  const base = () =>
    supabaseAdmin
      .from('attempt_sections')
      .select('attempt_id, attempts!inner(counts_for_rank)', { count: 'exact', head: true })
      .eq('section_id', sectionId)
      .eq('attempts.counts_for_rank', true)
  const [h, t] = await Promise.all([base().gt('score', score), base()])
  return { higher: h.count ?? 0, total: t.count ?? 0 }
}

async function Result({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: attemptRaw } = await supabaseAdmin
    .from('attempts')
    .select('*, papers(title, exam, year, total_marks)')
    .eq('id', id)
    .single()
  const attempt: any = attemptRaw
  if (!attempt) notFound()
  const paper: any = Array.isArray(attempt.papers) ? attempt.papers[0] : attempt.papers

  // Overall rank
  const rankBase = () =>
    supabaseAdmin
      .from('attempts')
      .select('id', { count: 'exact', head: true })
      .eq('paper_id', attempt.paper_id)
      .eq('counts_for_rank', true)
  const [hi, lo, all] = await Promise.all([
    rankBase().gt('score', attempt.score),
    rankBase().lt('score', attempt.score),
    rankBase(),
  ])
  const rank = (hi.count ?? 0) + 1
  const totalRanked = all.count ?? 0
  const outOf = totalRanked + (attempt.counts_for_rank ? 0 : 1)
  const percentile = totalRanked > 0 ? Math.round(((lo.count ?? 0) / totalRanked) * 1000) / 10 : 0

  // Sections
  const { data: secRaw } = await supabaseAdmin
    .from('attempt_sections')
    .select('section_id, score, correct, wrong, skipped, sections(name, position)')
    .eq('attempt_id', id)
  const sections: any[] = ((secRaw as any[]) ?? []).map((s) => ({
    ...s,
    sec: Array.isArray(s.sections) ? s.sections[0] : s.sections,
  }))
  sections.sort((a, b) => (a.sec?.position ?? 0) - (b.sec?.position ?? 0))
  const secRanks = await Promise.all(sections.map((s) => sectionRank(s.section_id, Number(s.score))))

  // Review
  const { data: qsRaw } = await supabaseAdmin
    .from('questions')
    .select(
      'id, section_id, position, passage, question_text, option_a, option_b, option_c, option_d, marks, answer_keys(correct_option, explanation)'
    )
    .eq('paper_id', attempt.paper_id)
    .order('position')
  const { data: ansRaw } = await supabaseAdmin
    .from('attempt_answers')
    .select('question_id, selected_option, is_correct')
    .eq('attempt_id', id)
  const questions: any[] = (qsRaw as any[]) ?? []
  const answerMap = new Map<string, any>(((ansRaw as any[]) ?? []).map((a) => [a.question_id, a]))

  const attempted = attempt.correct + attempt.wrong
  const accuracy = attempted > 0 ? Math.round((attempt.correct / attempted) * 100) : 0

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/" className="text-sm text-blue-600">← All papers</Link>
      <h1 className="mt-2 text-2xl font-bold">{paper?.title}</h1>
      <p className="text-sm text-gray-600">Your result</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-600">Score</div>
          <div className="text-2xl font-bold">{Number(attempt.score).toFixed(2)}</div>
          <div className="text-xs text-gray-500">out of {paper?.total_marks}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-600">Rank</div>
          <div className="text-2xl font-bold">{rank}</div>
          <div className="text-xs text-gray-500">out of {outOf}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-600">Percentile</div>
          <div className="text-2xl font-bold">{percentile}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-600">Accuracy</div>
          <div className="text-2xl font-bold">{accuracy}%</div>
          <div className="text-xs text-gray-500">Time: {fmtTime(attempt.time_taken_seconds)}</div>
        </div>
      </div>

      {!attempt.counts_for_rank && (
        <p className="mt-3 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
          This was not your first attempt on this paper, so it is not counted in the leaderboard. The rank above shows where this score would stand.
        </p>
      )}

      <div className="mt-4 flex gap-6 text-sm">
        <span className="text-green-700">Correct: {attempt.correct}</span>
        <span className="text-red-700">Wrong: {attempt.wrong}</span>
        <span className="text-gray-600">Skipped: {attempt.skipped}</span>
      </div>

      <h2 className="mb-3 mt-8 text-xl font-semibold">Section-wise analysis</h2>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="p-3">Section</th>
              <th className="p-3">Score</th>
              <th className="p-3">Correct</th>
              <th className="p-3">Wrong</th>
              <th className="p-3">Skipped</th>
              <th className="p-3">Rank</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((s, i) => (
              <tr key={s.section_id} className="border-t">
                <td className="p-3 font-medium">{s.sec?.name}</td>
                <td className="p-3">{Number(s.score).toFixed(2)}</td>
                <td className="p-3">{s.correct}</td>
                <td className="p-3">{s.wrong}</td>
                <td className="p-3">{s.skipped}</td>
                <td className="p-3">
                  {secRanks[i].higher + 1} / {secRanks[i].total + (attempt.counts_for_rank ? 0 : 1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-3 mt-8 text-xl font-semibold">Review answers</h2>
      <div className="space-y-6">
        {questions.map((q, idx) => {
          const a = answerMap.get(q.id)
          const key = Array.isArray(q.answer_keys) ? q.answer_keys[0] : q.answer_keys
          const selected = a?.selected_option as string | null | undefined
          const correct = key?.correct_option as string | undefined
          const opts: [string, string][] = [
            ['A', q.option_a], ['B', q.option_b], ['C', q.option_c], ['D', q.option_d],
          ]
          return (
            <div key={q.id} className="rounded-xl border p-4">
              <div className="mb-2 text-sm text-gray-500">
                Q{idx + 1} · {!selected ? 'Skipped' : a?.is_correct ? 'Correct' : 'Wrong'}
              </div>
              {q.passage && (
                <details className="mb-3 rounded-lg bg-gray-50 p-3 text-sm">
                  <summary className="cursor-pointer font-medium">Show passage</summary>
                  <p className="mt-2 whitespace-pre-wrap">{q.passage}</p>
                </details>
              )}
              <p className="mb-3 whitespace-pre-wrap font-medium">{q.question_text}</p>
              <div className="space-y-2">
                {opts.map(([letter, text]) => {
                  let style = 'border'
                  if (letter === correct) style = 'border-green-600 bg-green-400'
                  else if (letter === selected) style = 'border-red-600 bg-red-300'
                  return (
                    <div key={letter} className={`rounded-lg p-2 text-sm ${style}`}>
                      <span className="mr-2 font-semibold">{letter}.</span>
                      {text}
                      {letter === selected && <span className="ml-2 text-xs">(your answer)</span>}
                      {letter === correct && <span className="ml-2 text-xs">(correct)</span>}
                    </div>
                  )
                })}
              </div>
              {key?.explanation && (
                <p className="mt-3 text-sm text-gray-700">
                  <span className="font-semibold">Explanation: </span>
                  {key.explanation}
                </p>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-8">
        <Link href="/" className="rounded-lg bg-blue-600 px-5 py-3 text-white">
          Try another paper
        </Link>
      </div>
    </main>
  )
}

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="p-6">Loading your result...</p>}>
      <Result params={params} />
    </Suspense>
  )
}