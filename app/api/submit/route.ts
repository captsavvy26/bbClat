import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const VALID = ['A', 'B', 'C', 'D']

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const { paperId, anonId, answers, timeTaken } = body ?? {}
  if (typeof paperId !== 'string' || typeof anonId !== 'string' || anonId.length < 10 || anonId.length > 100) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }

  const { data: paper } = await supabaseAdmin
    .from('papers')
    .select('id, negative_mark, is_published')
    .eq('id', paperId)
    .single()
  if (!paper || !paper.is_published) {
    return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
  }

  const { data: questions, error: qErr } = await supabaseAdmin
    .from('questions')
    .select('id, section_id, marks, answer_keys(correct_option)')
    .eq('paper_id', paperId)
  if (qErr || !questions) {
    return NextResponse.json({ error: 'Could not load questions' }, { status: 500 })
  }

  const neg = Number(paper.negative_mark)
  let score = 0, correct = 0, wrong = 0, skipped = 0
  const secMap = new Map<string, { score: number; correct: number; wrong: number; skipped: number }>()
  const answerRows: { question_id: string; selected_option: string | null; is_correct: boolean | null }[] = []

  for (const q of questions as any[]) {
    const sel = answers?.[q.id]
    const selected = typeof sel === 'string' && VALID.includes(sel) ? sel : null
    const keyRow = Array.isArray(q.answer_keys) ? q.answer_keys[0] : q.answer_keys
    const sec = secMap.get(q.section_id) ?? { score: 0, correct: 0, wrong: 0, skipped: 0 }
    let isCorrect: boolean | null = null

    if (!selected) {
      skipped++; sec.skipped++
    } else if (selected === keyRow?.correct_option) {
      isCorrect = true
      correct++; sec.correct++
      score += Number(q.marks); sec.score += Number(q.marks)
    } else {
      isCorrect = false
      wrong++; sec.wrong++
      score -= neg; sec.score -= neg
    }
    secMap.set(q.section_id, sec)
    answerRows.push({ question_id: q.id, selected_option: selected, is_correct: isCorrect })
  }

  // Only a person's first attempt on a paper counts for rank
  const { count } = await supabaseAdmin
    .from('attempts')
    .select('id', { count: 'exact', head: true })
    .eq('paper_id', paperId)
    .eq('anon_id', anonId)

  const { data: attempt, error: aErr } = await supabaseAdmin
    .from('attempts')
    .insert({
      paper_id: paperId,
      anon_id: anonId,
      score,
      correct,
      wrong,
      skipped,
      time_taken_seconds: Number.isFinite(timeTaken) ? Math.max(0, Math.round(timeTaken)) : null,
      counts_for_rank: (count ?? 0) === 0,
    })
    .select('id')
    .single()
  if (aErr || !attempt) {
    return NextResponse.json({ error: 'Could not save attempt' }, { status: 500 })
  }

  const { error: e1 } = await supabaseAdmin
    .from('attempt_answers')
    .insert(answerRows.map((r) => ({ ...r, attempt_id: attempt.id })))
  const { error: e2 } = await supabaseAdmin
    .from('attempt_sections')
    .insert(Array.from(secMap.entries()).map(([section_id, s]) => ({ ...s, section_id, attempt_id: attempt.id })))

  if (e1 || e2) {
    await supabaseAdmin.from('attempts').delete().eq('id', attempt.id)
    return NextResponse.json({ error: 'Could not save answers' }, { status: 500 })
  }

  return NextResponse.json({ attemptId: attempt.id })
}