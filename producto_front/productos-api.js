const BASE = '/api/productos';

export const getAll = () =>
  fetch(BASE).then(r => r.json());

export const getById = (id) =>
  fetch(`${BASE}/${id}`).then(r => r.json());

export const crear = (data) =>
  fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json());

export const actualizar = (id, data) =>
  fetch(`${BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json());

export const eliminar = (id) =>
  fetch(`${BASE}/${id}`, { method: 'DELETE' });

export const vender = (id, cantidad) =>
  fetch(`${BASE}/${id}/vender/${cantidad}`, { method: 'POST' });

export const getVentas = () =>
  fetch('/api/ventas').then(r => r.json());
