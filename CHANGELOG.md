# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Docker support with multi-stage builds
- Comprehensive README.md
- Health check API endpoint
- Additional test suites (auth, distance, pharmacies)
- Enhanced CI/CD pipeline with security audits
- Docker Compose for development and production
- Contributing guidelines
- npm scripts for Docker operations

### Changed
- Improved CI/CD workflow with multiple jobs
- Enhanced testing coverage
- Better project documentation structure

### Fixed
- Missing Docker configuration files
- Incomplete test coverage

## [1.5.0] - 2024-12-XX

### Added
- PWA support with offline capabilities
- Push notifications system
- Analytics dashboard
- Admin panel with statistics
- Distance-based pharmacy filtering (50km radius)
- Interactive map with pharmacy markers
- Rate limiting on API endpoints
- Firebase integration for notifications
- Sentry error tracking
- VAPID keys for web push

### Changed
- Updated authentication flow
- Improved prescription upload process
- Enhanced pharmacy dashboard
- Better mobile responsiveness

### Fixed
- Pharmacy icons rendering on map
- Distance calculation accuracy (1.2x correction)
- Map freedom of movement
- Authentication triggers
- Analytics data display
- Prescription images loading

## [1.0.0] - 2024-XX-XX

### Added
- Initial release
- User authentication (patients and pharmacies)
- Prescription upload functionality
- Pharmacy management
- Order tracking system
- Favorites system
- Profile management
- Medicine catalog
- Supabase database integration
- Next.js 14 App Router
- TypeScript support
- Tailwind CSS styling
- Radix UI components

---

## Version Guidelines

### Major Version (X.0.0)
- Breaking changes
- Major architecture changes
- Database schema changes that require migration

### Minor Version (0.X.0)
- New features
- Non-breaking changes
- New API endpoints
- UI improvements

### Patch Version (0.0.X)
- Bug fixes
- Performance improvements
- Documentation updates
- Minor UI fixes

---

## Upgrade Notes

### From 1.0.0 to 1.5.0

**Database Changes:**
```sql
-- Run scripts/021_add_pwa_analytics.sql
```

**Environment Variables:**
```bash
# Add to .env.local:
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_key
VAPID_PRIVATE_KEY=your_key
```

**Dependencies:**
```bash
npm install web-push
```

---

For more details on any release, see the [releases page](https://github.com/codeminionsdz/duaii/releases).
