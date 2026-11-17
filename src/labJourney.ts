import { useCallback, useEffect, useState } from 'react'

export const EXPERIENCE_IDS = [
  'ai-apology',
  'the-bank-call',
  'only-two-left',
  'the-third-cancellation',
  'gut-vs-data',
  'the-better-deal',
  'the-family-text',
] as const

export type ExperienceId = typeof EXPERIENCE_IDS[number]
export const XP_PER_EXPERIENCE = 120
export const STORAGE_KEY = 'second-look-lab:journey:v1'

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

const allowed = new Set<string>(EXPERIENCE_IDS)

function sanitizeCompleted(raw: unknown): ExperienceId[] {
  if (!Array.isArray(raw)) return []
  return [...new Set(raw.filter((value): value is ExperienceId => typeof value === 'string' && allowed.has(value)))]
}

function readProgress(): ExperienceId[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    if (typeof parsed !== 'object' || parsed === null || !('completed' in parsed)) return []
    return sanitizeCompleted(parsed.completed)
  } catch {
    // Private browsing or disabled storage: keep progress in memory for this session.
    return []
  }
}

export function calculateJourney(completed: readonly ExperienceId[]) {
  const xp = completed.length * XP_PER_EXPERIENCE
  let level = 0
  while (level < LEVELS.length - 1 && xp >= LEVELS[level + 1].xp) level += 1
  const current = LEVELS[level]
  const next = LEVELS[level + 1] ?? null
  const percent = next ? Math.max(0, Math.min(100, (xp - current.xp) / (next.xp - current.xp) * 100)) : 100
  return { level, title: current.name, xp, next, percent, completedCount: completed.length, total: EXPERIENCE_IDS.length }
}

export function useLabJourney() {
  const [completed, setCompleted] = useState<ExperienceId[]>(readProgress)
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed }))
    } catch {
      // Local progress still works for the current session.
    }
  }, [completed])

  useEffect(() => {
    const refresh = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) setCompleted(readProgress())
    }
    window.addEventListener('storage', refresh)
    return () => window.removeEventListener('storage', refresh)
  }, [])

  const markCompleted = useCallback((id: ExperienceId) => {
    setCompleted(current => current.includes(id) ? current : [...current, id])
  }, [])
  const resetJourney = useCallback(() => setCompleted([]), [])
  return { completed, markCompleted, resetJourney, ...calculateJourney(completed) }
}
