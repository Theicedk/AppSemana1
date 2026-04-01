import { useState, useEffect } from 'react';
import { vender, getVentas, getAll } from './productos-api';

export default function VentaSection({ onStockChanged }) {
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', error: false });

  const loadVentas = async () => {
    try {
      setLoading(true);
      const [v, p] = await Promise.all([getVentas(), getAll()]);
      setVentas(v);
      setProductos(p);
    } catch {
      setMsg({ text: 'Error al cargar ventas.', error: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVentas(); }, []);

  const handleVender = async (e) => {
    e.preventDefault();
    setMsg({ text: '', error: false });
    try {
      const res = await vender(productoId, parseInt(cantidad, 10));
      if (res.ok) {
        setMsg({ text: `Venta enviada — Producto #${productoId} x${cantidad}`, error: false });
        setProductoId('');
        setCantidad('');
        // Pequeño delay para que Kafka procese el mensaje
        setTimeout(() => { loadVentas(); onStockChanged(); }, 800);
      } else {
        const text = await res.text();
        setMsg({ text: text || 'Error al realizar la venta.', error: true });
      }
    } catch {
      setMsg({ text: 'No se pudo conectar con la API.', error: true });
    }
  };

  return (
    <div style={{ marginTop: '2.5rem' }}>
      <h2 style={styles.heading}>🛒 Registrar Venta (Kafka)</h2>
      <p style={styles.sub}>Envía un mensaje al topic <code>ventas</code> → descuenta stock automáticamente.</p>

      <form onSubmit={handleVender} style={styles.form}>
        <div style={styles.grid}>
          <div>
            <label style={styles.label}>Producto *</label>
            <select
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
              required
              style={styles.input}
            >
              <option value="">— Seleccionar —</option>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.id} — {p.nombre} (stock: {p.stock})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={styles.label}>Cantidad *</label>
            <input
              type="number"
              min="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
              style={styles.input}
            />
          </div>
        </div>
        <button type="submit" style={styles.btnVender}>Vender</button>
      </form>

      {msg.text && (
        <p style={{ ...styles.msg, color: msg.error ? '#ef4444' : '#16a34a' }}>{msg.text}</p>
      )}

      <h3 style={styles.subHeading}>Historial de Ventas</h3>
      {loading ? (
        <p style={{ textAlign: 'center' }}>Cargando...</p>
      ) : !ventas.length ? (
        <p style={{ textAlign: 'center', color: '#888' }}>No hay ventas registradas.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                {['ID', 'Producto', 'Nombre', 'Cantidad', 'Fecha'].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ventas.map((v, i) => (
                <tr key={v.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                  <td style={styles.td}>{v.id}</td>
                  <td style={styles.td}>#{v.productoId}</td>
                  <td style={styles.td}>{v.productoNombre}</td>
                  <td style={styles.td}>{v.cantidad}</td>
                  <td style={styles.td}>{new Date(v.fecha).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  heading: { color: '#1e3a8a', fontSize: '1.4rem', marginBottom: '.3rem' },
  sub: { color: '#6b7280', fontSize: '.9rem', marginBottom: '1rem' },
  subHeading: { color: '#1e3a8a', fontSize: '1.1rem', margin: '1.5rem 0 .8rem' },
  form: { background: '#fff', padding: '1.2rem', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,.1)' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', marginBottom: '.8rem' },
  label: { display: 'block', marginBottom: 4, fontWeight: 600, fontSize: '.85rem' },
  input: { width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: 4, fontSize: '1rem' },
  btnVender: { padding: '0.5rem 1.5rem', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: '.95rem' },
  msg: { textAlign: 'center', fontWeight: 600, marginTop: '.8rem' },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.1)' },
  headerRow: { background: '#16a34a', color: '#fff' },
  th: { padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600 },
  td: { padding: '0.65rem 1rem', borderBottom: '1px solid #e5e7eb' },
};
