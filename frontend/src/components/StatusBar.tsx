import type { SearchStatus } from '../hooks/useSearchStream'

interface Props {
  cardCount: number
  status: SearchStatus
}

export function StatusBar({ cardCount, status }: Props) {
  if (cardCount === 0 && status !== 'done') return null

  return (
    <div className="px-6 py-3 flex justify-end">
      <span className="text-xs text-muted">
        {cardCount} lead{cardCount !== 1 ? 's' : ''} found
      </span>
    </div>
  )
}
