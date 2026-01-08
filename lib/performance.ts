/**
 * Performance Monitoring Utility
 * Tracks performance metrics and web vitals
 */

export interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: PerformanceMetric[] = []

  private constructor() {
    if (typeof window !== 'undefined') {
      this.initWebVitals()
      this.initPerformanceObserver()
    }
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  private initWebVitals() {
    // Dynamic import of web-vitals
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(this.handleMetric.bind(this))
      onFCP(this.handleMetric.bind(this))
      onLCP(this.handleMetric.bind(this))
      onTTFB(this.handleMetric.bind(this))
      onINP(this.handleMetric.bind(this))
    }).catch(err => {
      console.warn('Failed to load web-vitals:', err)
    })
  }

  private initPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      // Observe navigation timing
      try {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming
              this.trackCustomMetric('DOM Content Loaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart)
              this.trackCustomMetric('Page Load Time', navEntry.loadEventEnd - navEntry.loadEventStart)
            }
          }
        })
        navObserver.observe({ entryTypes: ['navigation'] })
      } catch (e) {
        console.warn('Navigation observer not supported:', e)
      }

      // Observe resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const resourceEntry = entry as PerformanceResourceTiming
            if (resourceEntry.duration > 1000) { // Only track slow resources
              this.trackCustomMetric(`Slow Resource: ${resourceEntry.name}`, resourceEntry.duration)
            }
          }
        })
        resourceObserver.observe({ entryTypes: ['resource'] })
      } catch (e) {
        console.warn('Resource observer not supported:', e)
      }
    }
  }

  private handleMetric(metric: any) {
    const rating = this.getRating(metric.name, metric.value)
    
    const perfMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      rating,
      timestamp: Date.now(),
    }

    this.metrics.push(perfMetric)
    this.sendToAnalytics(perfMetric)

    // Log poor metrics
    if (rating === 'poor') {
      console.warn(`Poor ${metric.name}:`, metric.value)
    }
  }

  private getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds: Record<string, { good: number; poor: number }> = {
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      TTFB: { good: 800, poor: 1800 },
      INP: { good: 200, poor: 500 },
    }

    const threshold = thresholds[metricName]
    if (!threshold) return 'good'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }

  private trackCustomMetric(name: string, value: number) {
    const metric: PerformanceMetric = {
      name,
      value,
      rating: 'good', // Custom metrics don't have standard ratings
      timestamp: Date.now(),
    }

    this.metrics.push(metric)
  }

  private async sendToAnalytics(metric: PerformanceMetric) {
    try {
      // Send to your analytics endpoint
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'performance_metric',
          properties: {
            metric_name: metric.name,
            metric_value: metric.value,
            metric_rating: metric.rating,
          },
        }),
      })
    } catch (error) {
      console.error('Failed to send metric to analytics:', error)
    }
  }

  getMetrics(): PerformanceMetric[] {
    return this.metrics
  }

  getMetricsByRating(rating: 'good' | 'needs-improvement' | 'poor'): PerformanceMetric[] {
    return this.metrics.filter(m => m.rating === rating)
  }

  clearMetrics() {
    this.metrics = []
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()
