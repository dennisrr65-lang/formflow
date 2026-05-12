import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 text-center">
      <div>
        <div className="text-6xl mb-4">🌊</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-sm text-gray-500 mb-6">This form doesn&apos;t exist or has been unpublished.</p>
        <Link href="/" className="text-sm text-blue-600 hover:underline">← Back to FormFlow</Link>
      </div>
    </div>
  )
}
