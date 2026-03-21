import { useCallback, useRef, useState } from 'react'
import type { LeadCard, ProfileSummary, StreamEvent } from '../types'

export type FindPeopleStatus = 'idle' | 'searching' | 'done' | 'error'

export interface FindPeopleState {
  cards: LeadCard[]
  statusMessage: string
  status: FindPeopleStatus
  error: string | null
}

export function useFindPeople() {
  const [state, setState] = useState<FindPeopleState>({
    cards: [],
    statusMessage: '',
    status: 'idle',
    error: null,
  })
  const abortRef = useRef<AbortController | null>(null)

  const startSearch = useCallback(async (eventCard: LeadCard, profile: ProfileSummary, maxResults = 5) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setState({ cards: [], statusMessage: 'Finding people...', status: 'searching', error: null })

    try {
      const res = await fetch('/api/search/people-from-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_card: eventCard, profile, max_results: maxResults }),
        signal: controller.signal,
      })

      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() ?? ''

        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data: ')) continue
          let event: StreamEvent
          try {
            event = JSON.parse(line.slice('data: '.length)) as StreamEvent
          } catch {
            continue
          }

          if (event.event_type === 'card') {
            setState((prev) => ({ ...prev, cards: [...prev.cards, event.data as LeadCard] }))
          } else if (event.event_type === 'status') {
            setState((prev) => ({ ...prev, statusMessage: event.data as string }))
          } else if (event.event_type === 'error') {
            setState((prev) => ({ ...prev, error: event.data as string }))
          } else if (event.event_type === 'done') {
            setState((prev) => ({ ...prev, status: 'done', statusMessage: 'Done.' }))
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setState((prev) => ({ ...prev, status: 'error', error: (err as Error).message }))
    }
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setState({ cards: [], statusMessage: '', status: 'idle', error: null })
  }, [])

  return { ...state, startSearch, reset }
}
