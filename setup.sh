#!/bin/bash

echo "🚀 Lobbix Setup Script"
echo "======================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    echo "   Download from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed."
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating .env file from template..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your actual credentials"
    echo "   (For development, the defaults will work)"
    echo ""
fi

# Start Docker containers
echo "🐳 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running!"
else
    echo "❌ Services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

# Seed database
echo ""
echo "🌱 Seeding database with test data..."
docker-compose exec -T api npm run db:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "📱 API is running at: http://localhost:3000"
echo "🗄️  PostgreSQL: localhost:5432"
echo "🔴 Redis: localhost:6379"
echo ""
echo "🧪 Test credentials:"
echo "   Building Code: DEKEL2024"
echo "   Va'ad Admin: +972501234567"
echo "   Resident: +972503456789"
echo ""
echo "🔍 Test the API:"
echo "   curl http://localhost:3000/health"
echo ""
echo "📖 Next steps:"
echo "   1. Read backend/README.md for API documentation"
echo "   2. Test authentication with Postman or curl"
echo "   3. Start building the mobile app!"
echo ""
echo "🛑 To stop: docker-compose down"
echo "📋 View logs: docker-compose logs -f"
