# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Monorepo restructure with organized directory structure
- Workspace configuration for better dependency management
- Makefile for common development commands
- Comprehensive CONTRIBUTING.md guide
- Organized documentation structure

### Changed
- Moved backend and frontend to `apps/` directory
- Organized backend scripts into categorized subdirectories
- Restructured documentation into logical categories
- Consolidated infrastructure configurations

## [1.0.0] - 2026-05-09

### Added
- Initial release
- FastAPI backend with Supabase integration
- Next.js frontend with role-based dashboards
- Restaurant and Supplier management
- Inventory tracking system
- Order management
- Sales analytics
- POS integration
- Authentication and authorization
- Database migrations with Prisma
- Comprehensive test suite
- Observability with Prometheus and Grafana
- CI/CD pipelines
- Deployment configurations for Render and Vercel

### Security
- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting
- CSRF protection
- Input validation and sanitization
- Secure password handling

---

## Release Types

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability fixes

## Version Format

- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): New features, backwards compatible
- **Patch** (0.0.X): Bug fixes, backwards compatible
