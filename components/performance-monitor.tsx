'use client'

import { useEffect } from 'react'
import { performanceMonitor } from '@/lib/performance'

/**
 * Performance Monitoring Component
 * Automatically tracks Web Vitals and performance metrics
 */
export function PerformanceMonitor() {
  useEffect(() => {
    // Initialize performance monitoring
    const monitor = performanceMonitor

    // Log performance summary after page load
    const timer = setTimeout(() => {
      const metrics = monitor.getMetrics()
      const poorMetrics = monitor.getMetricsByRating('poor')
      
      if (poorMetrics.length > 0) {
        console.warn('Performance issues detected:', poorMetrics)
      }

      // Optional: Send summary to analytics
      if (metrics.length > 0) {
        console.log('Performance metrics collected:', metrics.length)
      }
    }, 5000) // Wait 5 seconds after page load

    return () => clearTimeout(timer)
  }, [])

  // This component doesn't render anything
  return null
}
