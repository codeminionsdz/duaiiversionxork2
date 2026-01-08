import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getClientIP, checkRateLimit, RATE_LIMIT_CONFIG } from "@/lib/rate-limit";

// ============================================================================
// SUPABASE ADMIN CLIENT (SERVER-ONLY)
// Uses SERVICE_ROLE_KEY to bypass RLS for auth creation and profile insertion
// ============================================================================
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing Supabase environment variables");
}

const supabaseAdmin = createClient(SUPABASE_URL || "", SUPABASE_SERVICE_ROLE_KEY || "", {
  auth: { persistSession: false },
});

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================
const pharmacySchema = z.object({
  pharmacy_name: z.string().optional().nullable(),
  license_number: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
});

const registerSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    full_name: z.string().min(1, "Full name required"),
    phone: z.string().optional().nullable(),
    role: z.enum(["user", "pharmacy", "admin"]).optional().default("user"),
    pharmacy: pharmacySchema.optional(),
  })
  .superRefine((val, ctx) => {
    if (val.role === "pharmacy" && !val.pharmacy) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Pharmacy details required for pharmacy accounts",
        path: ["pharmacy"],
      });
    }
  });

export async function POST(req: NextRequest) {
  try {
    // Apply rate limiting
    const ip = getClientIP()
    const rateLimitConfig = RATE_LIMIT_CONFIG.auth
    const rateLimitResult = checkRateLimit(ip, rateLimitConfig)

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: rateLimitConfig.errorMessage },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter),
          },
        }
      )
    }

    // Step 1: Validate environment
    console.log("🔑 Environment check:");
    console.log("  NEXT_PUBLIC_SUPABASE_URL:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("  SUPABASE_SERVICE_ROLE_KEY:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ Environment variables missing");
      Sentry.captureMessage('Missing Supabase environment variables', 'error')
      return NextResponse.json(
        { error: "Server misconfiguration" },
        { status: 500 }
      );
    }

    // Step 2: Parse and validate request body
    const body = await req.json();
    let parsed: z.infer<typeof registerSchema>;

    try {
      parsed = registerSchema.parse(body);
    } catch (validationErr: any) {
      console.error("❌ Validation error:", validationErr);
      Sentry.captureException(validationErr, {
        tags: {
          component: 'auth-register-validation',
        },
      })
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationErr.errors?.[0]?.message || "Invalid input",
        },
        { status: 422 }
      );
    }

    const role = parsed.role ?? "user";

    // Step 3: CREATE AUTH USER (using service role)
    console.log(`📝 Creating auth user for ${parsed.email}...`);
    console.log(`   Password length: ${parsed.password.length}`);
    console.log(`   Service role key length: ${SUPABASE_SERVICE_ROLE_KEY?.length}`);
    
    const { data: createData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: parsed.email,
      password: parsed.password,
      email_confirm: true, // ✅ Auto-confirm email to allow immediate login
      user_metadata: {
        full_name: parsed.full_name,
        phone: parsed.phone ?? null,
        role, // Include role so trigger can create profile with correct role
      },
    });

    if (authError || !createData?.user?.id) {
      console.error("❌ Auth creation failed!");
      console.error("   Error name:", authError?.name);
      console.error("   Error status:", authError?.status);
      console.error("   Error code:", authError?.code);
      console.error("   Error message:", authError?.message);
      console.error("   Full error:", JSON.stringify(authError, null, 2));
      
      // Log to Sentry
      Sentry.captureException(authError, {
        tags: {
          component: 'auth-register-user-creation',
          email: parsed.email,
        },
      })
      
      // Check if email already exists
      if (authError?.message?.includes("already registered") || authError?.message?.includes("already exists")) {
        return NextResponse.json(
          {
            error: "البريد الإلكتروني مستخدم بالفعل",
            details: "هذا البريد الإلكتروني مسجل مسبقاً",
            debug: { message: authError?.message }
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        {
          error: "Failed to create account",
          details: authError?.message || "Unknown auth error",
          debug: {
            status: (authError as any)?.status,
            code: (authError as any)?.code,
            fullError: authError
          },
        },
        { status: 400 }
      );
    }

    const userId = createData.user.id;
    console.log(`✅ Auth user created: ${userId}`);

    // Step 4: CREATE PROFILE directly using service role (bypass RLS)
    console.log(`📊 Creating profile directly...`);
    
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        full_name: parsed.full_name,
        phone: parsed.phone ?? null,
        role: role,
      });

    if (profileError) {
      console.error("❌ Profile creation failed:", profileError);
      console.error("❌ Profile error code:", profileError?.code);
      console.error("❌ Profile error details:", profileError?.details);
      console.error("❌ Profile error message:", profileError?.message);
      
      // Log to Sentry
      Sentry.captureException(profileError, {
        tags: {
          component: 'auth-register-profile-creation',
          userId: userId,
        },
      })
      
      // Rollback auth user
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId);
        console.log(`✅ Rollback successful`);
      } catch (rbErr) {
        console.error("❌ Rollback failed:", rbErr);
        Sentry.captureException(rbErr, {
          tags: {
            component: 'auth-register-rollback',
          },
        })
      }

      const errorMessage = profileError?.message || "Failed to create profile";
      
      return NextResponse.json(
        {
          error: "خطأ في إنشاء الحساب",
          details: errorMessage,
          debug: { 
            code: profileError?.code, 
            message: profileError?.message,
            details: profileError?.details 
          },
        },
        { status: 500 }
      );
    }

    console.log(`✅ Profile created`);

    // Step 5: CREATE PHARMACY PROFILE (if pharmacy role)
    if (role === "pharmacy") {
      const pharmacyPayload = parsed.pharmacy || {};
      console.log(`💊 Creating pharmacy profile for ${userId}...`);

      const pharmPayload = {
        id: userId,
        pharmacy_name: pharmacyPayload.pharmacy_name ?? parsed.full_name,
        license_number: pharmacyPayload.license_number ?? null,
        address: pharmacyPayload.address ?? null,
        latitude: pharmacyPayload.latitude ?? null,
        longitude: pharmacyPayload.longitude ?? null,
      };

      const { data: pharmData, error: pharmError } = await supabaseAdmin
        .from("pharmacy_profiles")
        .insert(pharmPayload)
        .select()
        .single();

      if (pharmError) {
        console.error("❌ Pharmacy profile insert failed:", pharmError);
        console.error("❌ Pharmacy error code:", pharmError?.code);
        console.error("❌ Pharmacy error details:", pharmError?.details);
        console.error("❌ Pharmacy error message:", pharmError?.message);
        console.error("🔍 Pharmacy payload:", pharmPayload);
        
        // Log to Sentry
        Sentry.captureException(pharmError, {
          tags: {
            component: 'auth-register-pharmacy-creation',
            userId: userId,
          },
        })
        
        // Rollback if pharmacy profile creation fails
        try {
          await supabaseAdmin.from("profiles").delete().eq("id", userId);
          await supabaseAdmin.auth.admin.deleteUser(userId);
        } catch (rbErr) {
          console.error("❌ Rollback failed:", rbErr);
          Sentry.captureException(rbErr, {
            tags: {
              component: 'auth-register-rollback-pharmacy',
            },
          })
        }

        return NextResponse.json(
          {
            error: "Failed to create pharmacy profile",
            details: (pharmError as any)?.message || "Database error",
            debug: {
              code: pharmError?.code,
              message: pharmError?.message,
              details: pharmError?.details,
            }
          },
          { status: 400 }
        );
      }

      console.log(`✅ Pharmacy profile created successfully`);
    }

    // Step 6: SUCCESS
    console.log(`✅✅ Registration complete for ${parsed.email}`);
    
    const response = NextResponse.json(
      {
        ok: true,
        message: "Account created successfully",
        userId,
        role,
      },
      { status: 201 }
    )

    // Add rate limit info to response headers
    response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining))
    response.headers.set('X-RateLimit-Limit', String(rateLimitConfig.maxRequests))

    return response
  } catch (err: any) {
    console.error("❌ Unexpected error:", err);
    
    // Log to Sentry
    Sentry.captureException(err, {
      tags: {
        component: 'auth-register',
      },
    })
    
    const isProduction = process.env.NODE_ENV === "production";
    return NextResponse.json(
      {
        error: "Internal server error",
        details: err?.message || "Unknown error",
        ...(isProduction ? {} : { debug: err }),
      },
      { status: 500 }
    );
  }
}
