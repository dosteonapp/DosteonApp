#!/bin/bash

# Dosteon Development Startup Script

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║     Starting Dosteon Development      ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"

# Check if backend is already running
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠ Backend already running on port 8000${NC}"
    echo -e "${YELLOW}  Stop it first or use 'make dev-frontend' to start only frontend${NC}"
    exit 1
fi

# Check if frontend is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo -e "${YELLOW}⚠ Frontend already running on port 3000${NC}"
    echo -e "${YELLOW}  Stop it first or use 'make dev-backend' to start only backend${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Ports are available${NC}"
echo ""

# Verify backend setup
echo -e "${BLUE}Verifying backend setup...${NC}"
cd apps/backend
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠ Backend .env not found, creating from example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}  Please edit apps/backend/.env with your credentials${NC}"
    exit 1
fi

if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}⚠ Backend virtual environment not found${NC}"
    echo -e "${YELLOW}  Run: make setup${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Backend configured${NC}"
cd ../..

# Verify frontend setup
echo -e "${BLUE}Verifying frontend setup...${NC}"
cd apps/frontend
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠ Frontend .env.local not found, creating from example...${NC}"
    cp .env.example .env.local
    echo -e "${YELLOW}  Please edit apps/frontend/.env.local with your credentials${NC}"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ Frontend dependencies not installed${NC}"
    echo -e "${YELLOW}  Run: make setup${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Frontend configured${NC}"
cd ../..

echo ""
echo -e "${GREEN}Starting services...${NC}"
echo ""

# Start using make
make dev
