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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">People at this event</h2>
            <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{eventCard.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors mt-0.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status bar */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-2.5 flex-shrink-0">
          {isSearching && (
            <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          )}
          {status === 'done' && cards.length > 0 && (
            <span className="text-green-500">✓</span>
          )}
          <span className="text-sm text-gray-600">{statusMessage}</span>
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          {cards.length === 0 && isSearching && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-3xl mb-3">🔍</div>
              <p className="text-sm">Fetching event page and finding speakers...</p>
            </div>
          )}

          {cards.length === 0 && status === 'done' && !error && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-3xl mb-3">😕</div>
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
