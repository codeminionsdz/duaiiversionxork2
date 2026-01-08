#!/bin/bash

# ================================
# Security Audit Script
# ================================

echo "🔒 Running Security Audit for Duaiii..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check 1: npm audit
echo "📦 Checking npm dependencies for vulnerabilities..."
if npm audit --audit-level=moderate; then
    echo -e "${GREEN}✅ No moderate or higher vulnerabilities found${NC}"
else
    echo -e "${RED}❌ Vulnerabilities found! Run 'npm audit fix' to resolve${NC}"
fi
echo ""

# Check 2: Check for exposed secrets
echo "🔑 Checking for exposed secrets..."
if command -v git &> /dev/null; then
    if git log --all --pretty=format: -S "password" -S "secret" -S "api_key" | head -1 | grep -q .; then
        echo -e "${YELLOW}⚠️  Potential secrets found in git history${NC}"
    else
        echo -e "${GREEN}✅ No obvious secrets in git history${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Git not found, skipping secret check${NC}"
fi
echo ""

# Check 3: Environment files
echo "📄 Checking environment files..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local exists${NC}"
    
    # Check if .env.local is in .gitignore
    if grep -q ".env.local" .gitignore 2>/dev/null; then
        echo -e "${GREEN}✅ .env.local is in .gitignore${NC}"
    else
        echo -e "${RED}❌ .env.local is NOT in .gitignore!${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env.local not found${NC}"
fi
echo ""

# Check 4: HTTPS enforcement
echo "🔐 Checking HTTPS configuration..."
if grep -q "NEXT_PUBLIC_SITE_URL=https" .env.local 2>/dev/null; then
    echo -e "${GREEN}✅ HTTPS configured in production URL${NC}"
else
    echo -e "${YELLOW}⚠️  Production URL should use HTTPS${NC}"
fi
echo ""

# Check 5: TypeScript strict mode
echo "📝 Checking TypeScript configuration..."
if grep -q '"strict": true' tsconfig.json 2>/dev/null; then
    echo -e "${GREEN}✅ TypeScript strict mode enabled${NC}"
else
    echo -e "${YELLOW}⚠️  Consider enabling TypeScript strict mode${NC}"
fi
echo ""

# Check 6: Middleware security
echo "🛡️  Checking security middleware..."
if [ -f "middleware.ts" ] || [ -f "middleware-security.ts" ]; then
    echo -e "${GREEN}✅ Security middleware found${NC}"
else
    echo -e "${RED}❌ No security middleware found${NC}"
fi
echo ""

# Check 7: Security headers in Next.js config
echo "🔧 Checking Next.js security configuration..."
if grep -q "headers()" next.config.js 2>/dev/null; then
    echo -e "${GREEN}✅ Security headers configured${NC}"
else
    echo -e "${YELLOW}⚠️  Consider adding security headers in next.config.js${NC}"
fi
echo ""

# Check 8: Rate limiting
echo "⏱️  Checking rate limiting..."
if grep -rq "rate.limit\|rateLimit" app/api 2>/dev/null; then
    echo -e "${GREEN}✅ Rate limiting implemented${NC}"
else
    echo -e "${YELLOW}⚠️  Consider implementing rate limiting${NC}"
fi
echo ""

# Check 9: Input validation
echo "✔️  Checking input validation..."
if grep -rq "zod\|joi\|yup" . --include="*.ts" --include="*.tsx" 2>/dev/null; then
    echo -e "${GREEN}✅ Input validation library found${NC}"
else
    echo -e "${YELLOW}⚠️  Consider using input validation (Zod, Joi, etc.)${NC}"
fi
echo ""

# Check 10: Authentication
echo "🔐 Checking authentication..."
if grep -rq "supabase.auth\|NextAuth" app 2>/dev/null; then
    echo -e "${GREEN}✅ Authentication implemented${NC}"
else
    echo -e "${RED}❌ No authentication system found${NC}"
fi
echo ""

echo "================================"
echo "🎯 Security Audit Complete!"
echo "================================"
echo ""
echo "📋 Recommendations:"
echo "  1. Run 'npm audit fix' regularly"
echo "  2. Keep dependencies up to date"
echo "  3. Review and rotate API keys periodically"
echo "  4. Enable security headers in production"
echo "  5. Implement rate limiting on all public APIs"
echo "  6. Use HTTPS in production"
echo "  7. Enable Sentry for error tracking"
echo ""
