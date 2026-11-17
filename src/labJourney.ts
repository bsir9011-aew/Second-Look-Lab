import { useCallback, useEffect, useMemo, useState } from 'react'

export const EXPERIENCE_IDS = [
  'ai-apology', 'the-bank-call', 'only-two-left',
  'the-third-cancellation', 'gut-vs-data', 'the-better-deal', 'the-family-text', 'the-screenshot',
] as const

export type ExperienceId = typeof EXPERIENCE_IDS[number]
export type LensId = 'Decide' | 'Detect' | 'Play'
export const XP_PER_EXPERIENCE = 120
/** Legacy v0.4 key - retained for safe, automatic upgrades. */
export const STORAGE_KEY = 'second-look-lab:journey:v1'
export const DOSSIER_STORAGE_KEY = 'second-look-lab:dossier:v2'
export const PASSPORT_FORMAT = 'second-look-lab-passport'

export const LEVELS = [
  { name: 'Newcomer', xp: 0 },
  { name: 'Curious Mind', xp: 100 },
  { name: 'Clue Seeker', xp: 220 },
  { name: 'Pattern Spotter', xp: 360 },
  { name: 'Second Looker', xp: 520 },
  { name: 'Context Explorer', xp: 700 },
  { name: 'Keen Observer', xp: 900 },
  { name: 'Insight Scout', xp: 1120 },
  { name: 'Perspective Builder', xp: 1360 },
  { name: 'Critical Explorer', xp: 1620 },
  { name: 'Lab Veteran', xp: 1900 },
] as const

export const LENSES: { id: LensId; description: string; experiences: readonly ExperienceId[] }[] = [
  { id: 'Decide', description: 'Human choices and context', experiences: ['ai-apology', 'the-third-cancellation'] },
  { id: 'Detect', description: 'Trust, scams and pressure', experiences: ['the-bank-call', 'only-two-left', 'the-family-text', 'the-screenshot'] },
  { id: 'Play', description: 'Estimates and comparisons', experiences: ['gut-vs-data', 'the-better-deal'] },
]

export const INTRO_COLLECTION = {
  id: 'trust-deception',
  name: 'Trust & Deception',
  description: 'Three everyday situations where appearances may mislead.',
  experiences: ['the-bank-call', 'the-family-text', 'only-two-left'] as const,
}

export const BADGE_DEFINITIONS = [
  { id: 'first-second-look', name: 'First Second Look', description: 'Complete your first experience.' },
  { id: 'across-the-lab', name: 'Across the Lab', description: 'Explore at least one experience in Decide, Detect and Play.' },
  { id: 'trust-decoder', name: 'Trust Decoder', description: 'Complete the Trust & Deception collection.' },
] as const

export type DossierState = {
  schemaVersion: 2
  completed: ExperienceId[]
  focusMode: boolean
}

type Passport = DossierState & { format: typeof PASSPORT_FORMAT }
const allowed = new Set<string>(EXPERIENCE_IDS)
const initialState = (): DossierState => ({ schemaVersion: 2, completed: [], focusMode: false })

function cleanCompleted(raw: unknown): ExperienceId[] {
  if (!Array.isArray(raw)) return []
  return [...new Set(raw.filter((id): id is ExperienceId => typeof id === 'string' && allowed.has(id)))]
}

export function loadDossier(): DossierState {
  try {
    const latest = window.localStorage.getItem(DOSSIER_STORAGE_KEY)
    if (latest !== null) {
      const parsed: unknown = JSON.parse(latest)
      if (typeof parsed === 'object' && parsed !== null && 'schemaVersion' in parsed && parsed.schemaVersion === 2 && 'completed' in parsed) {
        return {
          schemaVersion: 2, completed: cleanCompleted(parsed.completed),
          focusMode: 'focusMode' in parsed && parsed.focusMode === true,
        }
      }
    }
    const legacy = window.localStorage.getItem(STORAGE_KEY)
    if (legacy) {
      const parsed: unknown = JSON.parse(legacy)
      if (typeof parsed === 'object' && parsed !== null && 'completed' in parsed) {
        return { schemaVersion: 2, completed: cleanCompleted(parsed.completed), focusMode: false }
      }
    }
  } catch {
    // In private browsing or with unavailable storage, keep the journey usable in memory.
  }
  return initialState()
}

/** Strict import: invalid and unknown IDs must not be silently accepted as progress. */
export function parsePassport(text: string): Passport {
  if (text.length > 12000) throw new Error('Passport is too large.')
  let parsed: unknown
  try { parsed = JSON.parse(text) } catch { throw new Error('Passport must be valid JSON.') }
  if (typeof parsed !== 'object' || parsed === null || !('format' in parsed) || parsed.format !== PASSPORT_FORMAT ||
      !('schemaVersion' in parsed) || parsed.schemaVersion !== 2 || !('completed' in parsed) || !Array.isArray(parsed.completed)) {
    throw new Error('This is not a supported Second Look Lab Passport.')
  }
  const completed = parsed.completed as unknown[]
  if (completed.length > EXPERIENCE_IDS.length || completed.some(id => typeof id !== 'string' || !allowed.has(id)) ||
      new Set(completed).size !== completed.length) {
    throw new Error('Passport contains unrecognized or repeated experience IDs.')
  }
  if ('focusMode' in parsed && typeof parsed.focusMode !== 'boolean') {
    throw new Error('Invalid focus preference.')
  }
  return { format: PASSPORT_FORMAT, schemaVersion: 2, completed: cleanCompleted(completed), focusMode: 'focusMode' in parsed && parsed.focusMode === true }
}

export function makePassport(state: DossierState): string {
  const output: Passport = { format: PASSPORT_FORMAT, schemaVersion: 2, completed: cleanCompleted(state.completed), focusMode: state.focusMode }
  return JSON.stringify(output, null, 2)
}

export function calculateJourney(completed: readonly ExperienceId[]) {
  const xp = completed.length * XP_PER_EXPERIENCE
  let level = 0
  while (level < LEVELS.length - 1 && xp >= LEVELS[level + 1].xp) level += 1
  const current = LEVELS[level]
  const next = LEVELS[level + 1] ?? null
  const percent = next ? Math.max(0, Math.min(100, (xp - current.xp) / (next.xp - current.xp) * 100)) : 100
  const lenses = LENSES.map(lens => ({
    ...lens, completedCount: lens.experiences.filter(id => completed.includes(id)).length, total: lens.experiences.length,
  }))
  const collectionCount = INTRO_COLLECTION.experiences.filter(id => completed.includes(id)).length
  const collection = { ...INTRO_COLLECTION, completedCount: collectionCount, total: INTRO_COLLECTION.experiences.length, done: collectionCount === INTRO_COLLECTION.experiences.length }
  const badges = BADGE_DEFINITIONS.map(badge => ({
    ...badge,
    earned: badge.id === 'first-second-look' ? completed.length > 0
      : badge.id === 'across-the-lab' ? lenses.every(lens => lens.completedCount > 0)
      : collection.done,
  }))
  return { level, title: current.name, xp, next, percent, completedCount: completed.length, total: EXPERIENCE_IDS.length, lenses, collection, badges }
}

export function useLabJourney() {
  const [state, setState] = useState<DossierState>(loadDossier)
  useEffect(() => {
    try {
      window.localStorage.setItem(DOSSIER_STORAGE_KEY, JSON.stringify(state))
    } catch {
      // The user can still explore during this session without persistent storage.
    }
  }, [state])
  useEffect(() => {
    const refresh = (event: StorageEvent) => {
      if (event.key === DOSSIER_STORAGE_KEY) setState(loadDossier())
    }
    window.addEventListener('storage', refresh)
    return () => window.removeEventListener('storage', refresh)
  }, [])
  const markCompleted = useCallback((id: ExperienceId) => {
    if (!allowed.has(id)) return
    setState(current => current.completed.includes(id) ? current : { ...current, completed: [...current.completed, id] })
  }, [])
  const resetJourney = useCallback(() => setState(initialState()), [])
  const setFocusMode = useCallback((value: boolean) => setState(current => ({ ...current, focusMode: value })), [])
  const importPassport = useCallback((input: string) => {
    const passport = parsePassport(input)
    setState(current => ({
      ...current, completed: cleanCompleted([...current.completed, ...passport.completed]),
      // Preserve local presentation preference when combining progress.
    }))
    return passport.completed.length
  }, [])
  const passport = useMemo(() => makePassport(state), [state])
  return {
    completed: state.completed, focusMode: state.focusMode, passport,
    markCompleted, resetJourney, setFocusMode, importPassport,
    ...calculateJourney(state.completed),
  }
}
