import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import api from './api';

const styles = {
  app: { minHeight: '100vh', background: '#f8fafc' },
  nav: { background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  navLogo: { fontSize: 22, fontWeight: 800, color: '#6366f1' },
  navUser: { display: 'flex', alignItems: 'center', gap: 16 },
  avatar: { width: 36, height: 36, borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 },
  userName: { fontSize: 14, fontWeight: 600, color: '#374151' },
  btnLogout: { padding: '7px 16px', background: 'transparent', color: '#ef4444', border: '1.5px solid #fecaca', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  main: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  pageTitle: { fontSize: 26, fontWeight: 800, color: '#0f172a' },
  pageSubtitle: { fontSize: 14, color: '#64748b', marginTop: 4 },
  btnNew: { padding: '10px 22px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
  filters: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  filterBtn: (active) => ({ padding: '7px 16px', border: `1.5px solid ${active ? '#6366f1' : '#e2e8f0'}`, background: active ? '#6366f1' : '#fff', color: active ? '#fff' : '#475569', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }),
  stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 28 },
  stat: { background: '#fff', borderRadius: 12, padding: '16px 20px', textAlign: 'center', border: '1px solid #f1f5f9', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  statNum: { fontSize: 28, fontWeight: 800, color: '#6366f1' },
  statLabel: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
};

const FILTER_OPTIONS = [
  { key: 'all', label: 'All Tasks' },
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
  { key: 'mine', label: 'My Tasks' },
];

export default function App() {
  const [view, setView] = useState('login'); // login | register | dashboard
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);

  // Restore session
  useEffect(() => {
    const stored = localStorage.getItem('taskflow_user');
    const token = localStorage.getItem('taskflow_token');
    if (stored && token) {
      setUser(JSON.parse(stored));
      setView('dashboard');
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await api.get('/tasks/');
      setTasks(res.data);
    } catch (e) {
      console.error('Failed to fetch tasks', e);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/users/');
      setUsers(res.data);
    } catch (e) {
      console.error('Failed to fetch users', e);
    }
  }, []);

  useEffect(() => {
    if (view === 'dashboard') {
      fetchTasks();
      fetchUsers();
    }
  }, [view, fetchTasks, fetchUsers]);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    setUser(null);
    setTasks([]);
    setView('login');
  };

  const handleCreateTask = async (data) => {
    setLoading(true);
    try {
      await api.post('/tasks/', data);
      await fetchTasks();
      setShowForm(false);
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (data) => {
    setLoading(true);
    try {
      await api.put(`/tasks/${editingTask.id}`, data);
      await fetchTasks();
      setEditingTask(null);
      setShowForm(false);
    } catch (e) {
      alert(e.response?.data?.detail || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      await api.patch(`/tasks/${id}/complete`);
      await fetchTasks();
    } catch (e) {
      alert('Failed to complete task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      alert('Failed to delete task');
    }
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'mine') return t.creator_id === user?.id || t.assignee_id === user?.id;
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const statsData = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.is_completed).length,
  };

  if (view === 'login') {
    return <Login onLogin={handleLogin} onSwitchToRegister={() => setView('register')} />;
  }
  if (view === 'register') {
    return <Register onSwitchToLogin={() => setView('login')} />;
  }

  const initial = (user?.full_name || user?.username || '?')[0].toUpperCase();

  return (
    <div style={styles.app}>
      <nav style={styles.nav}>
        <div style={styles.navLogo}>⚡ TaskFlow</div>
        <div style={styles.navUser}>
          <div style={styles.avatar}>{initial}</div>
          <span style={styles.userName}>{user?.full_name || user?.username}</span>
          <button style={styles.btnLogout} onClick={handleLogout}>Sign Out</button>
        </div>
      </nav>

      <main style={styles.main}>
        <div style={styles.header}>
          <div>
            <div style={styles.pageTitle}>Task Dashboard</div>
            <div style={styles.pageSubtitle}>Manage your team's work</div>
          </div>
          <button style={styles.btnNew} onClick={() => setShowForm(true)}>
            + New Task
          </button>
        </div>

        <div style={styles.stats}>
          <div style={styles.stat}><div style={styles.statNum}>{statsData.total}</div><div style={styles.statLabel}>Total</div></div>
          <div style={styles.stat}><div style={{ ...styles.statNum, color: '#6366f1' }}>{statsData.todo}</div><div style={styles.statLabel}>To Do</div></div>
          <div style={styles.stat}><div style={{ ...styles.statNum, color: '#f59e0b' }}>{statsData.inProgress}</div><div style={styles.statLabel}>In Progress</div></div>
          <div style={styles.stat}><div style={{ ...styles.statNum, color: '#10b981' }}>{statsData.done}</div><div style={styles.statLabel}>Completed</div></div>
        </div>

        <div style={styles.filters}>
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              style={styles.filterBtn(filter === opt.key)}
              onClick={() => setFilter(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <TaskList
          tasks={filteredTasks}
          currentUserId={user?.id}
          onComplete={handleComplete}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </main>

      {showForm && (
        <TaskForm
          task={editingTask}
          users={users}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onClose={closeForm}
        />
      )}
    </div>
  );
}