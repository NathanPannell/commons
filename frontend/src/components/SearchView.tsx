import { useState } from 'react'
import type { LeadCard, LeadType, ProfileSummary } from '../types'
import type { SearchStatus } from '../hooks/useSearchStream'
import { LeadCardComponent, LEAD_TYPE_CONFIG } from './LeadCardComponent'
import { StatusBar } from './StatusBar'
import { Sidebar } from './Sidebar'

const CATEGORY_ORDER: LeadType[] = ['person', 'event', 'community', 'company', 'resource']

interface Props {
  profile: ProfileSummary
  cards: LeadCard[]
  statusMessage: string
  status: SearchStatus
  error: string | null
  onReset: () => void
}

export function SearchView({ profile, cards, statusMessage, status, error, onReset }: Props) {
  const [activeCategory, setActiveCategory] = useState<LeadType | null>(null)

  const grouped = CATEGORY_ORDER.reduce<Record<LeadType, LeadCard[]>>(
    (acc, type) => {
      acc[type] = cards.filter((c) => c.lead_type === type)
      return acc
    },
    { event: [], person: [], community: [], company: [], resource: [] },
  )

  const categoryCounts: Record<LeadType, number> = {
    event: grouped.event.length,
    person: grouped.person.length,
    community: grouped.community.length,
    company: grouped.company.length,
    resource: grouped.resource.length,
  }

  const visibleCategories = activeCategory
    ? CATEGORY_ORDER.filter((t) => t === activeCategory)
    : CATEGORY_ORDER

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      {/* Sidebar */}
      <Sidebar
        activeCategory={activeCategory}
        categoryCounts={categoryCounts}
        onSelectCategory={setActiveCategory}
        onNewSearch={onReset}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <StatusBar message={statusMessage} status={status} cardCount={cards.length} />

        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Profile context bar */}
          <div className="bg-white border border-border-warm rounded-xl px-5 py-4 mb-8 flex items-center justify-between gap-4 shadow-card animate-fade-in">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary-200 border-2 border-border-warm flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary-800">
                  {(profile.name ?? 'U')[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-ink">
                  {profile.name ?? 'Your profile'}
                </p>
                <p className="text-sm text-muted mt-0.5">
                  {profile.target_roles.slice(0, 2).join(', ')}
                  {profile.locations.length > 0 && ` · ${profile.locations[0]}`}
                </p>
              </div>
            </div>
            <button
              onClick={onReset}
              className="text-sm text-sage hover:text-ink transition-colors whitespace-nowrap lg:hidden"
            >
              New search
            </button>
          </div>

          {/* Error banner */}
          {error && (
            <div className="bg-error-50 border border-error-100 text-error-700 rounded-lg px-4 py-3 mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Empty state while loading */}
          {cards.length === 0 && status === 'searching' && (
            <div className="text-center py-24 text-muted animate-fade-in">
              <div className="w-12 h-12 border-3 border-terra-cta border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-display text-xl font-medium text-ink">Searching the web for leads...</p>
              <p className="text-sm mt-2 text-muted">{statusMessage}</p>
            </div>
          )}

          {/* Category sections */}
          {visibleCategories.map((type) => {
            const typeCards = grouped[type]
            if (typeCards.length === 0) return null
            const config = LEAD_TYPE_CONFIG[type]

            return (
              <section key={type} className="mb-10 animate-fade-in-up">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-sage">
                    <span className="text-base">{config.icon}</span>
                    {type === 'person' ? 'Top Matches' :
                     type === 'event' ? 'Relevant Events' :
                     type === 'community' ? 'Communities' :
                     type === 'company' ? 'Companies' :
                     'Intelligence Library'}
                  </h2>
                  <span className="text-xs text-muted">
                    {typeCards.length} found
                  </span>
                </div>

                {/* Different grid layouts per category */}
                {type === 'person' ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {typeCards.map((card) => (
                      <LeadCardComponent key={card.id} card={card} profile={profile} />
                    ))}
                  </div>
                ) : type === 'event' ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {typeCards.map((card) => (
                      <LeadCardComponent key={card.id} card={card} profile={profile} />
                    ))}
                  </div>
                ) : type === 'community' ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {typeCards.map((card) => (
                      <LeadCardComponent key={card.id} card={card} profile={profile} />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {typeCards.map((card) => (
                      <LeadCardComponent key={card.id} card={card} profile={profile} />
                    ))}
                  </div>
                )}
              </section>
            )
          })}

          {/* Done state with no results */}
          {status === 'done' && cards.length === 0 && (
            <div className="text-center py-24 text-muted animate-fade-in">
              <p className="font-display text-xl font-medium text-ink mb-2">No verified leads found</p>
              <p className="text-sm">Try adding more details to your profile.</p>
              <button
                onClick={onReset}
                className="mt-4 px-5 py-2.5 bg-terra-cta text-white font-semibold rounded-lg shadow-glow hover:bg-primary-800 transition-all text-sm"
              >
                Start new search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
