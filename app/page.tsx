import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="font-semibold text-gray-900">FormFlow</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          Powered by Claude AI
        </div>
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
          Create any form in seconds<br />
          <span className="text-blue-600">just by describing it</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          Type what you need. FormFlow&apos;s AI instantly generates a complete form with the right fields, validation, and logic — ready to publish and share.
        </p>

        {/* Demo prompt input */}
        <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-sm max-w-2xl mx-auto flex gap-2 mb-4">
          <input
            type="text"
            readOnly
            value="I need a job application form for a marketing role"
            className="flex-1 px-4 py-3 text-gray-700 bg-transparent outline-none text-sm"
          />
          <Link
            href="/signup"
            className="bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            Generate form →
          </Link>
        </div>
        <p className="text-xs text-gray-400">No credit card required · Free plan includes 3 forms</p>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: '⚡',
            title: 'AI-generated in seconds',
            description: 'Describe your form in plain English and Claude generates every field, label, and validation rule instantly.',
          },
          {
            icon: '✏️',
            title: 'Easy to customize',
            description: 'Drag to reorder fields, edit labels, choose themes, and toggle required fields — all with a clean visual editor.',
          },
          {
            icon: '📊',
            title: 'Smart response analysis',
            description: 'Collect submissions and get AI-powered summaries that surface patterns and insights automatically.',
          },
        ].map((f) => (
          <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="text-2xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
          </div>
        ))}
      </section>

      {/* Pricing preview */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">Simple pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Free</div>
            <div className="text-3xl font-bold text-gray-900 mb-4">$0</div>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              {['3 forms', '50 responses/month', 'AI form generation', 'Shareable links'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block text-center border border-gray-300 rounded-lg py-2 text-sm font-medium hover:border-gray-400 transition-colors">
              Get started
            </Link>
          </div>
          <div className="bg-blue-600 rounded-2xl p-6 text-white">
            <div className="text-sm font-medium text-blue-200 mb-1">Pro</div>
            <div className="text-3xl font-bold mb-4">$15<span className="text-lg font-normal text-blue-200">/mo</span></div>
            <ul className="space-y-2 text-sm text-blue-100 mb-6">
              {['Unlimited forms', 'Unlimited responses', 'AI response summaries', 'CSV export', 'Priority support'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-blue-300">✓</span> {f}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block text-center bg-white text-blue-600 rounded-lg py-2 text-sm font-medium hover:bg-blue-50 transition-colors">
              Start free trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 text-center text-xs text-gray-400">
        © 2025 FormFlow. Built with Next.js and Claude AI.
      </footer>
    </main>
  )
}
