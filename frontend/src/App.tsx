import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import type { IntakeFormData, ProfileInput, ProfileSummary } from './types'
import type { SearchPhase } from './components/SearchView'
import { NavBar } from './components/NavBar'
import { IntakeForm } from './components/IntakeForm'
import { ProfileReview } from './components/ProfileReview'
import { SearchView } from './components/SearchView'
import { useSearchStream } from './hooks/useSearchStream'
import { submitIntake, submitIntakeWithPdf } from './api/client'
import { MOCK_PROFILE, MOCK_CARDS } from './mocks'

const MOCK = new URLSearchParams(window.location.search).get('mock')

export function App() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<ProfileSummary | null>(MOCK ? MOCK_PROFILE : null)
  const [searchPhase, setSearchPhase] = useState<SearchPhase>(MOCK === 'search' ? 'results' : 'analyzing')
  const [intakeError, setIntakeError] = useState<string | null>(null)
  const { cards: streamCards, status, error, startSearch, reset } = useSearchStream()
  const cards = MOCK === 'search' ? MOCK_CARDS : streamCards

  async function handleIntakeSubmit(data: IntakeFormData) {
    // Navigate to /search immediately — show analyzing phase
    navigate('/search')
    setSearchPhase('analyzing')
    setIntakeError(null)

    try {
      let result: ProfileSummary

      if (data.pdfFile) {
        result = await submitIntakeWithPdf(
          data.bioText,
          data.pdfFile,
          data.roles,
          data.industries,
          data.locations,
          data.interests,
        )
      } else {
        const input: ProfileInput = {
          bio_text: data.bioText || null,
          target_roles: data.roles,
          target_industries: data.industries,
          target_locations: data.locations,
          interests: data.interests,
        }
        result = await submitIntake(input)
      }

      // Profile parsed — transition to searching phase
      setProfile(result)
      setSearchPhase('searching')
      void startSearch(result)
    } catch (err) {
      setIntakeError((err as Error).message)
    }
  }

  // Transition to results phase when first card arrives
  useEffect(() => {
    if (searchPhase === 'searching' && cards.length > 0) {
      setSearchPhase('results')
    }
  }, [searchPhase, cards.length])

  function handleReset() {
    reset()
    setProfile(null)
    setSearchPhase('analyzing')
    setIntakeError(null)
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-surface">
      <NavBar onNavigate={(path) => navigate(path)} />

      <Routes>
        <Route
          path="/"
          element={<IntakeForm onSubmit={handleIntakeSubmit} />}
        />
        <Route
          path="/account"
          element={
            profile ? (
              <ProfileReview
                profile={profile}
                onBack={() => navigate(cards.length > 0 ? '/search' : '/')}
              />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/search"
          element={
            <SearchView
              profile={profile}
              cards={cards}
              status={status}
              error={intakeError || error}
              phase={searchPhase}
              onReset={handleReset}
            />
          }
        />
      </Routes>
    </div>
  )
}
