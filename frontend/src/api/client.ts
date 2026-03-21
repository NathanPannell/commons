import type { ProfileInput, ProfileSummary } from '../types'

const BASE = '/api'

export async function submitIntake(input: ProfileInput): Promise<ProfileSummary> {
  const res = await fetch(`${BASE}/intake/json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Intake failed (${res.status}): ${detail}`)
  }
  return res.json() as Promise<ProfileSummary>
}

export async function submitIntakeWithPdf(
  bioText: string,
  pdfFile: File,
  targetRoles: string[],
  targetIndustries: string[],
  targetLocations: string[],
  interests: string[],
): Promise<ProfileSummary> {
  const form = new FormData()
  form.append('bio_text', bioText)
  form.append('resume_file', pdfFile)
  form.append('target_roles', JSON.stringify(targetRoles))
  form.append('target_industries', JSON.stringify(targetIndustries))
  form.append('target_locations', JSON.stringify(targetLocations))
  form.append('interests', JSON.stringify(interests))

  const res = await fetch(`${BASE}/intake`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Intake failed (${res.status}): ${detail}`)
  }
  return res.json() as Promise<ProfileSummary>
}
