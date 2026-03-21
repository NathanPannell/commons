import type { LeadCard, LeadType, ProfileSummary } from '../types'
import type { SearchStatus } from '../hooks/useSearchStream'
import { LeadCardComponent, LEAD_TYPE_CONFIG } from './LeadCardComponent'
import { StatusBar } from './StatusBar'

const CATEGORY_ORDER: LeadType[] = ['event', 'person', 'community', 'company', 'resource']

interface Props {
  profile: ProfileSummary
  cards: LeadCard[]
  statusMessage: string
  status: SearchStatus
  error: string | null
  onReset: () => void
}

export function SearchView({ profile, cards, statusMessage, status, error, onReset }: Props) {
  const grouped = CATEGORY_ORDER.reduce<Record<LeadType, LeadCard[]>>(
    (acc, type) => {
      acc[type] = cards.filter((c) => c.lead_type === type)
      return acc
    },
    { event: [], person: [], community: [], company: [], resource: [] },
  )

  return (
    <div className="min-h-screen bg-surface">
      <StatusBar message={statusMessage} status={status} cardCount={cards.length} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile summary bar */}
        <div className="bg-white border border-border-warm rounded-md px-5 py-4 mb-8 flex items-center justify-between gap-4 shadow-card">
          <div>
            <p className="font-semibold text-ink">
              {profile.name ?? 'Your profile'}
            </p>
            <p className="text-sm text-muted mt-0.5">
              {profile.target_roles.slice(0, 2).join(', ')}
              {profile.locations.length > 0 && ` · ${profile.locations[0]}`}
            </p>
          </div>
          <button
            onClick={onReset}
            className="text-sm text-sage hover:text-ink transition-colors whitespace-nowrap"
          >
            ← New search
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-error-50 border border-error-100 text-error-700 rounded-md px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Empty state while loading */}
        {cards.length === 0 && status === 'searching' && (
          <div className="text-center py-20 text-muted">
            <div className="text-4xl mb-3">🔍</div>
            <p className="font-display text-lg font-medium">Searching the web for leads...</p>
            <p className="text-sm mt-1">{statusMessage}</p>
          </div>
        )}

        {/* Category sections */}
        {CATEGORY_ORDER.map((type) => {
          const typeCards = grouped[type]
          if (typeCards.length === 0) return null
          const config = LEAD_TYPE_CONFIG[type]
          return (
            <section key={type} className="mb-10">
              <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sage mb-4">
                <span>{config.icon}</span>
                {config.label}s
                <span className="ml-auto text-xs font-normal normal-case text-muted">
                  {typeCards.length} found
                </span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {typeCards.map((card) => (
                  <LeadCardComponent key={card.id} card={card} profile={profile} />
                ))}
              </div>
            </section>
          )
        })}

        {/* Done state with no results */}
        {status === 'done' && cards.length === 0 && (
          <div className="text-center py-20 text-muted">
            <div className="text-4xl mb-3">😕</div>
            <p className="font-display text-lg font-medium">No verified leads found</p>
            <p className="text-sm mt-1">Try adding more details to your profile.</p>
          </div>
        )}
      </div>
    </div>
  )
}
