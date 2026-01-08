import { createBrowserClient } from '@supabase/ssr'

/**
 * Get public URL for an image stored in Supabase Storage
 * @param bucketName - The name of the storage bucket
 * @param filePath - The path to the file in the bucket
 * @returns The public URL of the image
 */
export function getImageUrl(bucketName: string, filePath: string): string {
  if (!filePath) return ''
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath)
  return data.publicUrl
}

/**
 * Get prescription image URL
 * @param imagePath - The path to the prescription image
 * @returns The public URL of the prescription image
 */
export function getPrescriptionImageUrl(imagePath: string): string {
  return getImageUrl('prescriptions', imagePath)
}

/**
 * Get pharmacy logo URL
 * @param logoPath - The path to the pharmacy logo
 * @returns The public URL of the pharmacy logo
 */
export function getPharmacyLogoUrl(logoPath: string): string {
  return getImageUrl('pharmacy-logos', logoPath)
}

/**
 * Get medicine image URL
 * @param imagePath - The path to the medicine image
 * @returns The public URL of the medicine image
 */
export function getMedicineImageUrl(imagePath: string): string {
  return getImageUrl('medicines', imagePath)
}
