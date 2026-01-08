'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface LimitStatus {
  canUpload: boolean
  usage: {
    current: number
    limit: number
    remaining: number
  }
  resetsAt: string
  messageAr: string
}

export function PrescriptionLimitBanner() {
  const [limitStatus, setLimitStatus] = useState<LimitStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchLimitStatus() {
      try {
        const response = await fetch('/api/prescriptions/limit')
        if (response.ok) {
          const data = await response.json()
          setLimitStatus(data)
        }
      } catch (error) {
        console.error('Failed to fetch limit status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLimitStatus()
  }, [])

  if (isLoading || !limitStatus) return null

  const percentage = (limitStatus.usage.current / limitStatus.usage.limit) * 100
  const resetsDate = new Date(limitStatus.resetsAt).toLocaleDateString('ar-SA', {
    month: 'long',
    day: 'numeric',
  })

  // Don't show if user hasn't uploaded any prescriptions yet
  if (limitStatus.usage.current === 0) return null

  // Show warning if approaching limit or exceeded
  if (!limitStatus.canUpload || limitStatus.usage.remaining <= 2) {
    return (
      <Card className="p-4 mb-4">
        <Alert variant={limitStatus.canUpload ? 'default' : 'destructive'}>
          {limitStatus.canUpload ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription className="flex flex-col gap-2">
            <p className="font-medium">{limitStatus.messageAr}</p>
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>الاستخدام هذا الشهر</span>
                <span className="font-medium">
                  {limitStatus.usage.current} / {limitStatus.usage.limit}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <Clock className="h-3 w-3" />
              <span>إعادة التعيين: {resetsDate}</span>
            </div>
          </AlertDescription>
        </Alert>
      </Card>
    )
  }

  // Show subtle success indicator if under limit
  return (
    <Card className="p-3 mb-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-green-800 dark:text-green-200">
            {limitStatus.usage.remaining} وصفات متبقية هذا الشهر
          </span>
        </div>
        <span className="text-xs text-green-600 dark:text-green-400">
          {limitStatus.usage.current} / {limitStatus.usage.limit}
        </span>
      </div>
    </Card>
  )
}
