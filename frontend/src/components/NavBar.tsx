interface Props {
  currentScreen?: string
  onNavigate?: (screen: string) => void
}

export function NavBar({ currentScreen, onNavigate }: Props) {
  const links = [
    { id: 'intake', label: 'Dashboard' },
    { id: 'search', label: 'Network' },
  ]

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-border-warm">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <span className="font-display font-bold text-lg tracking-tight text-primary-900">
            BridgeIn
          </span>

          {/* Nav links */}
          <nav className="hidden sm:flex items-center gap-1">
            {links.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigate?.(link.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  currentScreen === link.id
                    ? 'text-terra-cta'
                    : 'text-muted hover:text-ink'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right side — avatar placeholder */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-200 border-2 border-border-warm flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  )
}
