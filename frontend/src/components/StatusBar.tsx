import type { SearchStatus } from '../hooks/useSearchStream'

interface Props {
  message: string
  status: SearchStatus
  cardCount: number
}

export function StatusBar({ message, status, cardCount }: Props) {
  const isSearching = status === 'searching'

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-border-warm px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isSearching && (
          <div className="w-4 h-4 border-2 border-terra-cta border-t-transparent rounded-full animate-spin" />
        )}
        {status === 'done' && (
          <div className="w-4 h-4 rounded-full bg-terra-cta flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        <span className="text-sm text-ink font-medium">{message || 'Ready'}</span>
      </div>
      {cardCount > 0 && (
        <span className="text-sm text-muted">
          {cardCount} lead{cardCount !== 1 ? 's' : ''} found
        </span>
      )}
    </div>
  )
}
