import { expect, test } from '@playwright/test'

const version2 = 'second-look-lab:dossier:v2'
const oldKey = 'second-look-lab:journey:v1'
const passport = (completed: string[]) => JSON.stringify({
  format: 'second-look-lab-passport', schemaVersion: 2, completed, focusMode: false,
})

test('v0.4 local progress migrates to Dossier v0.5 without loss of rank or XP', async ({ page }) => {
  await page.addInitScript(key => {
    localStorage.setItem(key, JSON.stringify({ completed: ['ai-apology', 'the-bank-call'] }))
  }, oldKey)
  await page.goto('/')
  const panel = page.locator('#my-progress')
  await expect(panel.getByText('Level 2 · Clue Seeker')).toBeVisible()
  await expect(panel.getByText('240 XP', { exact: true })).toBeVisible()
  const stored = await page.evaluate(key => localStorage.getItem(key), version2)
  expect(JSON.parse(stored ?? '{}')).toMatchObject({
    schemaVersion: 2, completed: ['ai-apology', 'the-bank-call'], focusMode: false,
  })
  await page.reload()
  await expect(page.locator('#my-progress').getByText('240 XP', { exact: true })).toBeVisible()
})

test('Lenses, collection and badges reflect real unique completed experiences', async ({ page }) => {
  await page.addInitScript((key) => {
    localStorage.setItem(key, JSON.stringify({
      schemaVersion: 2,
      completed: ['ai-apology', 'the-bank-call', 'the-family-text', 'only-two-left', 'gut-vs-data'],
      focusMode: false,
    }))
  }, version2)
  await page.goto('/')
  const panel = page.locator('#my-progress')
  await expect(panel.getByRole('progressbar', { name: 'Decide exploration' })).toHaveAttribute('aria-valuenow', '1')
  await expect(panel.getByRole('progressbar', { name: 'Detect exploration' })).toHaveAttribute('aria-valuenow', '3')
  await expect(panel.getByRole('progressbar', { name: 'Play exploration' })).toHaveAttribute('aria-valuenow', '1')
  await expect(panel.getByText('Collection complete')).toBeVisible()
  await expect(panel.locator('.dossier-badge.unlocked')).toHaveCount(3)
})

test('Passport import merges saved and incoming experiences; invalid IDs are rejected', async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, JSON.stringify({
    schemaVersion: 2, completed: ['ai-apology'], focusMode: false,
  })), version2)
  await page.goto('/')
  const panel = page.locator('#my-progress')
  await panel.locator('.dossier-passport summary').click()
  await panel.getByLabel('Import a Passport (merge progress)').fill(passport(['the-family-text', 'the-bank-call']))
  await panel.getByRole('button', { name: 'Import & merge discoveries' }).click()
  await expect(panel.getByText('3 / 7 unique')).toBeVisible()
  await expect(panel.getByText('360 XP', { exact: true })).toBeVisible()
  await panel.getByLabel('Import a Passport (merge progress)').fill(passport(['unknown-id']))
  await panel.getByRole('button', { name: 'Import & merge discoveries' }).click()
  await expect(panel.getByText(/unrecognized or repeated experience IDs/)).toBeVisible()
  await expect(panel.getByText('360 XP', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.locator('#my-progress').getByText('3 / 7 unique')).toBeVisible()
})

test('Focus Mode hides XP and badges, keeps discoveries and survives reload', async ({ page }) => {
  await page.goto('/')
  const panel = page.locator('#my-progress')
  await panel.getByRole('checkbox', { name: /Focus Mode/ }).check()
  await expect(panel.getByText('Focus Mode is on.')).toBeVisible()
  await expect(panel.locator('.journey-xp')).toHaveCount(0)
  await expect(panel.locator('.dossier-badge')).toHaveCount(0)
  await expect(panel.getByRole('progressbar', { name: 'Decide exploration' })).toBeVisible()
  await page.getByRole('button', { name: 'Open The apology written by AI interactive story' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.locator('.options-list button').first().click()
  await dialog.getByRole('button', { name: /Reveal new information/ }).click()
  await dialog.getByRole('button', { name: /Take a second look/ }).click()
  await dialog.locator('.options-list button').nth(1).click()
  await dialog.getByRole('button', { name: /See the explanation/ }).click()
  await expect(dialog.locator('.journey-earned')).toHaveCount(0)
  await dialog.getByRole('button', { name: /Back to the Lab/ }).click()
  await expect(panel.getByText('1 / 7 unique')).toBeVisible()
  await page.reload()
  await expect(page.locator('#my-progress').getByRole('checkbox', { name: /Focus Mode/ })).toBeChecked()
  await page.locator('#my-progress').getByRole('checkbox', { name: /Focus Mode/ }).uncheck()
  await expect(page.locator('#my-progress').getByText('120 XP', { exact: true })).toBeVisible()
})
