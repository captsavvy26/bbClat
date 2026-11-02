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
      <h1 className="text-4xl font-bold">bbClat</h1>
      <p className="mb-10 mt-2 text-gray-600">
        Free CLAT, AILET and SLAT past year papers. No login needed.
      </p>
      <Suspense fallback={<p>Loading papers...</p>}>
        <PaperList />
      </Suspense>
    </main>
  )
}