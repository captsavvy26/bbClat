import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-gray-600">
        <div className="mb-3 flex flex-wrap gap-4">
          <Link href="/faq" className="hover:text-blue-700">FAQ</Link>
          <Link href="/about" className="hover:text-blue-700">About</Link>
          <Link href="/privacy" className="hover:text-blue-700">Privacy</Link>
        </div>
        <p>
          bbClat is an independent practice platform and is not affiliated with the CLAT Consortium,
          NLU Delhi (AILET) or Symbiosis (SLAT). Exam names belong to their respective owners.
        </p>
        <p className="mt-2">© 2026 bbClat</p>
      </div>
    </footer>
  )
}