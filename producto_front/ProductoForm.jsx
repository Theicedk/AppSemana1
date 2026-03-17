import { useState, useEffect } from 'react';

const empty = { nombre: '', descripcion: '', precio: '', stock: '' };

export default function ProductoForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    setForm(
      initial
        ? { nombre: initial.nombre, descripcion: initial.descripcion || '', precio: String(initial.precio), stock: String(initial.stock) }
        : empty
    );
  }, [initial]);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      nombre: form.nombre,
      descripcion: form.descripcion,
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock, 10),
    });
    if (!initial) setForm(empty);
  };

  return (
    <form onSubmit={submit} style={styles.form}>
      <h2 style={styles.title}>{initial ? 'Editar Producto' : 'Nuevo Producto'}</h2>

      <div style={styles.grid}>
        <div style={styles.field}>
          <label style={styles.label}>Nombre *</label>
          <input name="nombre" value={form.nombre} onChange={handle} required style={styles.input} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Descripción</label>
          <input name="descripcion" value={form.descripcion} onChange={handle} style={styles.input} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Precio *</label>
          <input name="precio" type="number" step="0.01" value={form.precio} onChange={handle} required style={styles.input} />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Stock *</label>
          <input name="stock" type="number" value={form.stock} onChange={handle} required style={styles.input} />
        </div>
      </div>

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
  title: { marginBottom: '1rem', fontSize: '1.25rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' },
  field: {},
  label: { display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '.85rem' },
  input: { width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '1rem' },
  actions: { display: 'flex', gap: '0.5rem', marginTop: '1rem' },
  btnPrimary: { padding: '0.5rem 1.2rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: '.95rem' },
  btnSecondary: { padding: '0.5rem 1.2rem', background: '#6b7280', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '.95rem' },
};
