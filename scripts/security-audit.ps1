# ================================
# Security Audit Script (PowerShell)
# ================================

Write-Host "🔒 Running Security Audit for Duaiii..." -ForegroundColor Cyan
Write-Host ""

# Check 1: npm audit
Write-Host "📦 Checking npm dependencies for vulnerabilities..." -ForegroundColor Yellow
npm audit --audit-level=moderate | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ No moderate or higher vulnerabilities found" -ForegroundColor Green
} else {
    Write-Host "❌ Vulnerabilities found! Run 'npm audit fix' to resolve" -ForegroundColor Red
}
Write-Host ""

# Check 2: Environment files
Write-Host "📄 Checking environment files..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local exists" -ForegroundColor Green
    
    if (Select-String -Path ".gitignore" -Pattern ".env.local" -Quiet) {
        Write-Host "✅ .env.local is in .gitignore" -ForegroundColor Green
    } else {
        Write-Host "❌ .env.local is NOT in .gitignore!" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  .env.local not found" -ForegroundColor Yellow
}
Write-Host ""

# Check 3: HTTPS enforcement
Write-Host "🔐 Checking HTTPS configuration..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    if (Select-String -Path ".env.local" -Pattern "NEXT_PUBLIC_SITE_URL=https" -Quiet) {
        Write-Host "✅ HTTPS configured in production URL" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Production URL should use HTTPS" -ForegroundColor Yellow
    }
}
Write-Host ""

# Check 4: TypeScript strict mode
Write-Host "📝 Checking TypeScript configuration..." -ForegroundColor Yellow
if (Test-Path "tsconfig.json") {
    if (Select-String -Path "tsconfig.json" -Pattern '"strict": true' -Quiet) {
        Write-Host "✅ TypeScript strict mode enabled" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Consider enabling TypeScript strict mode" -ForegroundColor Yellow
    }
}
Write-Host ""

# Check 5: Middleware security
Write-Host "🛡️  Checking security middleware..." -ForegroundColor Yellow
if ((Test-Path "middleware.ts") -or (Test-Path "middleware-security.ts")) {
    Write-Host "✅ Security middleware found" -ForegroundColor Green
} else {
    Write-Host "❌ No security middleware found" -ForegroundColor Red
}
Write-Host ""

# Check 6: Security headers in Next.js config
Write-Host "🔧 Checking Next.js security configuration..." -ForegroundColor Yellow
if (Test-Path "next.config.js") {
    if (Select-String -Path "next.config.js" -Pattern "headers\(\)" -Quiet) {
        Write-Host "✅ Security headers configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Consider adding security headers in next.config.js" -ForegroundColor Yellow
    }
}
Write-Host ""

# Check 7: Rate limiting
Write-Host "⏱️  Checking rate limiting..." -ForegroundColor Yellow
$rateLimitFiles = Get-ChildItem -Path "app/api" -Recurse -Filter "*.ts" -ErrorAction SilentlyContinue | 
    Select-String -Pattern "rate.limit|rateLimit" -List
if ($rateLimitFiles) {
    Write-Host "✅ Rate limiting implemented" -ForegroundColor Green
} else {
    Write-Host "⚠️  Consider implementing rate limiting" -ForegroundColor Yellow
}
Write-Host ""

# Check 8: Input validation
Write-Host "✔️  Checking input validation..." -ForegroundColor Yellow
$validationFiles = Get-ChildItem -Path . -Recurse -Include "*.ts","*.tsx" -ErrorAction SilentlyContinue | 
    Select-String -Pattern "zod|joi|yup" -List | Select-Object -First 1
if ($validationFiles) {
    Write-Host "✅ Input validation library found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Consider using input validation (Zod, Joi, etc.)" -ForegroundColor Yellow
}
Write-Host ""

# Check 9: Authentication
Write-Host "🔐 Checking authentication..." -ForegroundColor Yellow
$authFiles = Get-ChildItem -Path "app" -Recurse -Filter "*.ts*" -ErrorAction SilentlyContinue | 
    Select-String -Pattern "supabase.auth|NextAuth" -List | Select-Object -First 1
if ($authFiles) {
    Write-Host "✅ Authentication implemented" -ForegroundColor Green
} else {
    Write-Host "❌ No authentication system found" -ForegroundColor Red
}
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "🎯 Security Audit Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Recommendations:" -ForegroundColor Yellow
Write-Host "  1. Run 'npm audit fix' regularly"
Write-Host "  2. Keep dependencies up to date"
Write-Host "  3. Review and rotate API keys periodically"
Write-Host "  4. Enable security headers in production"
Write-Host "  5. Implement rate limiting on all public APIs"
Write-Host "  6. Use HTTPS in production"
Write-Host "  7. Enable Sentry for error tracking"
Write-Host ""
