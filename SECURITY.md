# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.5.x   | :white_check_mark: |
| 1.0.x   | :x:                |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of Duaiii seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Where to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please email us at: **security@duaii.com**

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

### What to Include

Please include the following information in your report:

- Type of issue (e.g., SQL injection, XSS, authentication bypass)
- Full paths of source file(s) related to the issue
- Location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Our Commitment

- We will acknowledge your email within 48 hours
- We will provide a detailed response within 7 days
- We will keep you informed about our progress
- We will credit you in our security advisory (unless you prefer to remain anonymous)

## Security Measures

Duaiii implements the following security measures:

### Authentication & Authorization
- JWT-based authentication via Supabase
- Row Level Security (RLS) on all database tables
- Role-based access control (Patient, Pharmacy, Admin)
- Secure password hashing

### Data Protection
- HTTPS only in production
- Encrypted data transmission
- Secure cookie flags (HttpOnly, Secure, SameSite)
- Input validation using Zod schemas

### API Security
- Rate limiting on all API endpoints
- CSRF protection
- SQL injection prevention via parameterized queries
- XSS protection via Content Security Policy

### Infrastructure
- Regular dependency updates
- Security headers (HSTS, CSP, X-Frame-Options, etc.)
- Environment variable protection
- Secure file upload handling

### Monitoring
- Error tracking with Sentry
- Audit logging for sensitive operations
- Performance monitoring
- Suspicious activity alerts

## Best Practices for Users

### For Developers
- Keep dependencies up to date
- Use environment variables for secrets
- Never commit sensitive data
- Follow secure coding guidelines
- Run security audits regularly

### For Users
- Use strong passwords
- Enable two-factor authentication (when available)
- Don't share your credentials
- Log out from shared devices
- Report suspicious activity

## Security Updates

We will publish security updates through:
- GitHub Security Advisories
- Release notes in CHANGELOG.md
- Email notifications to registered users (for critical issues)

## Compliance

Duaiii aims to comply with:
- OWASP Top 10 security guidelines
- GDPR data protection requirements (where applicable)
- Healthcare data protection standards

## Contact

For security-related questions or concerns:
- Email: security@duaii.com
- Emergency: Use the same email with "URGENT" in subject

---

Last Updated: January 4, 2026
