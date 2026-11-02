import { Suspense } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

async function PaperList() {
  const { data: papers, error } = await supabase
    .from('papers')
    .select('id, exam, year, title, duration_minutes, total_marks')
    .order('year', { ascending: false })

  if (error) return <p className="text-red-600">Could not load papers: {error.message}</p>
  if (!papers || papers.length === 0) return <p>No papers yet. Check back soon.</p>

  const exams = ['CLAT', 'AILET', 'SLAT']

  return (
    <div className="space-y-10">
      {exams.map((exam) => {
        const list = papers.filter((p) => p.exam === exam)
        if (list.length === 0) return null
        return (
          <section key={exam}>
            <h2 className="mb-4 text-2xl font-semibold">{exam} Past Year Papers</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {list.map((p) => (
                <Link
                  key={p.id}
                  href={`/test/${p.id}`}
                  className="rounded-xl border p-5 transition hover:shadow-md"
                >
                  <div className="text-lg font-medium">{p.title}</div>
                  <div className="mt-1 text-sm text-gray-600">
                    {p.year} · {p.duration_minutes} min · {p.total_marks} marks
                  </div>
                  <div className="mt-3 text-sm font-medium text-blue-600">Start test →</div>
                </Link>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <section className="mb-12 rounded-2xl bg-blue-50 p-6 sm:p-10">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Free CLAT, AILET &amp; SLAT past year papers
        </h1>
        <p className="mt-3 max-w-2xl text-gray-700">
          Attempt real papers in a timed test, then see your marks, section-wise analysis and rank.
          No login needed.
        </p>
        <div className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="font-semibold">1. Pick a paper</div>
            <div className="mt-1 text-gray-600">Choose CLAT, AILET or SLAT below.</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="font-semibold">2. Take the test</div>
            <div className="mt-1 text-gray-600">Timed, exam-style screen with a question palette.</div>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm">
            <div className="font-semibold">3. Get your analysis</div>
            <div className="mt-1 text-gray-600">Marks, rank, section scores and answer review.</div>
          </div>
        </div>
      </section>

      <Suspense fallback={<p>Loading papers...</p>}>
        <PaperList />
      </Suspense>
    </main>
  )
}