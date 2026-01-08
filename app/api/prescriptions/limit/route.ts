import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPrescriptionLimitStatus, formatLimitResponse } from '@/lib/prescription-limit'

/**
 * @swagger
 * /api/prescriptions/limit:
 *   get:
 *     summary: Check prescription upload limit
 *     description: Returns the current monthly prescription limit status for the authenticated user
 *     tags: [Prescriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Limit status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 canUpload:
 *                   type: boolean
 *                   example: true
 *                 usage:
 *                   type: object
 *                   properties:
 *                     current:
 *                       type: integer
 *                       example: 2
 *                     limit:
 *                       type: integer
 *                       example: 5
 *                     remaining:
 *                       type: integer
 *                       example: 3
 *                 resetsAt:
 *                   type: string
 *                   format: date-time
 *                 message:
 *                   type: string
 *                   example: You can upload 3 more prescriptions this month
 *                 messageAr:
 *                   type: string
 *                   example: يمكنك رفع 3 وصفات أخرى هذا الشهر
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function GET() {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get limit status
    const limitInfo = await getPrescriptionLimitStatus(user.id)

    return NextResponse.json({
      ...formatLimitResponse(limitInfo.status),
      message: limitInfo.message,
      messageAr: limitInfo.messageAr,
    })
  } catch (error) {
    console.error('Error checking prescription limit:', error)
    return NextResponse.json(
      {
        error: 'Failed to check prescription limit',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
