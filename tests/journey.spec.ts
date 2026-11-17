import { expect, test } from '@playwright/test'

test('completion unlocks XP once, survives refresh and can be cleared', async ({ page }) => {
  await page.goto('/')
  const panel = page.locator('#my-progress')
  await expect(panel.getByText('Level 0 · Newcomer')).toBeVisible()
  await expect(panel.getByText('0 XP', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Open The apology written by AI interactive story' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.locator('.options-list button').first().click()
  await dialog.getByRole('button', { name: /Reveal new information/ }).click()
  await dialog.getByRole('button', { name: /Take a second look/ }).click()
  await dialog.locator('.options-list button').nth(1).click()
  await dialog.getByRole('button', { name: /See the explanation/ }).click()
  await expect(dialog.getByText('+120 discovery XP · New experience')).toBeVisible()
  await dialog.getByRole('button', { name: /Back to the Lab/ }).click()

  await expect(panel.getByText('Level 1 · Curious Mind')).toBeVisible()
  await expect(panel.getByText('120 XP', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.locator('#my-progress').getByText('120 XP', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Open The apology written by AI interactive story' }).click()
  await dialog.locator('.options-list button').nth(2).click()
  await dialog.getByRole('button', { name: /Reveal new information/ }).click()
  await dialog.getByRole('button', { name: /Take a second look/ }).click()
  await dialog.locator('.options-list button').first().click()
  await dialog.getByRole('button', { name: /See the explanation/ }).click()
  await expect(dialog.getByText('Previously explored · No repeat XP')).toBeVisible()
  await dialog.getByRole('button', { name: /Back to the Lab/ }).click()
  await expect(panel.getByText('120 XP', { exact: true })).toBeVisible()

  page.once('dialog', async confirmation => confirmation.accept())
  await panel.getByRole('button', { name: /Reset progress saved/ }).click()
  await expect(panel.getByText('Level 0 · Newcomer')).toBeVisible()
  await expect(panel.getByText('0 XP', { exact: true })).toBeVisible()
})

test('family text also counts as one unique experience, including unsafe choices', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open the message' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: /Send the money right away/ }).click()
  await dialog.getByRole('button', { name: /See what happens/ }).click()
  await dialog.getByRole('button', { name: /Read the next message/ }).click()
  await dialog.getByRole('button', { name: /Send the transfer - the detail sounds genuine/ }).click()
  await dialog.getByRole('button', { name: /Reveal the outcome/ }).click()
  await expect(dialog.getByText('+120 discovery XP · New experience')).toBeVisible()
  await dialog.getByRole('button', { name: /Explore the Lab/ }).click()
  await expect(page.locator('#my-progress').getByText('Level 1 · Curious Mind')).toBeVisible()
  await page.reload()
  await expect(page.locator('#my-progress').getByText('120 XP', { exact: true })).toBeVisible()
})

test('stored progress sanitizes unknown IDs, duplicates and malformed values', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('second-look-lab:journey:v1',
      JSON.stringify({ completed: ['ai-apology', 'ai-apology', 'not-a-story', null, 4] }))
  })
  await page.goto('/')
  const panel = page.locator('#my-progress')
  await expect(panel.getByText('1 / 7 unique')).toBeVisible()
  await expect(panel.getByText('120 XP', { exact: true })).toBeVisible()
})
