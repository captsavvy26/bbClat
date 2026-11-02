import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold text-blue-700">
          bbClat
        </Link>
        <nav className="flex gap-4 text-sm text-gray-700">
          <Link href="/" className="hover:text-blue-700">Papers</Link>
          <Link href="/faq" className="hover:text-blue-700">FAQ</Link>
          <Link href="/about" className="hover:text-blue-700">About</Link>
        </nav>
      </div>
    </header>
  )
}