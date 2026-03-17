import { useEffect, useState } from 'react';
import { getAll, crear, actualizar, getVentas } from './productos-api';
import ProductoForm from './ProductoForm';
import ProductoList from './ProductoList';
import VentasList from './VentasList';

export default function App() {
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAll();
      setProductos(data);
      const ventasData = await getVentas();
      setVentas(ventasData);
    } catch {
      setError('No se pudo conectar con la API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await actualizar(editing.id, data);
        setEditing(null);
      } else {
        await crear(data);
      }
      load();
    } catch {
      setError('Error al guardar el producto.');
    }
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
        <>
          <ProductoList
            productos={productos}
            onEdit={setEditing}
            onRefresh={load}
          />
          <VentasList ventas={ventas} />
        </>
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: 900, margin: '2rem auto', padding: '0 1rem' },
  heading: { textAlign: 'center', marginBottom: '1.5rem', color: '#1e3a8a', fontSize: '1.8rem' },
  error: { color: '#ef4444', textAlign: 'center', marginBottom: '1rem', fontWeight: 600 },
};
