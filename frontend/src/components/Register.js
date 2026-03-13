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
  input: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' },
  btn: { width: '100%', padding: '12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  error: { background: '#fef2f2', color: '#ef4444', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 },
  success: { background: '#f0fdf4', color: '#16a34a', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 },
  toggle: { textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b' },
  toggleLink: { color: '#6366f1', fontWeight: 600, cursor: 'pointer', marginLeft: 4 },
};

export default function Register({ onSwitchToLogin }) {
  const [form, setForm] = useState({ username: '', email: '', full_name: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/users/register', form);
      setSuccess('Account created! You can now sign in.');
      setTimeout(onSwitchToLogin, 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
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
        <div style={styles.title}>Create an account</div>
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input style={styles.input} name="full_name" value={form.full_name} onChange={handleChange} placeholder="Jane Doe" />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Username</label>
            <input style={styles.input} name="username" value={form.username} onChange={handleChange} placeholder="janedoe" required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" name="email" value={form.email} onChange={handleChange} placeholder="jane@company.com" required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" name="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" required minLength={6} />
          </div>
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <div style={styles.toggle}>
          Already have an account?
          <span style={styles.toggleLink} onClick={onSwitchToLogin}>Sign in</span>
        </div>
      </div>
    </div>
  );
}