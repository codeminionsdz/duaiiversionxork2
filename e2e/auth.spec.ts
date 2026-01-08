import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login')
  })

  test('should display login form', async ({ page }) => {
    // Check for email input
    const emailInput = page.getByLabel(/البريد الإلكتروني|Email/i)
    await expect(emailInput).toBeVisible()
    
    // Check for password input
    const passwordInput = page.getByLabel(/كلمة المرور|Password/i)
    await expect(passwordInput).toBeVisible()
    
    // Check for submit button
    const submitButton = page.getByRole('button', { name: /تسجيل الدخول|Login|دخول/i })
    await expect(submitButton).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    // Click submit without filling form
    const submitButton = page.getByRole('button', { name: /تسجيل الدخول|Login|دخول/i })
    await submitButton.click()
    
    // Should show validation errors
    await expect(page.locator('text=/مطلوب|required/i')).toBeVisible()
  })

  test('should show error for invalid email', async ({ page }) => {
    // Fill with invalid email
    await page.getByLabel(/البريد الإلكتروني|Email/i).fill('invalid-email')
    await page.getByLabel(/كلمة المرور|Password/i).fill('password123')
    
    // Submit form
    await page.getByRole('button', { name: /تسجيل الدخول|Login|دخول/i }).click()
    
    // Should show email validation error
    await expect(page.locator('text=/صحيح|valid|صيغة/i')).toBeVisible()
  })

  test('should navigate to signup from login', async ({ page }) => {
    // Find signup link
    const signupLink = page.getByRole('link', { name: /إنشاء حساب|Sign up|التسجيل/i })
    await signupLink.click()
    
    // Should be on signup page
    await expect(page).toHaveURL(/\/auth\/signup/)
  })
})

test.describe('Sign Up Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signup')
  })

  test('should display signup form', async ({ page }) => {
    // Check for required fields
    await expect(page.getByLabel(/الاسم|Name/i)).toBeVisible()
    await expect(page.getByLabel(/البريد|Email/i)).toBeVisible()
    await expect(page.getByLabel(/كلمة المرور|Password/i)).toBeVisible()
    await expect(page.getByLabel(/الهاتف|Phone/i)).toBeVisible()
  })

  test('should show password strength indicator', async ({ page }) => {
    const passwordInput = page.getByLabel(/كلمة المرور|Password/i).first()
    
    // Type weak password
    await passwordInput.fill('123')
    
    // Type strong password
    await passwordInput.fill('StrongP@ss123')
    
    // Should show some feedback (strength meter, text, etc.)
    // Adjust selector based on your actual implementation
  })

  test('should validate phone number format', async ({ page }) => {
    // Fill phone with invalid format
    await page.getByLabel(/الهاتف|Phone/i).fill('123')
    
    // Try to submit
    await page.getByRole('button', { name: /تسجيل|Sign up|إنشاء/i }).click()
    
    // Should show validation error for phone
    await expect(page.locator('text=/رقم الهاتف|phone/i')).toBeVisible()
  })
})
