# API Documentation

This document provides comprehensive API documentation for the Todo Microservices Application.

## Base URLs

- **User Service**: `http://localhost:3001`
- **Todo Service**: `http://localhost:3002`
- **Frontend**: `http://localhost:3000`

## Authentication

All Todo Service endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## User Service API

### 1. User Registration

**Endpoint**: `POST /api/auth/register`

**Description**: Register a new user account

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Validation Rules**:
- Email must be a valid email format
- Password must be at least 6 characters long

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "uuid": "user-uuid",
    "user_email": "user@example.com",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid email format or password too short
- `409 Conflict`: Email already registered

### 2. User Login

**Endpoint**: `POST /api/auth/login`

**Description**: Authenticate user and receive JWT token

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "uuid": "user-uuid",
      "email": "user@example.com"
    },
    "token": "jwt-token-here"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid email format
- `401 Unauthorized`: Invalid credentials

### 3. Health Check

**Endpoint**: `GET /health`

**Description**: Service health status

**Response (200 OK)**:
```json
{
  "status": "OK",
  "service": "user-service",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Todo Service API

### 1. Create Todo

**Endpoint**: `POST /api/todos`

**Description**: Create a new todo item

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Request Body**:
```json
{
  "content": "Buy groceries"
}
```

**Validation Rules**:
- Content must not be empty
- Content must be between 1 and 500 characters

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Todo created successfully",
  "data": {
    "uuid": "todo-uuid",
    "content": "Buy groceries",
    "user_uuid": "user-uuid",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid content
- `401 Unauthorized`: Missing or invalid JWT token

### 2. Get All Todos

**Endpoint**: `GET /api/todos`

**Description**: Retrieve all todos for the authenticated user

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "uuid": "todo-uuid-1",
      "content": "Buy groceries",
      "user_uuid": "user-uuid",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    {
      "uuid": "todo-uuid-2",
      "content": "Walk the dog",
      "user_uuid": "user-uuid",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token

### 3. Update Todo

**Endpoint**: `PUT /api/todos/:id`

**Description**: Update an existing todo item

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Request Body**:
```json
{
  "content": "Buy groceries and milk"
}
```

**Validation Rules**:
- Content must not be empty
- Content must be between 1 and 500 characters
- Todo must belong to the authenticated user

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Todo updated successfully",
  "data": {
    "uuid": "todo-uuid",
    "content": "Buy groceries and milk",
    "user_uuid": "user-uuid",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid content
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Todo not found or doesn't belong to user

### 4. Delete Todo

**Endpoint**: `DELETE /api/todos/:id`

**Description**: Delete a todo item

**Headers**:
```
Authorization: Bearer <jwt-token>
```

**Response (204 No Content)**:
No response body

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Todo not found or doesn't belong to user

### 5. Health Check

**Endpoint**: `GET /health`

**Description**: Service health status

**Response (200 OK)**:
```json
{
  "status": "OK",
  "service": "todo-service",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description"
  }
}
```

## JWT Token Format

JWT tokens contain the following payload:

```json
{
  "uuid": "user-uuid",
  "email": "user@example.com",
  "iat": 1640995200,
  "exp": 1641081600
}
```

## Database Schema

### Users Table
| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-increment primary key |
| uuid | string | Unique user identifier |
| user_email | string | User email address |
| user_pwd | string | Hashed password |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

### Todos Table
| Field | Type | Description |
|-------|------|-------------|
| id | number | Auto-increment primary key |
| uuid | string | Unique todo identifier |
| content | string | Todo content |
| user_uuid | string | Foreign key to users.uuid |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

## Testing

### Running Tests

```bash
# User Service Tests
cd user-service
npm test

# Todo Service Tests
cd todo-service
npm test
```

### Test Coverage

The test suite covers:
- User registration and login
- JWT token validation
- Todo CRUD operations
- Error handling
- Input validation
- Authentication middleware

## Postman Collection

You can import the following collection into Postman:

```json
{
  "info": {
    "name": "Todo Microservices API",
    "description": "API collection for Todo Microservices Application"
  },
  "item": [
    {
      "name": "User Service",
      "item": [
        {
          "name": "Register User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "http://localhost:3001/api/auth/register",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3001",
              "path": ["api", "auth", "register"]
            }
          }
        },
        {
          "name": "Login User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "http://localhost:3001/api/auth/login",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3001",
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    },
    {
      "name": "Todo Service",
      "item": [
        {
          "name": "Create Todo",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"content\": \"Buy groceries\"\n}"
            },
            "url": {
              "raw": "http://localhost:3002/api/todos",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3002",
              "path": ["api", "todos"]
            }
          }
        },
        {
          "name": "Get All Todos",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": {
              "raw": "http://localhost:3002/api/todos",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3002",
              "path": ["api", "todos"]
            }
          }
        },
        {
          "name": "Update Todo",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"content\": \"Buy groceries and milk\"\n}"
            },
            "url": {
              "raw": "http://localhost:3002/api/todos/{{todo_uuid}}",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3002",
              "path": ["api", "todos", "{{todo_uuid}}"]
            }
          }
        },
        {
          "name": "Delete Todo",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{jwt_token}}"
              }
            ],
            "url": {
              "raw": "http://localhost:3002/api/todos/{{todo_uuid}}",
              "protocol": "http",
              "host": ["localhost"],
              "port": "3002",
              "path": ["api", "todos", "{{todo_uuid}}"]
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "jwt_token",
      "value": "your-jwt-token-here"
    },
    {
      "key": "todo_uuid",
      "value": "todo-uuid-here"
    }
  ]
}
```

## Environment Variables

### User Service
```bash
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user_user:user_password@localhost:5432/user_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=12
LOG_LEVEL=info
```

### Todo Service
```bash
NODE_ENV=development
PORT=3002
DATABASE_URL=postgresql://todo_user:todo_password@localhost:5433/todo_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
LOG_LEVEL=info
```

### Frontend
```bash
REACT_APP_USER_SERVICE_URL=http://localhost:3001
REACT_APP_TODO_SERVICE_URL=http://localhost:3002
``` 