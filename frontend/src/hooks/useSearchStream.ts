import { useCallback, useRef, useState } from 'react'
import type { LeadCard, ProfileSummary, StreamEvent } from '../types'

export type SearchStatus = 'idle' | 'searching' | 'done' | 'error'

export interface SearchState {
  cards: LeadCard[]
  statusMessage: string
  status: SearchStatus
  error: string | null
}

export function useSearchStream() {
  const [state, setState] = useState<SearchState>({
    cards: [],
    statusMessage: '',
    status: 'idle',
    error: null,
  })
  const abortRef = useRef<AbortController | null>(null)

  const startSearch = useCallback(
    async (profile: ProfileSummary, maxResultsPerCategory = 5) => {
      // Cancel any in-flight request
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setState({ cards: [], statusMessage: 'Starting search...', status: 'searching', error: null })

      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile, max_results_per_category: maxResultsPerCategory }),
          signal: controller.signal,
        })

        if (!res.ok || !res.body) {
          throw new Error(`Search request failed: ${res.status}`)
        }

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          // SSE events are separated by "\n\n"
          const parts = buffer.split('\n\n')
          buffer = parts.pop() ?? ''

          for (const part of parts) {
            const line = part.trim()
            if (!line.startsWith('data: ')) continue
            const jsonStr = line.slice('data: '.length)
            if (!jsonStr) continue

            let event: StreamEvent
            try {
              event = JSON.parse(jsonStr) as StreamEvent
            } catch {
              continue
            }

            handleEvent(event)
          }
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: (err as Error).message,
        }))
      }
    },
    [],
  )

  function handleEvent(event: StreamEvent) {
    if (event.event_type === 'card') {
      const card = event.data as LeadCard
      setState((prev) => ({ ...prev, cards: [...prev.cards, card] }))
    } else if (event.event_type === 'status') {
      setState((prev) => ({ ...prev, statusMessage: event.data as string }))
    } else if (event.event_type === 'error') {
      setState((prev) => ({ ...prev, error: event.data as string }))
    } else if (event.event_type === 'done') {
      setState((prev) => ({ ...prev, status: 'done', statusMessage: 'Search complete.' }))
    }
  }

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setState({ cards: [], statusMessage: '', status: 'idle', error: null })
  }, [])

  return { ...state, startSearch, reset }
}
