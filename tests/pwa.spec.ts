import { expect, test } from '@playwright/test'

test('manifest has installable scope, name and PNG icons', async ({ page, request }) => {
  await page.goto('/')
  const link = page.locator('link[rel="manifest"]')
  await expect(link).toHaveAttribute('href', './manifest.webmanifest')
  const manifestUrl = new URL('./manifest.webmanifest', page.url()).href
  const response = await request.get(manifestUrl)
  expect(response.ok()).toBeTruthy()
  const manifest = await response.json()
  expect(manifest.name).toBe('Second Look Lab')
  expect(manifest.display).toBe('standalone')
  expect(manifest.start_url).toBe('./')
  expect(manifest.scope).toBe('./')
  for (const size of [192, 512]) {
    const icon = manifest.icons.find((item: { sizes: string }) => item.sizes === size + 'x' + size)
    expect(icon).toBeDefined()
    const file = await request.get(new URL(icon.src, manifestUrl).href)
    expect(file.ok()).toBeTruthy()
    const bytes = await file.body()
    expect(Array.from(bytes.subarray(0, 8))).toEqual([137,80,78,71,13,10,26,10])
    expect(bytes.readUInt32BE(16)).toBe(size)
    expect(bytes.readUInt32BE(20)).toBe(size)
  }
})

test('PWA serves app and interactive experience with network disconnected', async ({ page, context }) => {
  await page.goto('/')
  await page.waitForFunction(
    () => 'serviceWorker' in navigator && navigator.serviceWorker.controller?.scriptURL.endsWith('/sw.js'),
    null, { timeout: 25000 },
  )
  const workerUrl = await page.evaluate(() => navigator.serviceWorker.controller?.scriptURL ?? '')
  expect(workerUrl.endsWith('/sw.js')).toBeTruthy()
  await context.setOffline(true)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: /What if there's/ })).toBeVisible()
  await page.getByRole('button', { name: 'Open The apology written by AI interactive story' }).click()
  await expect(page.getByRole('dialog', { name: 'The apology written by AI interactive scenario' })).toBeVisible()
  await page.getByRole('dialog').locator('.options-list button').first().click()
  await page.getByRole('dialog').getByRole('button', { name: /Reveal new information/ }).click()
  await page.getByRole('dialog').getByRole('button', { name: /Take a second look/ }).click()
  await page.getByRole('dialog').locator('.options-list button').nth(1).click()
  await page.getByRole('dialog').getByRole('button', { name: /See the explanation/ }).click()
  await expect(page.getByRole('dialog').getByText(/Second look completed/)).toBeVisible()
})

test('mobile quick navigation and story sizing remain usable', async ({ page }, testInfo) => {
  await page.goto('/')
  const nav = page.getByRole('navigation', { name: 'Quick mobile navigation' })
  if (testInfo.project.name !== 'pwa-mobile') {
    await expect(nav).toBeHidden()
    return
  }
  await expect(nav).toBeVisible()
  await nav.getByRole('button', { name: 'Dossier' }).click()
  await expect(page.locator('#my-progress')).toBeInViewport({ ratio: 0.1 })
  await nav.getByRole('button', { name: 'Play' }).click()
  await expect(page.locator('#stories')).toBeInViewport({ ratio: 0.1 })
  await page.getByRole('button', { name: 'Open The apology written by AI interactive story' }).click()
  const dialog = page.getByRole('dialog')
  const bounds = await dialog.boundingBox()
  expect(bounds).not.toBeNull()
  if (bounds) {
    expect(Math.abs(bounds.width - (page.viewportSize()?.width ?? 0))).toBeLessThanOrEqual(2)
    expect(Math.abs(bounds.height - (page.viewportSize()?.height ?? 0))).toBeLessThanOrEqual(3)
  }
  await expect(dialog.getByRole('button', { name: 'Close interactive scenario' })).toBeVisible()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  expect(overflow).toBeLessThanOrEqual(3)
})
