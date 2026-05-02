const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#pricing', label: 'Pricing' },
]

export function Navbar() {
  return (
    <nav
      aria-label="Main navigation"
      className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto"
    >
      <div className="text-white text-2xl font-bold">My Assistant</div>
      <div className="flex gap-6">
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-gray-300 hover:text-white transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
