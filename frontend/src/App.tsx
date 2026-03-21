import { useState } from 'react'
import type { ProfileSummary } from './types'
import { IntakeForm } from './components/IntakeForm'
import { ProfileReview } from './components/ProfileReview'
import { SearchView } from './components/SearchView'
import { useSearchStream } from './hooks/useSearchStream'
import { MOCK_PROFILE, MOCK_CARDS } from './mocks'

type Screen = 'intake' | 'review' | 'search'

const MOCK = new URLSearchParams(window.location.search).get('mock')

export function App() {
  const [screen, setScreen] = useState<Screen>(MOCK ? (MOCK as Screen) : 'intake')
  const [profile, setProfile] = useState<ProfileSummary | null>(MOCK ? MOCK_PROFILE : null)
  const { cards: streamCards, statusMessage, status, error, startSearch, reset } = useSearchStream()
  const cards = MOCK === 'search' ? MOCK_CARDS : streamCards

  function handleIntakeSuccess(p: ProfileSummary) {
    setProfile(p)
    setScreen('review')
  }

  function handleConfirmProfile() {
    if (!profile) return
    setScreen('search')
    void startSearch(profile)
  }

  function handleReset() {
    reset()
    setProfile(null)
    setScreen('intake')
  }

  if (screen === 'intake') {
    return <IntakeForm onSuccess={handleIntakeSuccess} />
  }

  if (screen === 'review' && profile) {
    return (
      <ProfileReview
        profile={profile}
        onConfirm={handleConfirmProfile}
        onBack={() => setScreen('intake')}
      />
    )
  }

  if (screen === 'search' && profile) {
    return (
      <SearchView
        profile={profile}
        cards={cards}
        statusMessage={statusMessage}
        status={status}
        error={error}
        onReset={handleReset}
      />
    )
  }

  return null
}
