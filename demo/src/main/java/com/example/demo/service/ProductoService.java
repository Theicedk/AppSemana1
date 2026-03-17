package com.example.demo.service;

import java.util.List;
import java.util.Optional;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.example.demo.entity.Producto;
import com.example.demo.repository.ProductoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private static final String TOPIC = "productos-topic";

    private final ProductoRepository productoRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public List<Producto> findAll() {
        return productoRepository.findAll();
    }

    public Optional<Producto> findById(Long id) {
        return productoRepository.findById(id);
    }

    public Producto save(Producto producto) {
        Producto saved = productoRepository.save(producto);
        kafkaTemplate.send(TOPIC, "CREATED:" + saved.getId());
        return saved;
    }

    public Optional<Producto> update(Long id, Producto productoActualizado) {
        return productoRepository.findById(id).map(producto -> {
            producto.setNombre(productoActualizado.getNombre());
            producto.setDescripcion(productoActualizado.getDescripcion());
            producto.setPrecio(productoActualizado.getPrecio());
            producto.setStock(productoActualizado.getStock());
            Producto saved = productoRepository.save(producto);
            kafkaTemplate.send(TOPIC, "UPDATED:" + saved.getId());
            return saved;
        });
    }

    public boolean delete(Long id) {
        return productoRepository.findById(id).map(producto -> {
            productoRepository.delete(producto);
            kafkaTemplate.send(TOPIC, "DELETED:" + id);
            return true;
        }).orElse(false);
    }

    public void sell(Long id, int cantidad) {
        kafkaTemplate.send("ventas", id + ":" + cantidad);
    }
}
