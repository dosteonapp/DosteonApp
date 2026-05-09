#!/bin/bash

# Dosteon Setup Script
# This script sets up the entire development environment

set -e  # Exit on error

# Colors for output
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║     Dosteon Development Setup         ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "  Please install Node.js >= 18.0.0 from https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Node.js version must be >= 18.0.0 (current: $(node -v))${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 is not installed${NC}"
    echo "  Please install Python >= 3.11 from https://python.org"
    exit 1
fi
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo -e "${GREEN}✓ Python $(python3 --version)${NC}"

# Check Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}✗ Git is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Git $(git --version | cut -d' ' -f3)${NC}"

echo ""

# Install root dependencies
echo -e "${BLUE}Installing root dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Root dependencies installed${NC}"
echo ""

# Setup Backend
echo -e "${BLUE}Setting up backend...${NC}"
cd apps/backend

# Create virtual environment
if [ ! -d ".venv" ]; then
    echo "  Creating Python virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment and install dependencies
echo "  Installing Python dependencies..."
.venv/bin/pip install --upgrade pip --quiet
.venv/bin/pip install -r requirements.txt --quiet

# Install Node dependencies for Prisma
echo "  Installing Prisma..."
npm install --silent

# Generate Prisma client
echo "  Generating Prisma client..."
PATH="$PWD/.venv/bin:$PATH" .venv/bin/python -m prisma generate > /dev/null 2>&1

echo -e "${GREEN}✓ Backend setup complete${NC}"
cd ../..
echo ""

# Setup Frontend
echo -e "${BLUE}Setting up frontend...${NC}"
cd apps/frontend

echo "  Installing frontend dependencies..."
npm install --legacy-peer-deps --silent

echo -e "${GREEN}✓ Frontend setup complete${NC}"
cd ../..
echo ""

# Check for environment files
echo -e "${BLUE}Checking environment configuration...${NC}"

if [ ! -f "apps/backend/.env" ]; then
    echo -e "${YELLOW}⚠ Backend .env file not found${NC}"
    echo "  Creating from example..."
    cp apps/backend/.env.example apps/backend/.env
    echo -e "${YELLOW}  Please edit apps/backend/.env with your Supabase credentials${NC}"
fi

if [ ! -f "apps/frontend/.env.local" ]; then
    echo -e "${YELLOW}⚠ Frontend .env.local file not found${NC}"
    echo "  Creating from example..."
    cp apps/frontend/.env.example apps/frontend/.env.local
    echo -e "${YELLOW}  Please edit apps/frontend/.env.local with your configuration${NC}"
fi

echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════╗"
echo "║     Setup Complete! 🎉                ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "1. Configure your environment variables:"
echo "   ${YELLOW}apps/backend/.env${NC}"
echo "   ${YELLOW}apps/frontend/.env.local${NC}"
echo ""
echo "2. Run database migrations:"
echo "   ${GREEN}make db-migrate${NC}"
echo ""
echo "3. (Optional) Seed the database:"
echo "   ${GREEN}make db-seed${NC}"
echo ""
echo "4. Start development servers:"
echo "   ${GREEN}make dev${NC}"
echo ""
echo "For more commands, run: ${GREEN}make help${NC}"
echo ""
echo -e "${BLUE}Happy coding! 🚀${NC}"
