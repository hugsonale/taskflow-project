import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// ─── Mock axios ───────────────────────────────────────────────────────────────
jest.mock('../api', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  interceptors: {
    request: { use: jest.fn() },
    response: { use: jest.fn() },
  },
}));

import Login from '../components/Login';
import Register from '../components/Register';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';

// ─── Login Component Tests ────────────────────────────────────────────────────

describe('Login Component', () => {
  test('renders login form elements', () => {
    render(<Login onLogin={jest.fn()} onSwitchToRegister={jest.fn()} />);
    expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('renders TaskFlow branding', () => {
    render(<Login onLogin={jest.fn()} onSwitchToRegister={jest.fn()} />);
    const matches = screen.getAllByText(/TaskFlow/i);
    expect(matches.length).toBeGreaterThan(0);
  });

  test('renders link to registration', () => {
    render(<Login onLogin={jest.fn()} onSwitchToRegister={jest.fn()} />);
    expect(screen.getByText(/Create one/i)).toBeInTheDocument();
  });

  test('calls onSwitchToRegister when create account is clicked', () => {
    const mockSwitch = jest.fn();
    render(<Login onLogin={jest.fn()} onSwitchToRegister={mockSwitch} />);
    fireEvent.click(screen.getByText(/Create one/i));
    expect(mockSwitch).toHaveBeenCalledTimes(1);
  });

  test('updates username input on change', () => {
    render(<Login onLogin={jest.fn()} onSwitchToRegister={jest.fn()} />);
    const input = screen.getByPlaceholderText('Enter your username');
    fireEvent.change(input, { target: { value: 'testuser' } });
    expect(input.value).toBe('testuser');
  });
});

// ─── Register Component Tests ─────────────────────────────────────────────────

describe('Register Component', () => {
  test('renders all registration fields', () => {
    render(<Register onSwitchToLogin={jest.fn()} />);
    expect(screen.getByPlaceholderText('janedoe')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('jane@company.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('At least 6 characters')).toBeInTheDocument();
  });

  test('renders create account button', () => {
    render(<Register onSwitchToLogin={jest.fn()} />);
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  test('calls onSwitchToLogin when sign in is clicked', () => {
    const mockSwitch = jest.fn();
    render(<Register onSwitchToLogin={mockSwitch} />);
    fireEvent.click(screen.getByText(/Sign in/i));
    expect(mockSwitch).toHaveBeenCalledTimes(1);
  });

  test('updates email input on change', () => {
    render(<Register onSwitchToLogin={jest.fn()} />);
    const input = screen.getByPlaceholderText('jane@company.com');
    fireEvent.change(input, { target: { value: 'hello@world.com' } });
    expect(input.value).toBe('hello@world.com');
  });
});

// ─── TaskList Component Tests ─────────────────────────────────────────────────

describe('TaskList Component', () => {
  const mockTasks = [
    {
      id: 1,
      title: 'Build login page',
      description: 'Create the login UI',
      status: 'in_progress',
      priority: 'high',
      is_completed: false,
      creator_id: 1,
      creator: { id: 1, username: 'alice', full_name: 'Alice Smith' },
      assignee: null,
      created_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      title: 'Write tests',
      description: null,
      status: 'done',
      priority: 'medium',
      is_completed: true,
      creator_id: 2,
      creator: { id: 2, username: 'bob', full_name: 'Bob Jones' },
      assignee: { id: 3, username: 'carol', full_name: 'Carol White' },
      created_at: '2024-01-02T00:00:00Z',
    },
  ];

  test('renders task titles', () => {
    render(<TaskList tasks={mockTasks} currentUserId={1} onComplete={jest.fn()} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('Build login page')).toBeInTheDocument();
    expect(screen.getByText(/Write tests/)).toBeInTheDocument();
  });

  test('shows empty state when no tasks', () => {
    render(<TaskList tasks={[]} currentUserId={1} onComplete={jest.fn()} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  });

  test('shows complete button for uncompleted owned tasks', () => {
    render(<TaskList tasks={mockTasks} currentUserId={1} onComplete={jest.fn()} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText(/Complete/)).toBeInTheDocument();
  });

  test('calls onDelete when delete button clicked', () => {
    const mockDelete = jest.fn();
    render(<TaskList tasks={mockTasks} currentUserId={1} onComplete={jest.fn()} onEdit={jest.fn()} onDelete={mockDelete} />);
    const deleteButtons = screen.getAllByText(/Delete/i);
    fireEvent.click(deleteButtons[0]);
    expect(mockDelete).toHaveBeenCalledWith(1);
  });

  test('calls onEdit when edit button clicked', () => {
    const mockEdit = jest.fn();
    render(<TaskList tasks={mockTasks} currentUserId={1} onComplete={jest.fn()} onEdit={mockEdit} onDelete={jest.fn()} />);
    const editButtons = screen.getAllByText(/Edit/i);
    fireEvent.click(editButtons[0]);
    expect(mockEdit).toHaveBeenCalledWith(mockTasks[0]);
  });

  test('shows assignee name when task has assignee', () => {
    render(<TaskList tasks={mockTasks} currentUserId={1} onComplete={jest.fn()} onEdit={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText(/Carol White/)).toBeInTheDocument();
  });
});

// ─── TaskForm Component Tests ──────────────────────────────────────────────────

describe('TaskForm Component', () => {
  const mockUsers = [
    { id: 1, username: 'alice', full_name: 'Alice Smith' },
    { id: 2, username: 'bob', full_name: 'Bob Jones' },
  ];

  test('renders create form with empty fields', () => {
    render(<TaskForm task={null} users={mockUsers} onSubmit={jest.fn()} onClose={jest.fn()} />);
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
  });

  test('renders edit form with prefilled data', () => {
    const task = { id: 1, title: 'Existing task', description: 'desc', status: 'todo', priority: 'high', assignee_id: null };
    render(<TaskForm task={task} users={mockUsers} onSubmit={jest.fn()} onClose={jest.fn()} />);
    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing task')).toBeInTheDocument();
  });

  test('calls onClose when cancel is clicked', () => {
    const mockClose = jest.fn();
    render(<TaskForm task={null} users={mockUsers} onSubmit={jest.fn()} onClose={mockClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  test('renders assignee dropdown with users', () => {
    render(<TaskForm task={null} users={mockUsers} onSubmit={jest.fn()} onClose={jest.fn()} />);
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  test('calls onSubmit with form data when submitted', () => {
    const mockSubmit = jest.fn();
    render(<TaskForm task={null} users={mockUsers} onSubmit={mockSubmit} onClose={jest.fn()} />);
    const titleInput = screen.getByPlaceholderText('What needs to be done?');
    fireEvent.change(titleInput, { target: { value: 'New task title' } });
    fireEvent.click(screen.getByText('Create Task'));
    expect(mockSubmit).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ title: 'New task title' }));
  });
});