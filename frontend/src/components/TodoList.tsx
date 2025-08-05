import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Todo {
  uuid: string;
  content: string;
  created_at: string;
  updated_at: string;
}

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const todoServiceUrl = process.env.REACT_APP_TODO_SERVICE_URL || 'http://localhost:3002';

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${todoServiceUrl}/api/todos`);
      setTodos(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      const response = await axios.post(`${todoServiceUrl}/api/todos`, {
        content: newTodo.trim()
      });
      
      setTodos([response.data.data, ...todos]);
      setNewTodo('');
      setSuccess('Todo created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create todo');
      setTimeout(() => setError(''), 5000);
    }
  };

  const updateTodo = async (uuid: string) => {
    if (!editContent.trim()) return;

    try {
      const response = await axios.put(`${todoServiceUrl}/api/todos/${uuid}`, {
        content: editContent.trim()
      });
      
      setTodos(todos.map(todo => 
        todo.uuid === uuid ? response.data.data : todo
      ));
      setEditingTodo(null);
      setEditContent('');
      setSuccess('Todo updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update todo');
      setTimeout(() => setError(''), 5000);
    }
  };

  const deleteTodo = async (uuid: string) => {
    try {
      await axios.delete(`${todoServiceUrl}/api/todos/${uuid}`);
      setTodos(todos.filter(todo => todo.uuid !== uuid));
      setSuccess('Todo deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to delete todo');
      setTimeout(() => setError(''), 5000);
    }
  };

  const startEdit = (todo: Todo) => {
    setEditingTodo(todo.uuid);
    setEditContent(todo.content);
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setEditContent('');
  };

  if (loading) {
    return <div className="loading">Loading todos...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>
        My Todo List
      </h1>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="todo-form">
        <form onSubmit={createTodo}>
          <div className="form-group">
            <label htmlFor="newTodo" className="form-label">
              Add New Todo
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                id="newTodo"
                className="form-input"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Enter your todo..."
                required
              />
              <button type="submit" className="btn btn-primary">
                Add
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="todo-list">
        {todos.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: '#6b7280' }}>
            No todos yet. Add one above!
          </div>
        ) : (
          todos.map(todo => (
            <div key={todo.uuid} className="todo-item">
              {editingTodo === todo.uuid ? (
                <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                  <input
                    type="text"
                    className="form-input"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <button
                    onClick={() => updateTodo(todo.uuid)}
                    className="btn btn-primary"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="todo-content">
                    {todo.content}
                  </div>
                  <div className="todo-actions">
                    <button
                      onClick={() => startEdit(todo)}
                      className="btn btn-secondary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.uuid)}
                      className="btn btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodoList; 