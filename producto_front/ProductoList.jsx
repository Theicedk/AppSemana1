import { useState } from 'react';
import { eliminar, vender } from './productos-api';

export default function ProductoList({ productos, onEdit, onRefresh }) {
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    setDeleting(id);
    await eliminar(id);
    setDeleting(null);
    onRefresh();
  };

  const handleSell = async (p) => {
    const cantidadStr = prompt(`¿Cuántas unidades de "${p.nombre}" desea vender? (Stock actual: ${p.stock})`, "1");
    if (!cantidadStr) return;
    const cantidad = parseInt(cantidadStr, 10);
    if (isNaN(cantidad) || cantidad <= 0) {
      alert('Cantidad inválida.');
      return;
    }
    if (cantidad > p.stock) {
      alert('Stock insuficiente.');
      return;
    }
    
    try {
      await vender(p.id, cantidad);
      alert(`Venta registrada. Quedarán ${p.stock - cantidad} en stock (se actualizará en breve).`);
      // Esperar un poco a que el mensaje de Kafka sea procesado
      setTimeout(() => onRefresh(), 500);
    } catch (e) {
      alert('Error al vender.');
    }
  };

  if (!productos.length) {
    return <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>No hay productos aún.</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            {['ID', 'Nombre', 'Descripción', 'Precio', 'Stock', 'Acciones'].map((h) => (
              <th key={h} style={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {productos.map((p, i) => (
            <tr key={p.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
              <td style={styles.td}>{p.id}</td>
              <td style={styles.td}>{p.nombre}</td>
              <td style={styles.td}>{p.descripcion || '—'}</td>
              <td style={styles.td}>${Number(p.precio).toFixed(2)}</td>
              <td style={styles.td}>{p.stock}</td>
              <td style={styles.td}>
                <button onClick={() => handleSell(p)} style={styles.btnSell}>Vender</button>
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
  btnSell: { marginRight: 6, padding: '0.3rem 0.7rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 },
  btnEdit: { marginRight: 6, padding: '0.3rem 0.7rem', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 },
  btnDelete: { padding: '0.3rem 0.7rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 },
};
