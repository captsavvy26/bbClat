import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'About bbClat, a free practice platform for CLAT, AILET and SLAT aspirants.',
}

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">About bbClat</h1>
      <p className="mt-4 text-gray-700">
        bbClat is a free practice platform for law entrance aspirants. You can attempt past year
        papers of CLAT, AILET and SLAT in a timed test, then see your marks, section-wise analysis
        and rank, with no login needed.
      </p>

      <h2 className="mt-8 text-xl font-semibold">What you get</h2>
      <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
        <li>Full-length past year papers in an exam-style test screen</li>
        <li>Instant marks, accuracy, correct, wrong and skipped counts</li>
        <li>Section-wise scores to find your strong and weak areas</li>
        <li>Overall and sectional rank among bbClat users</li>
        <li>Answer review for every question</li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold">Disclaimer</h2>
      <p className="mt-2 text-gray-700">
        bbClat is an independent project. It is not affiliated with, endorsed by, or connected to
        the CLAT Consortium of NLUs, NLU Delhi (AILET) or Symbiosis International (SLAT). Question
        papers belong to their respective owners and are used here for practice. Ranks compare you
        only with other bbClat users and do not predict your real exam rank. If you are a rights
        holder and want a paper removed or corrected, please contact us.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Contact</h2>
      <p className="mt-2 text-gray-700">
        Found a mistake in a question or answer, or want to give feedback? Email{' '}
        <a href="mailto:ccaptainsavvy@gmail.com" className="text-blue-600 underline">
          ccaptainsavvy@gmail.com
        </a>
        .
      </p>
    </main>
  )
}