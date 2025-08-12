import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Todo {
  uuid: string;
  content: string;
  completed: boolean;
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
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');

  const todoServiceUrl = process.env.REACT_APP_TODO_SERVICE_URL || 'http://localhost:3002';

  useEffect(() => {
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${todoServiceUrl}/api/todos`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
        , params: { status: filter }
      });
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
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${todoServiceUrl}/api/todos`,
        { content: newTodo.trim() },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      
      // refresh list to respect current filter
      fetchTodos();
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
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${todoServiceUrl}/api/todos/${uuid}`,
        { content: editContent.trim() },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      
      fetchTodos();
      setEditingTodo(null);
      setEditContent('');
      setSuccess('Todo updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update todo');
      setTimeout(() => setError(''), 5000);
    }
  };

  const toggleCompleted = async (uuid: string, current: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${todoServiceUrl}/api/todos/${uuid}`,
        { completed: !current },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      fetchTodos();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to toggle todo');
      setTimeout(() => setError(''), 5000);
    }
  };

  const deleteTodo = async (uuid: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${todoServiceUrl}/api/todos/${uuid}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      fetchTodos();
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
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'completed' | 'pending')}
                className="form-input"
                style={{ width: 'auto' }}
                aria-label="Filter todos"
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
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
                  <div className="todo-content" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      className="custom-checkbox"
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleCompleted(todo.uuid, todo.completed)}
                    />
                    <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                      {todo.content}
                    </span>
                    {todo.completed ? (
                      <span
                        style={{
                          marginLeft: '0.5rem',
                          background: '#d1fae5',
                          color: '#065f46',
                          border: '1px solid #a7f3d0',
                          borderRadius: '9999px',
                          padding: '0.1rem 0.5rem',
                          fontSize: '0.75rem'
                        }}
                      >
                        Completed
                      </span>
                    ) : (
                      <span
                        style={{
                          marginLeft: '0.5rem',
                          background: '#fef3c7',
                          color: '#92400e',
                          border: '1px solid #fde68a',
                          borderRadius: '9999px',
                          padding: '0.1rem 0.5rem',
                          fontSize: '0.75rem'
                        }}
                      >
                        Pending
                      </span>
                    )}
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