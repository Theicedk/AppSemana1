export default function VentasList({ ventas }) {
  if (!ventas || !ventas.length) {
    return <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>No hay ventas registradas aún.</p>;
  }

  return (
    <div style={{ overflowX: 'auto', marginTop: '2rem' }}>
      <h2 style={{ textAlign: 'center', color: '#16a34a', marginBottom: '1rem' }}>Historial de Ventas</h2>
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th style={styles.th}>ID Venta</th>
            <th style={styles.th}>Producto</th>
            <th style={styles.th}>Cantidad</th>
            <th style={styles.th}>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((v, i) => (
            <tr key={v.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
              <td style={styles.td}>{v.id}</td>
              <td style={styles.td}>{v.productoNombre} (ID: {v.productoId})</td>
              <td style={styles.td}>{v.cantidad}</td>
              <td style={styles.td}>{new Date(v.fecha).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.1)' },
  headerRow: { background: '#16a34a', color: '#fff' },
  th: { padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600 },
  td: { padding: '0.65rem 1rem', borderBottom: '1px solid #e5e7eb' }
};