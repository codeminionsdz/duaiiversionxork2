import { NextResponse } from 'next/server'
import { swaggerSpec } from '@/lib/swagger'

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Get OpenAPI specification
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: OpenAPI specification JSON
 */
export async function GET() {
  return NextResponse.json(swaggerSpec)
}
