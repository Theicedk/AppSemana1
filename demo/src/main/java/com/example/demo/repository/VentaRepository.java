package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entity.Venta;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {
}