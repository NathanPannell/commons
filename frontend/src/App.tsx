import { useState } from 'react'
import type { ProfileSummary } from './types'
import { IntakeForm } from './components/IntakeForm'
import { ProfileReview } from './components/ProfileReview'
import { SearchView } from './components/SearchView'
import { useSearchStream } from './hooks/useSearchStream'

type Screen = 'intake' | 'review' | 'search'

export function App() {
  const [screen, setScreen] = useState<Screen>('intake')
  const [profile, setProfile] = useState<ProfileSummary | null>(null)
  const { cards, statusMessage, status, error, startSearch, reset } = useSearchStream()

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
