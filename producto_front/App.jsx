import { useEffect, useState } from 'react';
import axios from 'axios';
import { crear, actualizar } from './productos-api';
import ProductoForm from './ProductoForm';
import ProductoList from './ProductoList';
import VentaSection from './VentaSection';
import { Login, Logout } from './LoginLogout';
import { useAuth0 } from '@auth0/auth0-react';

export default function App() {
  const {user, isLoading,isAuthenticated,getAccessTokenSilently} = useAuth0();
  const [productos, setProductos] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const listarProductos = async () => {
    try {
      setLoading(true);
      setError('');
      
      let token;
      try {
        token = await getAccessTokenSilently();
      } catch (tokenErr) {
        console.error("Error obteniendo token de Auth0:", tokenErr);
        setError('Error al autenticarse con Auth0. Por favor, intenta de nuevo.');
        setLoading(false);
        return;
      }
      
      const config = {headers: {Authorization: `Bearer ${token}`}};
      const response = await axios.get('/api/productos', config);
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

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      listarProductos();
    }
  }, [isAuthenticated, isLoading]);

  const handleSubmit = async (data) => {
    let token;
    try {
      token = await getAccessTokenSilently();
    } catch (tokenErr) {
      console.error("Error obteniendo token de Auth0:", tokenErr);
      setError('Error al autenticarse con Auth0. Por favor, intenta de nuevo.');
      return;
    }
    
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    try {
      if (editing) {
        await actualizar(editing.id, data, config);
        setEditing(null);
      } else {
        await crear(data, config);
      }
      listarProductos();
    } catch {
      setError('Error al guardar el producto.');
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>📦 Gestión de Productos</h1>
      {!isAuthenticated ? (
        <>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1e3a8a' }}>Bienvenido, por favor inicia sesión para gestionar los productos</h2>
          <Login></Login>
        </>
      ) : (
        <>
          <Logout></Logout>
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
