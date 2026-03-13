import React, { useState } from 'react';
import api from '../api';

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  card: { background: '#fff', borderRadius: 16, padding: 40, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' },
  logo: { textAlign: 'center', marginBottom: 32 },
  logoText: { fontSize: 32, fontWeight: 800, color: '#6366f1' },
  logoSub: { fontSize: 14, color: '#94a3b8', marginTop: 4 },
  title: { fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 24 },
  field: { marginBottom: 18 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 },
  input: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', transition: 'border 0.2s' },
  btn: { width: '100%', padding: '12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' },
  error: { background: '#fef2f2', color: '#ef4444', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 },
  toggle: { textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b' },
  toggleLink: { color: '#6366f1', fontWeight: 600, cursor: 'pointer', marginLeft: 4 },
};

export default function Login({ onLogin, onSwitchToRegister }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/users/login', form);
      localStorage.setItem('taskflow_token', res.data.access_token);
      localStorage.setItem('taskflow_user', JSON.stringify(res.data.user));
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoText}>⚡ TaskFlow</div>
          <div style={styles.logoSub}>Team Task Management</div>
        </div>
        <div style={styles.title}>Welcome back</div>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input style={styles.input} name="username" value={form.username} onChange={handleChange} placeholder="Enter your username" required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" required />
          </div>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div style={styles.toggle}>
          Don't have an account?
          <span style={styles.toggleLink} onClick={onSwitchToRegister}>Create one</span>
        </div>
      </div>
    </div>
  );
}