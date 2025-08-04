import { test, expect } from '@playwright/test'

test.describe('Vue.js app', () => {
  test('renders properly', async ({ page }) => {
    await page.goto('/')

    await expect(page).toHaveTitle(/SmartCare/)
    
    // Check that the main app content is visible
    await expect(page.locator('#app')).toBeVisible()
  })
}) 