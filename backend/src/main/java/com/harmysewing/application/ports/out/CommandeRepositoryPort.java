package com.harmysewing.application.ports.out;

import com.harmysewing.domain.models.Commande;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommandeRepositoryPort {
    Commande save(Commande commande);
    Optional<Commande> findById(UUID id);
    List<Commande> findAll();
    List<Commande> findByAtelierId(UUID atelierId);
    void deleteById(UUID id);
}
