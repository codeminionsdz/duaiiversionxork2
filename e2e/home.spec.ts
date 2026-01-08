import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check page title
    await expect(page).toHaveTitle(/دوائي|Duaiii/)
    
    // Check main content loaded
    await expect(page.locator('body')).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')
    
    // Find and click login link/button
    const loginButton = page.getByRole('link', { name: /تسجيل الدخول|Login/i })
    await loginButton.click()
    
    // Should be on login page
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/')
    
    // Find and click signup link/button
    const signupButton = page.getByRole('link', { name: /إنشاء حساب|Sign up|التسجيل/i })
    await signupButton.click()
    
    // Should be on signup page
    await expect(page).toHaveURL(/\/auth\/signup/)
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Page should still be visible and functional
    await expect(page.locator('body')).toBeVisible()
  })
})
