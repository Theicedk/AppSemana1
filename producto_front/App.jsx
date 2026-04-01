import { useEffect, useState } from 'react';
import axios from 'axios';
import { crear, actualizar } from './productos-api';
import ProductoForm from './ProductoForm';
import ProductoList from './ProductoList';
import VentaSection from './VentaSection';

export default function App() {
  const [productos, setProductos] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const listarProductos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/productos');
      setProductos(response.data);
    } catch (error) {
      console.error("Error al cargar productos", error);
      if (error.response) {
        // El servidor respondió con un código fuera del rango 2xx
        const status = error.response.status;
        if (status === 503) {
          console.error("Desconexión: La base de datos no responde.");
          alert("Sistema en mantenimiento o DB desconectada");
        } else if (status === 429) {
          console.error("Atochamiento: Demasiadas peticiones al circuito.");
          alert("Servidor sobrecargado, intente en unos segundos");
        }
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta
        console.error("Error de red o Servidor apagado");
        alert("Error de red o servidor no disponible");
      }
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { listarProductos(); }, []);

  const handleSubmit = async (data) => {
    try {
      if (editing) {
        await actualizar(editing.id, data);
        setEditing(null);
      } else {
        await crear(data);
      }
      listarProductos();
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
            onRefresh={listarProductos}
          />
          <VentaSection onStockChanged={listarProductos} />
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
