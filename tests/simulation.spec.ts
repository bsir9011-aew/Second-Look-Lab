import { expect, test } from '@playwright/test'

test('cautious reader checks identity instead of trusting a family detail', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open the message' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: 'Would you send the money?' })).toBeVisible()
  await expect(dialog.getByText('Fictional messages')).toBeVisible()
  await dialog.getByRole('button', { name: /Ask something only Mom would know/ }).click()
  await dialog.getByRole('button', { name: /See what happens/ }).click()
  await expect(dialog.getByText('Milo, of course.', { exact: true })).toBeVisible()
  await dialog.getByRole('button', { name: /Read the next message/ }).click()
  await expect(dialog.getByText(/Milo.s name also appears in a public family post/)).toBeVisible()
  await dialog.getByRole('button', { name: /Verify through a saved number or trusted family contact/ }).click()
  await dialog.getByRole('button', { name: /Reveal the outcome/ }).click()
  await expect(dialog.getByRole('heading', { name: 'You chose independent verification.' })).toBeVisible()
  await expect(dialog.getByRole('link', { name: /CISA/ })).toBeVisible()
  await dialog.getByRole('button', { name: /Try a different choice/ }).click()
  await expect(dialog.getByRole('heading', { name: 'Would you send the money?' })).toBeVisible()
})

test('rushed reader sees a non-punitive warning and no real transaction', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Start interactive message simulation' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: /Send the money right away/ }).click()
  await dialog.getByRole('button', { name: /See what happens/ }).click()
  await expect(dialog.getByText(/The simulation pauses before any money can be sent/)).toBeVisible()
  await dialog.getByRole('button', { name: /Read the next message/ }).click()
  await dialog.getByRole('button', { name: /Send the transfer - the detail sounds genuine/ }).click()
  await dialog.getByRole('button', { name: /Reveal the outcome/ }).click()
  await expect(dialog.getByRole('heading', { name: 'An urgent story is still unverified.' })).toBeVisible()
  await expect(dialog.getByText(/simulated transfer was not sent/)).toBeVisible()
})

test('keyboard user can close with Escape and body scrolling recovers', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open the message' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')
})

test('mobile and desktop homepage do not overflow horizontally', async ({ page }) => {
  await page.goto('/')
  const widths = await page.evaluate(() => ({
    layout: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }))
  expect(widths.layout).toBeLessThanOrEqual(widths.viewport + 3)
})
