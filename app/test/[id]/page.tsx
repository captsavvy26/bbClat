import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import TestClient from './TestClient'

async function Loader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: paper } = await supabase
    .from('papers')
    .select('id, title, duration_minutes, total_marks, negative_mark')
    .eq('id', id)
    .single()
  if (!paper) notFound()

  const { data: sections } = await supabase
    .from('sections')
    .select('id, name, position')
    .eq('paper_id', id)
    .order('position')

  const { data: questions } = await supabase
    .from('questions')
    .select('id, section_id, position, passage, question_text, option_a, option_b, option_c, option_d, marks')
    .eq('paper_id', id)
    .order('position')

  return <TestClient paper={paper} sections={sections ?? []} questions={questions ?? []} />
}

export default function TestPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="p-6">Loading test...</p>}>
      <Loader params={params} />
    </Suspense>
  )
}