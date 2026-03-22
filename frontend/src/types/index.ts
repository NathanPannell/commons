// Mirrors backend Pydantic models in models/schemas.py

export type LeadType = 'event' | 'person' | 'community' | 'company' | 'resource'

export interface ProfileInput {
  bio_text?: string | null
  resume_text?: string | null
  target_industries: string[]
  target_roles: string[]
  target_locations: string[]
  interests: string[]
}

export interface ProfileSummary {
  name?: string | null
  education?: string | null
  skills: string[]
  experience_summary: string
  target_roles: string[]
  target_industries: string[]
  locations: string[]
  angles: string[]
  raw_input: ProfileInput
}

export interface LeadCard {
  id: string
  lead_type: LeadType
  title: string
  subtitle: string
  why_relevant: string
  source_urls: string[]
  action_plan: string
  outreach_message?: string | null
  date?: string | null
  location?: string | null
  platform?: string | null
}

export interface SearchRequest {
  profile: ProfileSummary
  max_results_per_category: number
}

export interface FindPeopleRequest {
  event_card: LeadCard
  profile: ProfileSummary
  max_results: number
}

export interface StreamEvent {
  event_type: 'card' | 'status' | 'error' | 'done' | 'agent_status'
  data: LeadCard | AgentStatusPayload | string
}

export interface AgentStatusPayload {
  category: LeadType
  status: 'running' | 'done' | 'error'
}

/** Raw form data from IntakeForm (before API call) */
export interface IntakeFormData {
  bioText: string
  pdfFile: File | null
  roles: string[]
  industries: string[]
  locations: string[]
  interests: string[]
}
