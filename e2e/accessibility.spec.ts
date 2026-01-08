import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Accessibility Tests', () => {
  test('homepage should not have accessibility violations', async ({ page }) => {
    await page.goto('/')
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('login page should not have accessibility violations', async ({ page }) => {
    await page.goto('/auth/login')
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
    
    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/')
    
    // Tab through interactive elements
    await page.keyboard.press('Tab')
    const firstFocusedElement = await page.evaluate(() => document.activeElement?.tagName)
    
    // Should focus on interactive element
    expect(['A', 'BUTTON', 'INPUT']).toContain(firstFocusedElement)
  })

  test('images should have alt text', async ({ page }) => {
    await page.goto('/')
    
    // Get all images
    const images = await page.locator('img').all()
    
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      // Alt can be empty for decorative images, but should exist
      expect(alt).not.toBeNull()
    }
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')
    
    // Check for h1
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBeGreaterThanOrEqual(1)
    expect(h1Count).toBeLessThanOrEqual(1) // Only one h1 per page
  })

  test('forms should have proper labels', async ({ page }) => {
    await page.goto('/auth/login')
    
    // All inputs should have associated labels
    const inputs = await page.locator('input[type="text"], input[type="email"], input[type="password"]').all()
    
    for (const input of inputs) {
      const id = await input.getAttribute('id')
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count()
        const ariaLabel = await input.getAttribute('aria-label')
        const ariaLabelledBy = await input.getAttribute('aria-labelledby')
        
        // Should have at least one form of labeling
        expect(label > 0 || !!ariaLabel || !!ariaLabelledBy).toBeTruthy()
      }
    }
  })
})
