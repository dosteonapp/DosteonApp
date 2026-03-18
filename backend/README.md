# Dosteon Backend

This is the FastAPI backend server for the Dosteon project, following a clean, professional, and secure architecture.

## 🏗 Project Structure
- `app/`: Primary application source code.
  - `api/`: API versioned routers and dependencies.
  - `core/`: Global configuration, security, and logging.
  - `repositories/`: Database abstraction layer.
  - `services/`: Business logic layer.
  - `schemas/`: Pydantic models for validation.
- `prisma/`: Prisma schema, migrations, and SQL utilities.
- `scripts/`: Maintenance and utility scripts.
- `tests/`: Comprehensive test suite.

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.12+ (Recommended)
- Virtual environment tool

### 2. Setup
```powershell
# Create venv
python -m venv venv

# Activate venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup Prisma
python -m prisma generate
```

### 3. Environment Configuration
Ensure `.env` contains the necessary Supabase and Database credentials. Use `.env.example` as a template.

### 4. Running the Server
```powershell
uvicorn app.main:app --reload
```
The server starts at `http://localhost:8000`. Documentation:
- Swagger: `/docs`
- ReDoc: `/redoc`

## 🛡 Security & Compliance
- **Auth**: Integrated with Supabase JWT validation. 
- **Validation**: Strict schema validation using Pydantic v2.
- **Logging**: Centralized professional logging system.
- **Clean Code**: SOLID principles applied to repository/service layers.

## 🧪 Testing
Run tests using pytest:
```powershell
pytest
```
