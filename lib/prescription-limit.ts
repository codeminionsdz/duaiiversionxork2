/**
 * Prescription Limit Utility
 * Manages monthly prescription upload limits
 */

import { createClient } from '@/lib/supabase/server'
import { logger } from './logger'

export interface PrescriptionLimitStatus {
  canUpload: boolean
  currentCount: number
  monthlyLimit: number
  remaining: number
  resetsAt: string
}

/**
 * Check if user can upload a prescription
 */
export async function checkPrescriptionLimit(userId: string): Promise<PrescriptionLimitStatus> {
  try {
    const supabase = await createClient()

    // Call database function to check limit
    const { data, error } = await supabase.rpc('check_prescription_monthly_limit', {
      user_id_param: userId,
    })

    if (error) {
      logger.error('Failed to check prescription limit', error, { userId })
      throw error
    }

    return {
      canUpload: data.can_upload,
      currentCount: data.current_count,
      monthlyLimit: data.monthly_limit,
      remaining: data.remaining,
      resetsAt: data.resets_at,
    }
  } catch (error) {
    logger.error('Error checking prescription limit', error as Error, { userId })
    throw error
  }
}

/**
 * Get prescription limit status for display
 */
export async function getPrescriptionLimitStatus(userId: string): Promise<{
  status: PrescriptionLimitStatus
  message: string
  messageAr: string
}> {
  const status = await checkPrescriptionLimit(userId)

  const resetsAtDate = new Date(status.resetsAt)
  const formattedDate = resetsAtDate.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  let message = ''
  let messageAr = ''

  if (!status.canUpload) {
    message = `You have reached your monthly limit of ${status.monthlyLimit} prescriptions. Your limit will reset on ${formattedDate}.`
    messageAr = `لقد وصلت إلى الحد الشهري وهو ${status.monthlyLimit} وصفات. سيتم إعادة تعيين الحد في ${formattedDate}.`
  } else if (status.remaining <= 2) {
    message = `You have ${status.remaining} prescription${status.remaining === 1 ? '' : 's'} remaining this month.`
    messageAr = `لديك ${status.remaining} ${status.remaining === 1 ? 'وصفة متبقية' : 'وصفات متبقية'} هذا الشهر.`
  } else {
    message = `You can upload ${status.remaining} more prescriptions this month.`
    messageAr = `يمكنك رفع ${status.remaining} وصفات أخرى هذا الشهر.`
  }

  return {
    status,
    message,
    messageAr,
  }
}

/**
 * Format limit status for API response
 */
export function formatLimitResponse(status: PrescriptionLimitStatus) {
  return {
    canUpload: status.canUpload,
    usage: {
      current: status.currentCount,
      limit: status.monthlyLimit,
      remaining: status.remaining,
    },
    resetsAt: status.resetsAt,
  }
}

/**
 * Check if user is approaching limit (75% or more)
 */
export function isApproachingLimit(status: PrescriptionLimitStatus): boolean {
  const usagePercentage = (status.currentCount / status.monthlyLimit) * 100
  return usagePercentage >= 75
}

/**
 * Reset user's monthly count (admin only)
 */
export async function resetUserPrescriptionCount(userId: string): Promise<void> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('profiles')
      .update({
        prescriptions_this_month: 0,
        last_prescription_reset_date: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      logger.error('Failed to reset prescription count', error, { userId })
      throw error
    }

    logger.info('Prescription count reset successfully', { userId })
  } catch (error) {
    logger.error('Error resetting prescription count', error as Error, { userId })
    throw error
  }
}
