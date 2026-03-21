import type { LeadType } from '../types'
import type { AgentRunStatus, SearchStatus } from '../hooks/useSearchStream'

interface Props {
  message: string
  status: SearchStatus
  cardCount: number
  agentStatuses: Record<LeadType, AgentRunStatus>
}

const CATEGORY_PILLS: { type: LeadType; icon: string; label: string }[] = [
  { type: 'event',     icon: '📅', label: 'Events' },
  { type: 'person',    icon: '👤', label: 'People' },
  { type: 'community', icon: '🤝', label: 'Communities' },
  { type: 'company',   icon: '🏢', label: 'Companies' },
  { type: 'resource',  icon: '📚', label: 'Resources' },
]

function AgentStatusDot({ status }: { status: AgentRunStatus }) {
  if (status === 'idle') {
    return <span className="w-1.5 h-1.5 rounded-full bg-muted/30 inline-block" />
  }
  if (status === 'running') {
    return <span className="w-1.5 h-1.5 rounded-full bg-terra-cta animate-pulse inline-block" />
  }
  if (status === 'done') {
    return (
      <svg className="w-3 h-3 text-terra-cta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    )
  }
  return <span className="w-1.5 h-1.5 rounded-full bg-error-700 inline-block" />
}

export function StatusBar({ message, status, cardCount, agentStatuses }: Props) {
  const isSearching = status === 'searching'
  const showPills = status === 'searching' || status === 'done'

  return (
    <div className="sticky top-14 z-10 bg-white/90 backdrop-blur-sm border-b border-border-warm px-6 py-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isSearching && (
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-terra-cta border-t-transparent rounded-full animate-spin" />
              {/* Progress shimmer */}
              <div className="w-24 h-1.5 bg-border-warm rounded-full overflow-hidden">
                <div className="h-full w-1/2 bg-terra-cta/40 rounded-full animate-pulse-bar" />
              </div>
            </div>
          )}
          {status === 'done' && (
            <div className="w-4 h-4 rounded-full bg-terra-cta flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          <span className="text-sm text-ink">{message || 'Ready'}</span>
        </div>
        {cardCount > 0 && (
          <span className="text-xs text-muted bg-primary-50 px-2.5 py-1 rounded-full">
            {cardCount} lead{cardCount !== 1 ? 's' : ''} found
          </span>
        )}
      </div>

      {showPills && (
        <div className="flex items-center gap-2 mt-2">
          {CATEGORY_PILLS.map(({ type, icon, label }) => (
            <div
              key={type}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border-warm bg-primary-50 text-xs font-medium"
            >
              <span>{icon}</span>
              <span className="text-ink">{label}</span>
              <AgentStatusDot status={agentStatuses[type]} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
