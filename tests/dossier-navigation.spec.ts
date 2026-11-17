import { expect, test } from '@playwright/test'

const storageKey = 'second-look-lab:dossier:v2'

test('new explorer has a next-discovery CTA that opens the recommended first case', async ({ page }) => {
  await page.goto('/')
  const dossier = page.locator('#my-progress')
  await expect(dossier.getByText('NEXT DISCOVERY')).toBeVisible()
  await expect(dossier.getByText('Trust & Deception · 0 of 3 discovered')).toBeVisible()
  await dossier.getByRole('button', { name: 'Start this experience' }).click()
  await expect(page.getByRole('dialog', { name: 'The call from your bank interactive scenario' })).toBeVisible()
})

test('collection launches immersive story and both finished and unfinished cases can be opened', async ({ page }) => {
  await page.addInitScript(key => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify({
        schemaVersion: 2, completed: ['the-bank-call'], focusMode: false,
      }))
    }
  }, storageKey)
  await page.goto('/')
  const dossier = page.locator('#my-progress')
  await expect(dossier.getByText('Trust & Deception · 1 of 3 discovered')).toBeVisible()
  await dossier.getByRole('button', { name: 'Start Family text experience' }).click()
  await expect(page.getByRole('dialog').getByRole('heading', { name: 'Would you send the money?' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await dossier.getByRole('button', { name: 'Replay Bank call experience' }).click()
  await expect(page.getByRole('dialog', { name: 'The call from your bank interactive scenario' })).toBeVisible()
})

test('all-experiences index is collapsible and launches scenarios outside the featured collection', async ({ page }) => {
  await page.goto('/')
  const dossier = page.locator('#my-progress')
  const index = dossier.locator('.dossier-all-stories')
  await expect(index).not.toHaveAttribute('open')
  await index.locator('summary').click()
  await expect(index).toHaveAttribute('open')
  await index.getByRole('button', { name: 'Start AI apology experience' }).click()
  await expect(page.getByRole('dialog', { name: 'The apology written by AI interactive scenario' })).toBeVisible()
})

test('full-width Dossier does not leave a sticky side rail and has no horizontal overflow', async ({ page }, testInfo) => {
  await page.goto('/')
  const dossier = page.locator('#my-progress')
  const heading = dossier.locator('.journey-heading')
  const card = dossier.locator('.journey-card')
  await heading.scrollIntoViewIfNeeded()
  const headerBounds = await heading.boundingBox()
  const cardBounds = await card.boundingBox()
  expect(headerBounds).not.toBeNull()
  expect(cardBounds).not.toBeNull()
  if (headerBounds && cardBounds) {
    expect(cardBounds.y).toBeGreaterThanOrEqual(headerBounds.y + headerBounds.height - 4)
    expect(cardBounds.width).toBeGreaterThanOrEqual(headerBounds.width - 5)
  }
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(3)
  if (testInfo.project.name === 'mobile-chromium') {
    const button = dossier.getByRole('button', { name: 'Start Bank call experience' })
    const bounds = await button.boundingBox()
    expect(bounds).not.toBeNull()
    if (bounds) expect(bounds.height).toBeGreaterThanOrEqual(40)
  }
})
