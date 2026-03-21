import type { LeadType } from '../types'

const CATEGORIES: { type: LeadType; icon: string; label: string }[] = [
  { type: 'person', icon: '👤', label: 'People' },
  { type: 'community', icon: '🤝', label: 'Communities' },
  { type: 'event', icon: '📅', label: 'Events' },
  { type: 'company', icon: '🏢', label: 'Companies' },
  { type: 'resource', icon: '📚', label: 'Resources' },
]

interface Props {
  activeCategory: LeadType | null
  categoryCounts: Record<LeadType, number>
  onSelectCategory: (type: LeadType | null) => void
  onNewSearch: () => void
}

export function Sidebar({ activeCategory, categoryCounts, onSelectCategory, onNewSearch }: Props) {
  const total = Object.values(categoryCounts).reduce((a, b) => a + b, 0)

  return (
    <aside className="w-sidebar flex-shrink-0 bg-primary-50 border-r border-border-warm h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto hidden lg:flex flex-col">
      <div className="p-4 flex-1">
        {/* Section label */}
        <p className="text-[10px] font-semibold uppercase tracking-widest text-sage mb-3 px-3">
          Search Intelligence
        </p>

        {/* All results */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all mb-1 ${
            activeCategory === null
              ? 'bg-white text-ink shadow-card'
              : 'text-muted hover:text-ink hover:bg-white/50'
          }`}
        >
          <span>All Results</span>
          {total > 0 && (
            <span className="text-xs text-muted">{total}</span>
          )}
        </button>

        {/* Category nav */}
        <div className="space-y-0.5">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.type]
            return (
              <button
                key={cat.type}
                onClick={() => onSelectCategory(cat.type)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                  activeCategory === cat.type
                    ? 'bg-white text-ink font-medium shadow-card'
                    : 'text-muted hover:text-ink hover:bg-white/50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{cat.icon}</span>
                  {cat.label}
                </span>
                {count > 0 && (
                  <span className="text-xs text-muted bg-white/60 px-1.5 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-border-warm my-4" />

        {/* New Search */}
        <button
          onClick={onNewSearch}
          className="w-full bg-terra-cta text-white font-semibold py-2.5 rounded-lg shadow-glow hover:bg-primary-800 transition-colors text-sm"
        >
          New Search
        </button>
      </div>

      {/* Footer links */}
      <div className="p-4 border-t border-border-warm">
        <p className="text-[10px] text-sage text-center">
          Powered by Claude AI + Web Search
        </p>
      </div>
    </aside>
  )
}
