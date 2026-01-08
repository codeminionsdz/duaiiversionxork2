/**
 * Zod Validation Schemas for دوائي App
 * Centralized validation for authentication, search, and prescriptions
 *
 * Usage:
 *   import { loginSchema } from "@/lib/validation"
 *   const result = loginSchema.safeParse(data)
 *   if (!result.success) return { error: result.error.issues[0].message }
 */

import { z } from "zod"

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

/**
 * Login validation schema
 * Used in: Server Actions, API routes, Client-side form validation
 */
export const loginSchema = z.object({
  email: z
    .string({ message: "البريد الإلكتروني مطلوب" })
    .min(1, "البريد الإلكتروني مطلوب")
    .email("صيغة البريد الإلكتروني غير صحيحة"),
  password: z
    .string({ message: "كلمة المرور مطلوبة" })
    .min(1, "كلمة المرور مطلوبة")
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
})

export type LoginInput = z.infer<typeof loginSchema>

/**
 * Register/Signup validation schema
 * Includes user account type selection
 */
export const registerSchema = z
  .object({
    email: z
      .string({ message: "البريد الإلكتروني مطلوب" })
      .min(1, "البريد الإلكتروني مطلوب")
      .email("صيغة البريد الإلكتروني غير صحيحة"),
    password: z
      .string({ message: "كلمة المرور مطلوبة" })
      .min(1, "كلمة المرور مطلوبة")
      .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
    confirmPassword: z
      .string({ message: "تأكيد كلمة المرور مطلوب" })
      .min(1, "تأكيد كلمة المرور مطلوب"),
    role: z
      .enum(["user", "pharmacy"], {
        message: "نوع الحساب غير صحيح",
      })
      .optional()
      .default("user"),
    fullName: z
      .string()
      .max(100, "الاسم طويل جداً"),
    phone: z
      .string()
      .regex(/^[0-9+\-\s]{7,}$/, "رقم الهاتف غير صحيح")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمات المرور غير متطابقة",
    path: ["confirmPassword"],
  })

export type RegisterInput = z.infer<typeof registerSchema>

// ============================================================================
// SEARCH SCHEMAS
// ============================================================================

/**
 * Medicine search validation schema
 * Used in: Medicine search actions, API routes
 */
export const medicineSearchSchema = z.object({
  query: z
    .string({ message: "نص البحث مطلوب" })
    .min(1, "نص البحث مطلوب")
    .max(100, "نص البحث طويل جداً"),
  limit: z
    .number()
    .int("الحد يجب أن يكون رقماً صحيحاً")
    .min(1, "الحد يجب أن يكون 1 على الأقل")
    .max(100, "الحد الأقصى 100 نتيجة")
    .optional()
    .default(50),
})

export type MedicineSearchInput = z.infer<typeof medicineSearchSchema>

/**
 * Pharmacy search/nearby validation schema
 * Used in: Pharmacy search actions, geolocation-based search
 */
export const pharmacySearchSchema = z.object({
  latitude: z
    .number({ message: "خط العرض مطلوب" })
    .min(-90, "خط العرض غير صحيح")
    .max(90, "خط العرض غير صحيح"),
  longitude: z
    .number({ message: "خط الطول مطلوب" })
    .min(-180, "خط الطول غير صحيح")
    .max(180, "خط الطول غير صحيح"),
  maxDistance: z
    .number()
    .int("المسافة يجب أن تكون رقماً صحيحاً")
    .min(1, "المسافة يجب أن تكون 1 على الأقل")
    .max(500, "المسافة الأقصى 500 كم")
    .optional()
    .default(50),
  searchQuery: z
    .string()
    .max(100, "نص البحث طويل جداً")
    .optional(),
})

export type PharmacySearchInput = z.infer<typeof pharmacySearchSchema>

// ============================================================================
// PRESCRIPTION SCHEMAS
// ============================================================================

/**
 * Prescription submission validation schema
 * Supports text notes and optional file IDs from Supabase storage
 */
export const prescriptionSubmissionSchema = z.object({
  // Core prescription data
  medicineNames: z
    .string()
    .max(500, "أسماء الأدوية طويلة جداً")
    .optional()
    .or(z.literal("")),
  
  // Notes or dosage instructions
  notes: z
    .string()
    .max(1000, "الملاحظات طويلة جداً")
    .optional()
    .or(z.literal("")),
  
  // Optional file IDs from Supabase storage
  // Format: "bucket/path/filename.ext" returned from upload
  prescriptionImageIds: z
    .array(
      z.string().regex(/^[a-zA-Z0-9\-_.\/]+$/, "معرف الملف غير صحيح")
    )
    .max(5, "يمكنك رفع 5 صور كحد أقصى")
    .optional()
    .default([]),
  
  // Pharmacy selection (optional - can submit to all nearby)
  targetPharmacyId: z
    .string()
    .uuid("معرف الصيدلية غير صحيح")
    .optional(),
  
  // Notes to include with submission
  patientNotes: z
    .string()
    .max(500, "ملاحظات المريض طويلة جداً")
    .optional()
    .or(z.literal("")),
})

export type PrescriptionSubmissionInput = z.infer<typeof prescriptionSubmissionSchema>

// ============================================================================
// UTILITY FUNCTIONS FOR ERROR HANDLING
// ============================================================================

/**
 * Extract first error message from Zod validation result
 * Returns Arabic error message suitable for displaying to user
 */
export function getFirstErrorMessage(
  errors: z.ZodIssue[] | undefined
): string {
  if (!errors || errors.length === 0) {
    return "حدث خطأ في التحقق من البيانات"
  }
  // Return the first error message (already in Arabic)
  return errors[0].message || "حدث خطأ في التحقق من البيانات"
}

/**
 * Format validation result for server response
 * Usage: return { success: false, ...formatValidationError(result) }
 */
export function formatValidationError(result: any) {
  if (result.success) {
    return { error: null, data: result.data }
  }
  return {
    error: getFirstErrorMessage(result.error.issues),
    issues: result.error.issues.map((issue: z.ZodIssue) => ({
      field: issue.path.join("."),
      message: issue.message,
    })),
  }
}

// ============================================================================
// SCHEMA EXPORT SUMMARY
// ============================================================================
/**
 * Available schemas:
 *
 * Authentication:
 *   - loginSchema: Validates email (valid format) and password (min 6 chars)
 *   - registerSchema: Validates email, password (min 8 chars), password match, role
 *
 * Search:
 *   - medicineSearchSchema: Validates search query (1-100 chars), limit (1-100)
 *   - pharmacySearchSchema: Validates lat/lon, maxDistance, optional query
 *
 * Prescription:
 *   - prescriptionSubmissionSchema: Validates medicine names, notes, file IDs, pharmacy selection
 *
 * Usage pattern in Server Actions:
 *   1. import { loginSchema } from "@/lib/validation"
 *   2. const result = loginSchema.safeParse(input)
 *   3. if (!result.success) return { error: getFirstErrorMessage(result.error.issues) }
 *   4. const validData = result.data
 *   5. Proceed with authenticated operation
 */
