# Contributing to Dosteon

Thank you for your interest in contributing to Dosteon! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **Python** >= 3.11
- **Git**
- **PostgreSQL** (or Supabase account)

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/dosteonapp/DosteonApp.git
cd DosteonApp

# Run setup (installs all dependencies)
make setup

# Start development servers
make dev
```

## 🛠️ Development Setup

### Detailed Setup Steps

1. **Install Dependencies**
   ```bash
   make setup
   ```

2. **Configure Environment Variables**
   
   Backend (`apps/backend/.env`):
   ```bash
   cp apps/backend/.env.example apps/backend/.env
   # Edit apps/backend/.env with your Supabase credentials
   ```
   
   Frontend (`apps/frontend/.env.local`):
   ```bash
   cp apps/frontend/.env.example apps/frontend/.env.local
   # Edit apps/frontend/.env.local with your configuration
   ```

3. **Run Database Migrations**
   ```bash
   make db-migrate
   ```

4. **Seed Database (Optional)**
   ```bash
   make db-seed
   ```

5. **Start Development**
   ```bash
   make dev
   ```

   Or start services individually:
   ```bash
   make dev-backend  # Backend only (port 8000)
   make dev-frontend # Frontend only (port 3000)
   ```

## 📁 Project Structure

```
dosteon/
├── apps/
│   ├── backend/          # FastAPI backend
│   │   ├── app/          # Application code
│   │   ├── scripts/      # Utility scripts
│   │   ├── prisma/       # Database schema & migrations
│   │   └── tests/        # Backend tests
│   └── frontend/         # Next.js frontend
│       ├── app/          # App router pages
│       ├── components/   # React components
│       └── tests/        # Frontend tests
├── docs/                 # Documentation
├── infra/               # Infrastructure configs
├── packages/            # Shared packages (future)
└── tests/               # Cross-cutting tests
```

## 🔄 Development Workflow

### Branching Strategy

We use a simplified Git Flow:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

### Creating a Feature Branch

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create your feature branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in your feature branch
2. Write/update tests
3. Ensure all tests pass: `make test`
4. Ensure code is linted: `make lint`
5. Commit your changes with clear messages

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(auth): add password reset functionality"
git commit -m "fix(inventory): resolve stock count calculation bug"
git commit -m "docs(api): update authentication endpoint documentation"
```

## 📝 Code Standards

### Backend (Python)

- Follow [PEP 8](https://pep8.org/) style guide
- Use type hints for function parameters and return values
- Maximum line length: 100 characters
- Use docstrings for all public functions and classes

```python
def calculate_inventory_value(items: list[InventoryItem]) -> Decimal:
    """Calculate the total value of inventory items.
    
    Args:
        items: List of inventory items to calculate
        
    Returns:
        Total value as Decimal
        
    Raises:
        ValueError: If items list is empty
    """
    if not items:
        raise ValueError("Items list cannot be empty")
    return sum(item.price * item.quantity for item in items)
```

### Frontend (TypeScript/React)

- Follow [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use TypeScript for all new code
- Use functional components with hooks
- Use meaningful component and variable names

```typescript
interface UserProfileProps {
  userId: string;
  onUpdate: (profile: UserProfile) => void;
}

export function UserProfile({ userId, onUpdate }: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Component logic...
  
  return (
    <div className="user-profile">
      {/* Component JSX */}
    </div>
  );
}
```

### General Guidelines

- Write self-documenting code with clear variable names
- Keep functions small and focused (single responsibility)
- Avoid deep nesting (max 3 levels)
- Comment complex logic, not obvious code
- Remove commented-out code before committing

## 🧪 Testing

### Running Tests

```bash
# All tests
make test

# Backend tests only
make test-backend

# Frontend tests only
make test-frontend
```

### Writing Tests

#### Backend Tests (pytest)

```python
# apps/backend/tests/test_inventory.py
import pytest
from app.services.inventory_service import InventoryService

@pytest.mark.asyncio
async def test_calculate_stock_value():
    """Test inventory stock value calculation."""
    service = InventoryService()
    result = await service.calculate_stock_value(org_id="test-org")
    assert result > 0
```

#### Frontend Tests (Jest/Playwright)

```typescript
// apps/frontend/tests/components/UserProfile.test.tsx
import { render, screen } from '@testing-library/react';
import { UserProfile } from '@/components/UserProfile';

describe('UserProfile', () => {
  it('renders user name correctly', () => {
    render(<UserProfile userId="123" onUpdate={() => {}} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### Test Coverage

- Aim for >80% code coverage
- All new features must include tests
- Bug fixes should include regression tests

## 📤 Submitting Changes

### Pull Request Process

1. **Update your branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-feature-branch
   git rebase develop
   ```

2. **Push your changes**
   ```bash
   git push origin your-feature-branch
   ```

3. **Create Pull Request**
   - Go to GitHub and create a PR from your branch to `develop`
   - Fill out the PR template completely
   - Link any related issues
   - Request review from maintainers

4. **PR Title Format**
   ```
   feat(scope): brief description of changes
   ```

5. **PR Description Should Include**
   - What changed and why
   - How to test the changes
   - Screenshots (for UI changes)
   - Breaking changes (if any)
   - Related issues/tickets

### PR Review Process

- At least one approval required
- All CI checks must pass
- No merge conflicts
- Code follows style guidelines
- Tests are passing and coverage is maintained

### After PR is Merged

```bash
# Switch back to develop and pull latest
git checkout develop
git pull origin develop

# Delete your feature branch
git branch -d your-feature-branch
git push origin --delete your-feature-branch
```

## 🐛 Reporting Bugs

### Before Submitting a Bug Report

- Check existing issues to avoid duplicates
- Verify the bug in the latest version
- Collect relevant information (logs, screenshots, etc.)

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information.
```

## 💡 Feature Requests

We welcome feature requests! Please:

1. Check if the feature already exists or is planned
2. Clearly describe the feature and its use case
3. Explain why it would be valuable
4. Provide examples if possible

## 📞 Getting Help

- **Documentation**: Check the [docs/](./docs/) directory
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub Discussions for questions

## 📜 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Assume good intentions

## 🙏 Thank You!

Your contributions make Dosteon better for everyone. We appreciate your time and effort!

---

For more information, see:
- [Architecture Documentation](./docs/architecture/)
- [Development Guide](./docs/development/)
- [API Documentation](./docs/api/)
