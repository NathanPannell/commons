import { useEffect } from 'react'
import type { LeadCard, ProfileSummary } from '../types'
import { useFindPeople } from '../hooks/useFindPeople'
import { LeadCardComponent } from './LeadCardComponent'

interface Props {
  eventCard: LeadCard
  profile: ProfileSummary
  onClose: () => void
}

export function FindPeopleModal({ eventCard, profile, onClose }: Props) {
  const { cards, statusMessage, status, error, startSearch } = useFindPeople()

  useEffect(() => {
    void startSearch(eventCard, profile)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isSearching = status === 'searching'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-modal w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-warm flex items-start justify-between gap-4 flex-shrink-0">
          <div>
            <h2 className="text-lg font-display font-bold text-ink">People at this event</h2>
            <p className="text-sm text-muted mt-0.5 line-clamp-1">{eventCard.title}</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-ink transition-colors mt-0.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status bar */}
        <div className="px-6 py-3 border-b border-border-warm flex items-center gap-2.5 flex-shrink-0 bg-primary-50">
          {isSearching && (
            <div className="w-3.5 h-3.5 border-2 border-terra-cta border-t-transparent rounded-full animate-spin flex-shrink-0" />
          )}
          {status === 'done' && cards.length > 0 && (
            <span className="text-terra-cta">✓</span>
          )}
          <span className="text-sm text-muted">{statusMessage}</span>
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {error && (
            <div className="bg-error-50 border border-error-100 text-error-700 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {cards.length === 0 && isSearching && (
            <div className="text-center py-16 text-muted">
              <div className="w-8 h-8 border-2 border-terra-cta border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm">Fetching event page and finding speakers...</p>
            </div>
          )}

          {cards.length === 0 && status === 'done' && !error && (
            <div className="text-center py-16 text-muted">
              <p className="text-sm">No speakers or organizers found with public profiles.</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {cards.map((card) => (
              <LeadCardComponent key={card.id} card={card} profile={profile} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
