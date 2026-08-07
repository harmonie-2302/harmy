package com.harmysewing.infrastructure.persistence.adapters;

import com.harmysewing.application.ports.out.CommandeRepositoryPort;
import com.harmysewing.domain.models.Commande;
import com.harmysewing.infrastructure.persistence.entities.CommandeJpaEntity;
import com.harmysewing.infrastructure.persistence.mappers.CommandePersistenceMapper;
import com.harmysewing.infrastructure.persistence.repositories.CommandeSpringDataRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class CommandePersistenceAdapter implements CommandeRepositoryPort {

    private final CommandeSpringDataRepository commandeSpringDataRepository;

    public CommandePersistenceAdapter(CommandeSpringDataRepository commandeSpringDataRepository) {
        this.commandeSpringDataRepository = commandeSpringDataRepository;
    }

    @Override
    public Commande save(Commande commande) {
        CommandeJpaEntity entity = CommandePersistenceMapper.toJpaEntity(commande);
        CommandeJpaEntity savedEntity = commandeSpringDataRepository.save(entity);
        return CommandePersistenceMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Commande> findById(UUID id) {
        return commandeSpringDataRepository.findById(id)
                .map(CommandePersistenceMapper::toDomain);
    }

    @Override
    public List<Commande> findByAtelierId(UUID atelierId) {
        return commandeSpringDataRepository.findByAtelierId(atelierId)
                .stream()
                .map(CommandePersistenceMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(UUID id) {
        commandeSpringDataRepository.deleteById(id);
    }
}
