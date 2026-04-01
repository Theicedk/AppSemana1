package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.repository.ProductoRepository;
import com.example.demo.entity.Producto;
import com.example.demo.service.ProductoService;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;
    private final ProductoRepository productoRepository;
    private final KafkaTemplate<String, Producto> kafkaTemplate;

    @GetMapping
    @CircuitBreaker(name = "productosCircuitBreaker", fallbackMethod = "fallbackListar")
    @Retry(name = "productosRetry")
    public List<Producto> getAll() {
        return productoService.findAll();
    }

    // --- MÉTODOS FALLBACK (Resiliencia) ---

    // Si la DB falla al listar, devolvemos una lista vacía o un mensaje
    public List<Producto> fallbackListar(Throwable e) {
        System.err.println("Error al listar: " + e.getMessage());
        // Al lanzar esta excepción, Spring envía un HTTP 503 al Frontend
        throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE, "La base de datos no está disponible");
        // return Collections.emptyList(); // Evita que el frontend explote enviando
        // valores nulos
    }

    @GetMapping("/{id}")
    @CircuitBreaker(name = "productosCircuitBreaker", fallbackMethod = "fallbackGetById")
    @Retry(name = "productosRetry")
    public ResponseEntity<Producto> getById(@PathVariable Long id) {
        return productoService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    public ResponseEntity<Producto> fallbackGetById(Long id, Throwable t) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
    }

    @PostMapping
    @CircuitBreaker(name = "productosCircuitBreaker", fallbackMethod = "fallbackGrabar")
    @Retry(name = "productosRetry")
    public Producto create(@RequestBody Producto producto) {
        return productoService.save(producto);
    }

    // Si la DB falla al grabar, podrías informar al usuario o mandarlo a Kafka
    public Producto fallbackGrabar(Producto pro, Throwable e) {
        System.err.println("Error al grabar, circuito abierto: " + e.getMessage());
        // Creamos un objeto ficticio para avisar al frontend
        kafkaTemplate.send("productos-pendientes", pro);
        Producto errorPro = new Producto();
        errorPro.setNombre("Sistema temporalmente fuera de línea. Intente más tarde.");
        return errorPro;
    }

    @KafkaListener(topics = "productos-pendientes", groupId = "ecommerce-group")
    public void escuchar(Producto pro) {
        // Aquí procesas el producto cuando la DB esté lista
        productoRepository.save(pro);
    }

    @PutMapping("/{id}")
    @CircuitBreaker(name = "productosCircuitBreaker", fallbackMethod = "fallbackUpdate")
    @Retry(name = "productosRetry")
    public ResponseEntity<Producto> update(@PathVariable Long id, @RequestBody Producto producto) {
        return productoService.update(id, producto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    public ResponseEntity<Producto> fallbackUpdate(Long id, Producto producto, Throwable t) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
    }

    @DeleteMapping("/{id}")
    @CircuitBreaker(name = "productosCircuitBreaker", fallbackMethod = "fallbackDelete")
    @Retry(name = "productosRetry")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return productoService.delete(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }

    public ResponseEntity<Void> fallbackDelete(Long id, Throwable t) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
    }

    @PostMapping("/{id}/vender/{cantidad}")
    @CircuitBreaker(name = "productosCircuitBreaker", fallbackMethod = "fallbackSell")
    @Retry(name = "productosRetry")
    public ResponseEntity<Void> sell(@PathVariable Long id, @PathVariable int cantidad) {
        productoService.sell(id, cantidad);
        return ResponseEntity.accepted().build();
    }

    public ResponseEntity<Void> fallbackSell(Long id, int cantidad, Throwable t) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
    }
}
