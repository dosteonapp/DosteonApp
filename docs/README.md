# Dosteon Documentation

Welcome to the Dosteon documentation! This directory contains comprehensive documentation for the entire platform.

## 📚 Documentation Structure

### [Architecture](./architecture/)
System design, technical architecture, and infrastructure documentation.

- [Backend Architecture](./architecture/backend.md) - FastAPI backend design
- [System Overview](./architecture/System%20overview.md) - High-level system architecture
- [Network Integration](./architecture/NETWORK_INTEGRATION.md) - Network architecture
- [Inventory System](./architecture/inventory.md) - Inventory management design
- [Supabase Integration](./architecture/supabase.md) - Database and auth setup
- [Integration Patterns](./architecture/integration.md) - Service integration patterns

### [Development](./development/)
Guides for developers working on the codebase.

- [Workflow Guide](./development/WORKFLOW.md) - Development workflow and best practices
- [Environment Setup](./development/ENVIRONMENT.md) - Environment configuration
- [Test Checklist](./development/TEST_CHECKLIST.md) - Testing guidelines
- [MVP Roadmap](./development/MVP_ROADMAP.md) - Product roadmap
- [MVP Scope](./development/MVP_SCOPE.md) - Feature scope
- [Legacy Features](./development/LEGACY_FEATURE_CATALOG.md) - Deprecated features
- [Restaurant Baseline](./development/RESTAURANT_BASELINE_MAP.md) - Restaurant feature map

### [Deployment](./deployment/)
Instructions for deploying to various environments.

- [Deployment Guide](./deployment/DEPLOYMENT.md) - General deployment instructions
- [Render Deployment](./deployment/render.md) - Deploy backend to Render
- [Vercel Deployment](./deployment/vercel.md) - Deploy frontend to Vercel
- [Staging Environment](./deployment/staging.md) - Staging setup

### [Features](./features/)
Documentation for specific features and functionality.

- [Onboarding Flow](./features/onboarding.md) - User onboarding process
- [Registration](./features/registration.md) - User registration
- [Rate Limiting](./features/rate.md) - API rate limiting
- [Candidate Features](./features/candidate.md) - Proposed features
- [First Release](./features/first.md) - Initial release features
- [Summary](./features/summary.md) - Feature summary

### [Operations](./operations/)
Operational guides for running and maintaining the platform.

- [Runbooks](./operations/RUNBOOKS.md) - Operational procedures
- [SLOs](./operations/SLOs.md) - Service level objectives
- [Monitoring](../infra/observability/) - Monitoring and alerting setup

### [Compliance](./compliance/)
Security, privacy, and compliance documentation.

- [Security](./compliance/SECURITY.md) - Security policies and practices
- [Data Policy](./compliance/DATA_POLICY.md) - Data handling and privacy
- [Compliance Baseline](./compliance/COMPLIANCE_BASELINE.md) - Compliance requirements

### [Decisions](./decisions/)
Architecture Decision Records (ADRs) documenting important technical decisions.

- [Decision Log](./decisions/DECISIONS.md) - All architectural decisions

### [API](./api/)
API documentation and specifications.

- [Deprecated Routes](./api/_deprecated_routes.md) - Deprecated API endpoints

## 🚀 Quick Links

### For New Developers
1. Start with [System Overview](./architecture/System%20overview.md)
2. Read [Development Workflow](./development/WORKFLOW.md)
3. Follow [Environment Setup](./development/ENVIRONMENT.md)
4. Review [Test Checklist](./development/TEST_CHECKLIST.md)

### For DevOps/SRE
1. Review [Deployment Guide](./deployment/DEPLOYMENT.md)
2. Check [Runbooks](./operations/RUNBOOKS.md)
3. Understand [SLOs](./operations/SLOs.md)
4. Set up [Monitoring](../infra/observability/)

### For Product/Business
1. Read [MVP Scope](./development/MVP_SCOPE.md)
2. Review [MVP Roadmap](./development/MVP_ROADMAP.md)
3. Check [Feature Documentation](./features/)

### For Security/Compliance
1. Review [Security Policy](./compliance/SECURITY.md)
2. Read [Data Policy](./compliance/DATA_POLICY.md)
3. Check [Compliance Baseline](./compliance/COMPLIANCE_BASELINE.md)

## 📝 Contributing to Documentation

When adding or updating documentation:

1. **Choose the right location** based on the categories above
2. **Use clear, descriptive filenames** (e.g., `user-authentication.md`)
3. **Include a table of contents** for longer documents
4. **Add diagrams** where helpful (use Mermaid or images)
5. **Keep it up to date** - update docs when code changes
6. **Link related docs** to help readers navigate

### Documentation Standards

- Use Markdown format
- Include code examples where relevant
- Add diagrams for complex concepts
- Keep language clear and concise
- Update the changelog when making significant changes

## 🔍 Finding Information

Can't find what you're looking for? Try:

1. **Search the repository** - Use GitHub's search or `grep`
2. **Check the main README** - [../README.md](../README.md)
3. **Review CONTRIBUTING.md** - [../CONTRIBUTING.md](../CONTRIBUTING.md)
4. **Ask the team** - Open a GitHub Discussion

## 📊 Documentation Health

We strive to keep documentation:
- ✅ **Accurate** - Reflects current implementation
- ✅ **Complete** - Covers all major features
- ✅ **Accessible** - Easy to find and understand
- ✅ **Maintained** - Regularly updated

## 🆘 Need Help?

- **For code questions**: Check [Development](./development/) docs
- **For deployment issues**: See [Deployment](./deployment/) docs
- **For operational problems**: Consult [Runbooks](./operations/RUNBOOKS.md)
- **For security concerns**: Review [Security](./compliance/SECURITY.md) docs

---

**Last Updated**: 2026-05-09
