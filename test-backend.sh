#!/bin/bash

echo "🧪 Testing Backend Setup..."
echo ""

# Test if backend is running
echo "1. Checking if backend is running..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "   ✅ Backend is running!"
    
    # Test health endpoint
    echo ""
    echo "2. Testing /health endpoint..."
    HEALTH=$(curl -s http://localhost:8000/health)
    echo "   Response: $HEALTH"
    
    # Test ready endpoint
    echo ""
    echo "3. Testing /health/ready endpoint..."
    READY=$(curl -s http://localhost:8000/health/ready)
    echo "   Response: $READY"
    
    echo ""
    echo "✅ Backend is working!"
    echo ""
    echo "📚 API Documentation: http://localhost:8000/docs"
    echo "🔍 Health Check: http://localhost:8000/health"
    
else
    echo "   ❌ Backend is not running"
    echo ""
    echo "Start it with:"
    echo "   ./start-backend.sh"
    echo ""
    echo "Or:"
    echo "   make dev-backend"
fi
