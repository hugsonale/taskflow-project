import React, { useState, useEffect } from 'react';

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 25px 50px rgba(0,0,0,0.2)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 20, fontWeight: 700, color: '#1e293b' },
  close: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#94a3b8', padding: 4 },
  field: { marginBottom: 18 },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 6 },
  input: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none' },
  select: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' },
  textarea: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', minHeight: 80 },
  actions: { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 },
  btnCancel: { padding: '10px 20px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  btnSubmit: { padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
};

export default function TaskForm({ task, users, onSubmit, onClose }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee_id: '',
  });

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        assignee_id: task.assignee_id || '',
      });
    }
  }, [task]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!payload.assignee_id) delete payload.assignee_id;
    else payload.assignee_id = parseInt(payload.assignee_id);
    onSubmit(payload);
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.title}>{task ? 'Edit Task' : 'Create New Task'}</div>
          <button style={styles.close} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Title *</label>
            <input style={styles.input} name="title" value={form.title} onChange={handleChange} placeholder="What needs to be done?" required />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea style={styles.textarea} name="description" value={form.description} onChange={handleChange} placeholder="Add more details..." />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={styles.field}>
              <label style={styles.label}>Status</label>
              <select style={styles.select} name="status" value={form.status} onChange={handleChange}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Priority</label>
              <select style={styles.select} name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Assign To</label>
            <select style={styles.select} name="assignee_id" value={form.assignee_id} onChange={handleChange}>
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.full_name || u.username}</option>
              ))}
            </select>
          </div>
          <div style={styles.actions}>
            <button style={styles.btnCancel} type="button" onClick={onClose}>Cancel</button>
            <button style={styles.btnSubmit} type="submit">{task ? 'Save Changes' : 'Create Task'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}