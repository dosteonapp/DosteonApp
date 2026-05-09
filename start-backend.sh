#!/bin/bash

echo "🚀 Starting Dosteon Backend..."
echo ""
echo "Backend will be available at:"
echo "  • API: http://localhost:8000"
echo "  • Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"
echo ""

cd apps/backend
.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
