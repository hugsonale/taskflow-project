import React from 'react';

const priorityColors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };
const statusColors = { todo: '#6366f1', in_progress: '#f59e0b', done: '#10b981' };
const statusLabels = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };

const styles = {
  card: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #f1f5f9', transition: 'box-shadow 0.2s' },
  taskTitle: { fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 6 },
  taskDesc: { fontSize: 13, color: '#64748b', marginBottom: 12, lineHeight: 1.5 },
  badges: { display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 },
  badge: (color) => ({ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: color + '15', color: color, textTransform: 'uppercase', letterSpacing: 0.5 }),
  meta: { fontSize: 12, color: '#94a3b8', marginBottom: 14 },
  assignee: { fontSize: 12, color: '#64748b', fontWeight: 600 },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  btnComplete: { padding: '6px 12px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  btnEdit: { padding: '6px 12px', background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  btnDelete: { padding: '6px 12px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  completed: { textDecoration: 'line-through', opacity: 0.5 },
  emptyState: { textAlign: 'center', padding: '60px 20px', color: '#94a3b8' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: 600 },
  emptySubtext: { fontSize: 13, marginTop: 6 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
};

function TaskCard({ task, currentUserId, onComplete, onEdit, onDelete }) {
  const isOwner = task.creator_id === currentUserId;

  return (
    <div style={styles.card}>
      <div style={{ ...styles.taskTitle, ...(task.is_completed ? styles.completed : {}) }}>
        {task.is_completed ? '✅ ' : ''}{task.title}
      </div>
      {task.description && (
        <div style={styles.taskDesc}>{task.description}</div>
      )}
      <div style={styles.badges}>
        <span style={styles.badge(statusColors[task.status] || '#6366f1')}>
          {statusLabels[task.status] || task.status}
        </span>
        <span style={styles.badge(priorityColors[task.priority] || '#94a3b8')}>
          {task.priority}
        </span>
      </div>
      {task.assignee && (
        <div style={styles.assignee}>
          👤 Assigned to: {task.assignee.full_name || task.assignee.username}
        </div>
      )}
      <div style={{ ...styles.meta, marginTop: 8 }}>
        Created by {task.creator?.full_name || task.creator?.username || 'Unknown'}
      </div>
      <div style={styles.actions}>
        {!task.is_completed && isOwner && (
          <button style={styles.btnComplete} onClick={() => onComplete(task.id)}>
            ✓ Complete
          </button>
        )}
        {isOwner && (
          <>
            <button style={styles.btnEdit} onClick={() => onEdit(task)}>
              ✏ Edit
            </button>
            <button style={styles.btnDelete} onClick={() => onDelete(task.id)}>
              🗑 Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function TaskList({ tasks, currentUserId, onComplete, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>📋</div>
        <div style={styles.emptyText}>No tasks yet</div>
        <div style={styles.emptySubtext}>Click "New Task" to get started</div>
      </div>
    );
  }

  return (
    <div style={styles.grid}>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          currentUserId={currentUserId}
          onComplete={onComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}