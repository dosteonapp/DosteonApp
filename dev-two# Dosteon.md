# Dosteon

> Modern supply chain management platform connecting restaurants and suppliers

[![License](https://img.shields.io/badge/license-UNLICENSED-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![Python](https://img.shields.io/badge/python-%3E%3D3.11-blue.svg)](https://www.python.org)

Dosteon is a comprehensive dashboard platform supporting role-based interaction for **Restaurants** and **Suppliers**, streamlining inventory management, orders, and analytics.

## ✨ Features

- 🏪 **Restaurant Management** - Inventory tracking, order management, and analytics
- 📦 **Supplier Portal** - Product catalog, order fulfillment, and customer insights
- 📊 **Real-time Analytics** - Sales tracking, forecasting, and performance metrics
- 🔐 **Secure Authentication** - Role-based access control with Supabase
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🔄 **POS Integration** - Connect with existing point-of-sale systems
- 📈 **Observability** - Built-in monitoring with Prometheus and Grafana

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- Python >= 3.11
- PostgreSQL (or Supabase account)

### One-Command Setup

```bash
# Clone the repository
git clone https://github.com/dosteonapp/DosteonApp.git
cd DosteonApp

# 1. Install all dependencies and set up the project (includes virtualenv and prisma)
make setup

# 2. Configure environment variables
# Copy .env.example files to their active locations
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local

# 3. Edit the .env files
# Ensure you use the Staging project credentials (uthliwmewwlfjlbskilw)
# for development to avoid breaking production schema.

# 4. Verify your setup
make verify-supabase

# 5. Start development servers (backend + frontend)
make dev
```

- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

### Manual Setup

If you prefer step-by-step setup:

```bash
# 1. Install dependencies
npm install

# 2. Set up backend
cd apps/backend
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
npm install
PATH="$PWD/.venv/bin:$PATH" .venv/bin/python -m prisma generate

# 3. Set up frontend
cd ../frontend
npm install --legacy-peer-deps

# 4. Configure environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
# Edit the .env files with your credentials

# 5. Run database migrations
cd apps/backend
.venv/bin/prisma migrate dev

# 6. Start development
cd ../..
make dev
```

## 📁 Project Structure

```
dosteon/
├── apps/
│   ├── backend/          # FastAPI backend application
│   │   ├── app/          # Application code (API, services, schemas)
│   │   ├── scripts/      # Utility scripts (db, seed, user management)
│   │   ├── prisma/       # Database schema and migrations
│   │   └── tests/        # Backend tests
│   └── frontend/         # Next.js frontend application
│       ├── app/          # App router pages and layouts
│       ├── components/   # Reusable React components
│       ├── lib/          # Utilities and helpers
│       └── tests/        # Frontend tests
├── docs/                 # Documentation
│   ├── architecture/     # System architecture docs
│   ├── development/      # Development guides
│   ├── deployment/       # Deployment instructions
│   └── api/             # API documentation
├── infra/               # Infrastructure as code
│   ├── docker/          # Docker configurations
│   └── observability/   # Monitoring and logging
├── packages/            # Shared packages (future)
└── tests/               # Cross-cutting integration tests
```

## 🛠️ Development

### Available Commands

```bash
make help          # Show all available commands
make dev           # Start development servers (Next.js + FastAPI)
make setup         # Initial setup and dependency installation
make build         # Build all applications
make test          # Run all tests
make lint          # Run linters

# Database commands
make db-migrate    # Run database migrations (Prisma)
make db-generate   # Re-generate Prisma client
make db-seed       # Seed database with sample data
make db-studio     # Open Prisma Studio

# Maintenance & Verification
make verify-supabase # Check connection to Supabase and database health
make check-db      # Verify database connection and models
make check-profiles # Validate user profiles in the DB

# Individual services
make dev-backend   # Start backend only (Port 8000)
make dev-frontend  # Start frontend only (Port 3000)
```

### Tech Stack

**Backend:**
- FastAPI - Modern Python web framework
- Prisma - Type-safe database ORM
- Supabase - Authentication and database
- PostgreSQL - Primary database
- Prometheus - Metrics and monitoring

**Frontend:**
- Next.js 15 - React framework with App Router
- TypeScript - Type-safe JavaScript
- TailwindCSS - Utility-first CSS
- Radix UI - Accessible component primitives
- TanStack Query - Data fetching and caching

**Infrastructure:**
- Docker - Containerization
- GitHub Actions - CI/CD
- Render - Backend hosting
- Vercel - Frontend hosting

## 📚 Documentation

- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute to the project
- **[Architecture](./docs/architecture/)** - System design and architecture
- **[API Documentation](./docs/api/)** - API endpoints and usage
- **[Development Guide](./docs/development/)** - Development workflows and best practices
- **[Deployment Guide](./docs/deployment/)** - How to deploy to production

## 🧪 Testing

```bash
# Run all tests
make test

# Backend tests
make test-backend

# Frontend tests
make test-frontend

# E2E tests
cd apps/frontend && npm run test:e2e
```

## 🚢 Deployment

### Backend (Render)

```bash
# Deploy to staging
git push origin develop

# Deploy to production
git push origin main
```

### Frontend (Vercel)

The frontend automatically deploys on push to `main` and `develop` branches.

See [Deployment Documentation](./docs/deployment/) for detailed instructions.

## 🔒 Security

- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting on API endpoints
- CSRF protection
- Input validation and sanitization
- Secure password handling with bcrypt

For security concerns, please see [SECURITY.md](./docs/compliance/SECURITY.md).

## 📊 Monitoring

Access monitoring dashboards:

```bash
# Start observability stack
make docker-up

# Access dashboards
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`make test`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 License

This project is UNLICENSED - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Built with ❤️ by the Dosteon team.

## 📞 Support

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/dosteonapp/DosteonApp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/dosteonapp/DosteonApp/discussions)

---

**[⬆ back to top](#dosteon)**
