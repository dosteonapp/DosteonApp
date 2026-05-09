#!/bin/bash
set -e

echo "🏗️  Starting Dosteon Monorepo Restructure..."
echo ""

# Create new directory structure
echo "📁 Creating new directory structure..."

# Apps directory
mkdir -p apps/backend
mkdir -p apps/frontend

# Backend subdirectories
mkdir -p apps/backend/scripts/{db,seed,user,maintenance}

# Packages (for future)
mkdir -p packages/.gitkeep

# Docs structure
mkdir -p docs/{architecture,development,deployment,features,operations,compliance,decisions,api}

# Infrastructure
mkdir -p infra/{docker,observability,terraform,k8s}

# Root scripts
mkdir -p scripts

# Tests
mkdir -p tests/{e2e,load,integration}

echo "✅ Directory structure created"
echo ""

echo "📦 Migration complete! Next steps will move files..."
