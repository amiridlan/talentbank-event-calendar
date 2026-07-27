import { test, expect } from '@playwright/test'

test('home page loads and displays content', async ({ page }) => {
  await page.goto('/')

  // Check that the main heading is visible
  await expect(page.getByRole('heading', { name: /get started/i })).toBeVisible()

  // Check that navigation links are present
  await expect(page.getByRole('link', { name: /deploy now/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /documentation/i })).toBeVisible()
})

test('has correct page title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Create Next App/)
})
