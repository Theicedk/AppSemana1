// Run this once: node setup.js
// Creates the src/ directory structure with all React source files

const fs = require('fs');
const path = require('path');

const files = {
  'src/index.css': `
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: sans-serif; background: #f4f6f8; color: #333; }
`,

  'src/main.jsx': `
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
`.trimStart(),

  'src/api/productos.js': `
const BASE = '/api/productos';

export const getAll = () =>
  fetch(BASE).then(r => r.json());

export const getById = (id) =>
  fetch(\`\${BASE}/\${id}\`).then(r => r.json());

export const create = (data) =>
  fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json());

export const update = (id, data) =>
  fetch(\`\${BASE}/\${id}\`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json());

export const remove = (id) =>
  fetch(\`\${BASE}/\${id}\`, { method: 'DELETE' });
`.trimStart(),

  'src/components/ProductoForm.jsx': `
import { useState, useEffect } from 'react';

const empty = { nombre: '', descripcion: '', precio: '', stock: '' };

export default function ProductoForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    setForm(initial ? { ...initial, precio: initial.precio ?? '', stock: initial.stock ?? '' } : empty);
  }, [initial]);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = e => {
    e.preventDefault();
    onSubmit({ ...form, precio: parseFloat(form.precio), stock: parseInt(form.stock) });
  };

  return (
    <form onSubmit={submit} style={styles.form}>
      <h2 style={styles.title}>{initial ? 'Editar Producto' : 'Nuevo Producto'}</h2>

      {[
        { label: 'Nombre *', name: 'nombre', type: 'text', required: true },
        { label: 'Descripción', name: 'descripcion', type: 'text' },
        { label: 'Precio *', name: 'precio', type: 'number', required: true, step: '0.01' },
        { label: 'Stock *', name: 'stock', type: 'number', required: true },
      ].map(({ label, ...props }) => (
        <div key={props.name} style={styles.field}>
          <label style={styles.label}>{label}</label>
          <input
            {...props}
            value={form[props.name]}
            onChange={handle}
            style={styles.input}
          />
        </div>
      ))}

      <div style={styles.actions}>
        <button type="submit" style={styles.btnPrimary}>
          {initial ? 'Actualizar' : 'Crear'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={styles.btnSecondary}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

const styles = {
  form: { background: '#fff', padding: '1.5rem', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,.1)', marginBottom: '2rem' },
  title: { marginBottom: '1rem', fontSize: '1.2rem' },
  field: { marginBottom: '0.8rem' },
  label: { display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '.9rem' },
  input: { width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '1rem' },
  actions: { display: 'flex', gap: '0.5rem', marginTop: '1rem' },
  btnPrimary: { padding: '0.5rem 1.2rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 },
  btnSecondary: { padding: '0.5rem 1.2rem', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' },
};
`.trimStart(),

  'src/components/ProductoList.jsx': `
import { useState } from 'react';
import { remove } from '../api/productos';

export default function ProductoList({ productos, onEdit, onRefresh }) {
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    setDeleting(id);
    await remove(id);
    setDeleting(null);
    onRefresh();
  };

  if (!productos.length) {
    return <p style={{ textAlign: 'center', color: '#888' }}>No hay productos aún.</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            {['ID', 'Nombre', 'Descripción', 'Precio', 'Stock', 'Acciones'].map(h => (
              <th key={h} style={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {productos.map((p, i) => (
            <tr key={p.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
              <td style={styles.td}>{p.id}</td>
              <td style={styles.td}>{p.nombre}</td>
              <td style={styles.td}>{p.descripcion || '-'}</td>
              <td style={styles.td}>\${Number(p.precio).toFixed(2)}</td>
              <td style={styles.td}>{p.stock}</td>
              <td style={styles.td}>
                <button onClick={() => onEdit(p)} style={styles.btnEdit}>Editar</button>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deleting === p.id}
                  style={styles.btnDelete}
                >
                  {deleting === p.id ? '...' : 'Eliminar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.1)' },
  headerRow: { background: '#2563eb', color: '#fff' },
  th: { padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600 },
  td: { padding: '0.65rem 1rem', borderBottom: '1px solid #e5e7eb' },
  btnEdit: { marginRight: 6, padding: '0.3rem 0.7rem', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 },
  btnDelete: { padding: '0.3rem 0.7rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 },
};
`.trimStart(),

  'src/App.jsx': `
import { useEffect, useState } from 'react';
import { getAll, create, update } from './api/productos';
import ProductoForm from './components/ProductoForm';
import ProductoList from './components/ProductoList';

export default function App() {
  const [productos, setProductos] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAll();
      setProductos(data);
    } catch {
      setError('No se pudo conectar con la API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (data) => {
    if (editing) {
      await update(editing.id, data);
      setEditing(null);
    } else {
      await create(data);
    }
    load();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>📦 Gestión de Productos</h1>

      <ProductoForm
        initial={editing}
        onSubmit={handleSubmit}
        onCancel={editing ? () => setEditing(null) : undefined}
      />

      {error && <p style={styles.error}>{error}</p>}
      {loading ? (
        <p style={{ textAlign: 'center' }}>Cargando...</p>
      ) : (
        <ProductoList
          productos={productos}
          onEdit={setEditing}
          onRefresh={load}
        />
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 900, margin: '2rem auto', padding: '0 1rem' },
  heading: { textAlign: 'center', marginBottom: '1.5rem', color: '#1e3a8a', fontSize: '1.8rem' },
  error: { color: '#ef4444', textAlign: 'center', marginBottom: '1rem' },
};
`.trimStart(),
};

// Create directories and write files
for (const [filePath, content] of Object.entries(files)) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✓ Created', filePath);
}

console.log('\nDone! Now run:\n  npm install\n  npm run dev\n');
