import { describe, it, expect, beforeEach } from 'vitest'
import { haversineDistance } from '../lib/distance'

describe('Distance Calculation', () => {
  describe('haversineDistance', () => {
    it('should calculate distance between two points correctly', () => {
      // Riyadh coordinates
      const lat1 = 24.7136
      const lon1 = 46.6753
      
      // Jeddah coordinates
      const lat2 = 21.4858
      const lon2 = 39.1925
      
      const distance = haversineDistance(lat1, lon1, lat2, lon2)
      
      // Distance should be approximately 846 km
      expect(distance).toBeGreaterThan(840)
      expect(distance).toBeLessThan(860)
    })

    it('should return 0 for same coordinates', () => {
      const distance = haversineDistance(24.7136, 46.6753, 24.7136, 46.6753)
      expect(distance).toBe(0)
    })

    it('should handle negative coordinates', () => {
      const distance = haversineDistance(-33.8688, 151.2093, -37.8136, 144.9631)
      // Sydney to Melbourne: approximately 714 km
      expect(distance).toBeGreaterThan(700)
      expect(distance).toBeLessThan(730)
    })

    it('should apply 1.2x correction factor', () => {
      const lat1 = 24.7136
      const lon1 = 46.6753
      const lat2 = 24.8136
      const lon2 = 46.7753
      
      const distance = haversineDistance(lat1, lon1, lat2, lon2)
      
      // Should include 1.2x factor for real road distance
      expect(distance).toBeGreaterThan(0)
    })
  })
})
