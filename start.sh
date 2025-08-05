#!/bin/bash

echo "🚀 Starting Todo Microservices Application..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose and try again."
    exit 1
fi

echo "📦 Building and starting all services..."
docker compose up --build -d

echo "⏳ Waiting for services to start..."
sleep 10

echo "🔍 Checking service health..."

# Check User Service
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ User Service is running on http://localhost:3001"
else
    echo "❌ User Service is not responding"
fi

# Check Todo Service
if curl -f http://localhost:3002/health > /dev/null 2>&1; then
    echo "✅ Todo Service is running on http://localhost:3002"
else
    echo "❌ Todo Service is not responding"
fi

# Check Frontend
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "❌ Frontend is not responding"
fi

echo ""
echo "🎉 Application is ready!"
echo ""
echo "📱 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   User Service API: http://localhost:3001"
echo "   Todo Service API: http://localhost:3002"
echo ""
echo "📚 Documentation:"
echo "   API Documentation: API_DOCUMENTATION.md"
echo "   README: README.md"
echo ""
echo "🛠️  Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart services: docker-compose restart"
echo ""
echo "🧪 Run tests:"
echo "   User Service tests: cd user-service && npm test"
echo "   Todo Service tests: cd todo-service && npm test" 