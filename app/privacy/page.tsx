import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How bbClat handles your data.',
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: November 2026</p>

      <h2 className="mt-8 text-xl font-semibold">What we collect</h2>
      <p className="mt-2 text-gray-700">
        You do not need an account to use bbClat, and we do not ask for your name, email or phone
        number. When you take a test, we store your answers, score, time taken and the paper you
        attempted. These are linked to a random ID generated in your browser, not to your identity.
      </p>

      <h2 className="mt-8 text-xl font-semibold">What is saved in your browser</h2>
      <p className="mt-2 text-gray-700">
        We save a random ID and your in-progress test (answers, marked questions and timer) in your
        browser&apos;s local storage so that a refresh does not lose your progress. You can clear this
        by clearing your browser&apos;s site data. Clearing it will also reset your anonymous ID.
      </p>

      <h2 className="mt-8 text-xl font-semibold">How we use the data</h2>
      <p className="mt-2 text-gray-700">
        To calculate your result, show your analysis, and compute ranks and percentiles among users
        of the same paper. We do not sell your data.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Services we use</h2>
      <p className="mt-2 text-gray-700">
        Our website is hosted on Vercel and our data is stored with Supabase. These providers
        process technical data (such as your IP address) as part of running the service.
      </p>

      <h2 className="mt-8 text-xl font-semibold">Contact</h2>
      <p className="mt-2 text-gray-700">
        For questions or to request deletion of an attempt, email{' '}
        <a href="mailto:ccaptainsavvy@gmail.com" className="text-blue-600 underline">
          ccaptainsavvy@gmail.com
        </a>{' '}
        with the link to your result page.
      </p>
    </main>
  )
}