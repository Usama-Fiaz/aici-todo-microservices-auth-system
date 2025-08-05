import request from 'supertest';
import app from '../index';
import { prisma } from '../index';
import jwt from 'jsonwebtoken';

describe('Todo Endpoints', () => {
  let authToken: string;
  let userUuid: string;

  beforeAll(async () => {
    // Clean up database before tests
    await prisma.todo.deleteMany();
    
    // Create a test user and generate token
    userUuid = 'test-user-uuid';
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    authToken = jwt.sign(
      { uuid: userUuid, email: 'test@example.com' },
      jwtSecret,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/todos', () => {
    it('should create a new todo successfully', async () => {
      const todoData = {
        content: 'Test todo item'
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo created successfully');
      expect(response.body.data).toHaveProperty('uuid');
      expect(response.body.data.content).toBe(todoData.content);
      expect(response.body.data.user_uuid).toBe(userUuid);
    });

    it('should return 401 without authentication token', async () => {
      const todoData = {
        content: 'Test todo item'
      };

      const response = await request(app)
        .post('/api/todos')
        .send(todoData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Access token required');
    });

    it('should return 400 for empty content', async () => {
      const todoData = {
        content: ''
      };

      const response = await request(app)
        .post('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(todoData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/todos', () => {
    beforeEach(async () => {
      // Create test todos
      await prisma.todo.createMany({
        data: [
          {
            uuid: 'todo-1',
            content: 'First todo',
            user_uuid: userUuid
          },
          {
            uuid: 'todo-2',
            content: 'Second todo',
            user_uuid: userUuid
          }
        ]
      });
    });

    it('should return all todos for authenticated user', async () => {
      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('uuid');
      expect(response.body.data[0]).toHaveProperty('content');
      expect(response.body.data[0].user_uuid).toBe(userUuid);
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .get('/api/todos')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Access token required');
    });

    it('should return empty array for user with no todos', async () => {
      // Create token for different user
      const otherUserToken = jwt.sign(
        { uuid: 'other-user', email: 'other@example.com' },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .get('/api/todos')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('PUT /api/todos/:id', () => {
    let todoUuid: string;

    beforeEach(async () => {
      // Create a test todo
      const todo = await prisma.todo.create({
        data: {
          uuid: 'update-todo',
          content: 'Original content',
          user_uuid: userUuid
        }
      });
      todoUuid = todo.uuid;
    });

    it('should update todo successfully', async () => {
      const updateData = {
        content: 'Updated content'
      };

      const response = await request(app)
        .put(`/api/todos/${todoUuid}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Todo updated successfully');
      expect(response.body.data.content).toBe(updateData.content);
      expect(response.body.data.uuid).toBe(todoUuid);
    });

    it('should return 404 for non-existent todo', async () => {
      const updateData = {
        content: 'Updated content'
      };

      const response = await request(app)
        .put('/api/todos/non-existent-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Todo not found');
    });

    it('should return 401 without authentication token', async () => {
      const updateData = {
        content: 'Updated content'
      };

      const response = await request(app)
        .put(`/api/todos/${todoUuid}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/todos/:id', () => {
    let todoUuid: string;

    beforeEach(async () => {
      // Create a test todo
      const todo = await prisma.todo.create({
        data: {
          uuid: 'delete-todo',
          content: 'Todo to delete',
          user_uuid: userUuid
        }
      });
      todoUuid = todo.uuid;
    });

    it('should delete todo successfully', async () => {
      const response = await request(app)
        .delete(`/api/todos/${todoUuid}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify todo is deleted
      const deletedTodo = await prisma.todo.findUnique({
        where: { uuid: todoUuid }
      });
      expect(deletedTodo).toBeNull();
    });

    it('should return 404 for non-existent todo', async () => {
      const response = await request(app)
        .delete('/api/todos/non-existent-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Todo not found');
    });

    it('should return 401 without authentication token', async () => {
      const response = await request(app)
        .delete(`/api/todos/${todoUuid}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('OK');
      expect(response.body.service).toBe('todo-service');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
}); 