import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Answers about bbClat: free past year papers, ranks, marking and privacy.',
}

const faqs = [
  {
    q: 'Is bbClat really free? Do I need to log in?',
    a: 'Yes, it is free, and you do not need an account. Open a paper, take the test, and see your result.',
  },
  {
    q: 'Which exams and papers are available?',
    a: 'Past year papers of CLAT, AILET and SLAT. We add more papers over time, so check back regularly.',
  },
  {
    q: 'How is my score calculated?',
    a: 'Each correct answer earns the marks shown for that question. If a paper has negative marking, a deduction is applied for each wrong answer. Skipped questions get zero. The marking scheme is shown on each paper.',
  },
  {
    q: 'How is my rank decided?',
    a: 'Your rank is based on your marks compared with everyone else who attempted the same paper on bbClat. You also get a rank for each section, so you can see where you are strong or weak.',
  },
  {
    q: 'Is this the same as my rank in the real exam?',
    a: 'No. These ranks only compare you with other bbClat users, who may be fewer or different from real exam takers. Treat them as a practice guide, not a prediction of your real rank.',
  },
  {
    q: 'Why does my second attempt say it is not counted in the leaderboard?',
    a: 'Only your first attempt on a paper counts toward ranks. That keeps the leaderboard fair. You can still retake any paper to practise and see your analysis.',
  },
  {
    q: 'What happens if I refresh the page or lose my connection during a test?',
    a: 'Your answers and timer are saved in your browser, so a refresh will not lose your progress. Use the same browser and device to continue.',
  },
  {
    q: 'Can I take the test on my phone?',
    a: 'Yes. The site works on phones, tablets and computers.',
  },
  {
    q: 'I think an answer or a question is wrong. What should I do?',
    a: 'Mistakes can happen when papers are typed in. Please tell us the paper name and question number through the contact details on the About page, and we will check it.',
  },
  {
    q: 'What data do you collect?',
    a: 'We store your test attempts using a random ID created in your browser. We do not ask for your name, email or phone number. See the Privacy page for details.',
  },
]

export default function FaqPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Frequently asked questions</h1>
      <p className="mb-8 mt-2 text-gray-600">Quick answers about how bbClat works.</p>
      <div className="divide-y rounded-xl border">
        {faqs.map((f) => (
          <details key={f.q} className="group p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
              {f.q}
              <span className="ml-4 text-xl text-blue-600 transition group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-gray-700">{f.a}</p>
          </details>
        ))}
      </div>
    </main>
  )
}