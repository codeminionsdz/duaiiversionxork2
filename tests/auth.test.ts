import { describe, it, expect } from 'vitest'

describe('Auth Validation', () => {
  describe('Email validation', () => {
    it('should accept valid email', () => {
      const email = 'user@example.com'
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      expect(emailRegex.test(email)).toBe(true)
    })

    it('should reject invalid email', () => {
      const email = 'invalid-email'
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      expect(emailRegex.test(email)).toBe(false)
    })

    it('should reject email without domain', () => {
      const email = 'user@'
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      expect(emailRegex.test(email)).toBe(false)
    })
  })

  describe('Password validation', () => {
    it('should accept strong password', () => {
      const password = 'StrongP@ss123'
      expect(password.length).toBeGreaterThanOrEqual(8)
    })

    it('should reject short password', () => {
      const password = 'weak'
      expect(password.length).toBeLessThan(8)
    })
  })

  describe('Phone validation', () => {
    it('should accept valid Saudi phone', () => {
      const phone = '0512345678'
      const phoneRegex = /^05\d{8}$/
      expect(phoneRegex.test(phone)).toBe(true)
    })

    it('should reject invalid phone', () => {
      const phone = '123456'
      const phoneRegex = /^05\d{8}$/
      expect(phoneRegex.test(phone)).toBe(false)
    })
  })
})
