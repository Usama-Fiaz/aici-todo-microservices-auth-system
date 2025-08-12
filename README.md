# 🚀 Todo Microservices Authentication System

A complete microservices-based todo application with JWT authentication, built with Node.js, TypeScript, PostgreSQL, and React. All services are containerized with Docker and orchestrated using Docker Compose.

## 📋 Technical Challenge Requirements

This project implements all the specified requirements from the technical challenge:

### ✅ **System Architecture**
- **Two Backend Services**: User Service (authentication) + Todo Service (CRUD operations)
- **Linked Databases**: Separate PostgreSQL databases for each service
- **Frontend**: React application with minimal UI
- **Containerization**: Docker + Docker Compose orchestration

### ✅ **User Service Backend**
- ✅ User registration with email/password
- ✅ User login with JWT token generation
- ✅ Password hashing with bcrypt
- ✅ JWT token validation
- ✅ PostgreSQL database integration

### ✅ **Todo Service Backend**
- ✅ Complete CRUD operations (Create, Read, Update, Delete)
- ✅ JWT authentication middleware
- ✅ User-specific todo management
- ✅ PostgreSQL database with Prisma ORM
- ✅ Comprehensive unit tests

### ✅ **Frontend Application**
- ✅ React with TypeScript
- ✅ User registration and login forms
- ✅ Todo management interface
- ✅ JWT token management
- ✅ Responsive design

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  User Service   │    │  Todo Service   │
│   (React)       │◄──►│   (Port 3001)   │    │   (Port 3002)   │
│   (Port 3000)   │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                       │
                              ▼                       ▼
                       ┌─────────────┐        ┌─────────────┐
                       │ User DB     │        │ Todo DB     │
                       │ (Port 5432) │        │ (Port 5433) │
                       └─────────────┘        └─────────────┘
```

## 🛠️ Tech Stack

### Backend Services
- **Runtime**: Node.js 18 with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: Joi
- **Testing**: Jest + Supertest

### Frontend
- **Framework**: React 18 with TypeScript
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Styling**: Custom CSS

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Database**: PostgreSQL (separate instances)

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd todo-microservices-auth-system
```

### 2. Start All Services
```bash
# Start all services with Docker Compose
docker compose up -d

# Or use the provided start script
./start.sh
```

### 2.1 First-time setup (apply database migrations)
If this is your first time running the project (or you're on a fresh machine/volume), start the databases and apply Prisma migrations to create tables.

```bash
# Start only the databases
docker compose up -d user-db todo-db

# Apply migrations for user-service
cd user-service
DATABASE_URL=postgresql://user_user:user_password@localhost:5432/user_db \
  npx prisma migrate deploy

# Apply migrations for todo-service
cd ../todo-service
DATABASE_URL=postgresql://todo_user:todo_password@localhost:5433/todo_db \
  npx prisma migrate deploy

# Now start the app services
cd ..
docker compose up -d user-service todo-service frontend
```

Notes:
- The Postgres containers create the databases, but tables are created by running migrations.
- You only need to run the migration commands once per new database volume.

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **User Service API**: http://localhost:3001
- **Todo Service API**: http://localhost:3002

### 4. Database Access
```bash
# User Database
docker exec -it user-db psql -U user_user -d user_db

# Todo Database  
docker exec -it todo-db psql -U todo_user -d todo_db
```

## 📚 API Documentation

### User Service Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "uuid": "user-uuid",
    "user_email": "user@example.com",
    "created_at": "2025-08-05T19:40:17.832Z"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "uuid": "user-uuid",
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Todo Service Endpoints

All todo endpoints require JWT authentication in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

#### Create Todo
```http
POST /api/todos
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "content": "Buy groceries"
}
```

#### Get All Todos
```http
GET /api/todos
Authorization: Bearer <jwt-token>
```

#### Update Todo
```http
PUT /api/todos/:uuid
Content-Type: application/json
Authorization: Bearer <jwt-token>

{
  "content": "Buy groceries and milk"
}
```

#### Delete Todo
```http
DELETE /api/todos/:uuid
Authorization: Bearer <jwt-token>
```

## 🧪 Testing

### Run All Tests
```bash
# Test User Service
cd user-service && npm test

# Test Todo Service  
cd todo-service && npm test
```

### Test Coverage
- ✅ User registration validation
- ✅ User login authentication
- ✅ JWT token generation
- ✅ Todo CRUD operations
- ✅ JWT middleware validation
- ✅ Error handling

## 🗄️ Database Schema

### User Database
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(255) UNIQUE NOT NULL,
  user_email VARCHAR(255) UNIQUE NOT NULL,
  user_pwd VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Todo Database
```sql
CREATE TABLE todos (
  id SERIAL PRIMARY KEY,
  uuid VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  user_uuid VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Security Features

- ✅ **Password Hashing**: bcrypt with configurable rounds
- ✅ **JWT Authentication**: Secure token-based authentication
- ✅ **Input Validation**: Joi schema validation
- ✅ **CORS Protection**: Configured for cross-origin requests
- ✅ **Error Handling**: Comprehensive error middleware
- ✅ **Environment Variables**: Secure configuration management

## 🐳 Docker Configuration

### Services
- **user-service**: Node.js application on port 3001
- **todo-service**: Node.js application on port 3002
- **frontend**: React application on port 3000
- **user-db**: PostgreSQL database on port 5432
- **todo-db**: PostgreSQL database on port 5433

### Volumes
- Database data persistence
- Application logs
- Development hot-reload

## 📁 Project Structure

```
todo-microservices-auth-system/
├── user-service/           # User authentication service
│   ├── src/
│   │   ├── controllers/   # Auth controllers
│   │   ├── middleware/    # Validation & error handling
│   │   ├── routes/        # API routes
│   │   └── index.ts       # Service entry point
│   ├── prisma/            # Database schema
│   ├── tests/             # Unit tests
│   └── Dockerfile
├── todo-service/          # Todo CRUD service
│   ├── src/
│   │   ├── controllers/   # Todo controllers
│   │   ├── middleware/    # Auth & validation
│   │   ├── routes/        # API routes
│   │   └── index.ts       # Service entry point
│   ├── prisma/            # Database schema
│   ├── tests/             # Unit tests
│   └── Dockerfile
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # Auth context
│   │   └── App.tsx        # Main app component
│   ├── public/            # Static assets
│   └── Dockerfile
├── docker-compose.yml     # Service orchestration
├── API_DOCUMENTATION.md  # Detailed API docs
└── README.md             # This file
```

## 🚀 Deployment

### Production Deployment
```bash
# Build production images
docker compose -f docker-compose.prod.yml build

# Start production services
docker compose -f docker-compose.prod.yml up -d
```

### Environment Variables
Create `.env` files for each service:

**user-service/.env:**
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://user_user:user_password@user-db:5432/user_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
```

**todo-service/.env:**
```env
NODE_ENV=production
PORT=3002
DATABASE_URL=postgresql://todo_user:todo_password@todo-db:5432/todo_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎯 User Stories Implementation

### ✅ User Service Stories
- **User Registration**: Complete with validation and password hashing
- **User Login**: JWT token generation and validation

### ✅ Todo Service Stories  
- **Create Todo**: JWT-protected endpoint with user association
- **Read Todos**: User-specific todo retrieval
- **Update Todo**: Owner-only modification with validation
- **Delete Todo**: Owner-only deletion with proper cleanup