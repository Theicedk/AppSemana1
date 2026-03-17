package com.example.demo.controller;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import com.example.demo.entity.Venta;
import com.example.demo.repository.ProductoRepository;
import com.example.demo.repository.VentaRepository;

@Service
public class ControladorKafka {

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private VentaRepository ventaRepository;

    @KafkaListener(topics = "ventas", groupId = "inventory-group")
    private void descuento(String mensaje) {
        String[] datos = mensaje.split(":");
        Long id = Long.parseLong(datos[0]);
        int cantidad = Integer.parseInt(datos[1]);
        productoRepository.findById(id).ifPresent(p -> {
            p.setStock(p.getStock() - cantidad);
            productoRepository.save(p);

            Venta venta = Venta.builder()
                    .productoId(p.getId())
                    .productoNombre(p.getNombre())
                    .cantidad(cantidad)
                    .fecha(LocalDateTime.now())
                    .build();
            ventaRepository.save(venta);
        });
    }
}
