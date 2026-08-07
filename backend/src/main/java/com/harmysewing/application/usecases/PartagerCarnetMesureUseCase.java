package com.harmysewing.application.usecases;

import com.harmysewing.application.ports.in.PartagerCarnetMesureInputPort;
import com.harmysewing.application.ports.out.CarnetMesureRepositoryPort;
import com.harmysewing.application.ports.out.PartageCarnetRepositoryPort;
import com.harmysewing.application.ports.out.UserRepositoryPort;
import com.harmysewing.domain.exceptions.DomainException;
import com.harmysewing.domain.models.CarnetMesure;
import com.harmysewing.domain.models.PartageCarnet;
import com.harmysewing.domain.models.User;

import java.time.LocalDateTime;
import java.util.UUID;

public class PartagerCarnetMesureUseCase implements PartagerCarnetMesureInputPort {

    private final CarnetMesureRepositoryPort carnetMesureRepository;
    private final PartageCarnetRepositoryPort partageCarnetRepository;
    private final UserRepositoryPort userRepository;

    public PartagerCarnetMesureUseCase(
            CarnetMesureRepositoryPort carnetMesureRepository,
            PartageCarnetRepositoryPort partageCarnetRepository,
            UserRepositoryPort userRepository) {
        this.carnetMesureRepository = carnetMesureRepository;
        this.partageCarnetRepository = partageCarnetRepository;
        this.userRepository = userRepository;
    }

    @Override
    public PartageCarnet executer(Command command) {
        if (command.carnetMesureId() == null || command.couturiereId() == null) {
            throw new DomainException("Les identifiants du carnet et de la couturière sont obligatoires.");
        }

        CarnetMesure carnet = carnetMesureRepository.findById(command.carnetMesureId())
                .orElseThrow(() -> new DomainException("Carnet de mesures introuvable."));

        User couturiere = userRepository.findById(command.couturiereId())
                .orElseThrow(() -> new DomainException("Couturière introuvable avec l'ID: " + command.couturiereId()));

        if (!couturiere.isCouturiere()) {
            throw new DomainException("L'utilisateur spécifié n'a pas le rôle COUTURIERE.");
        }

        User demandeur = userRepository.findById(command.demandeurId())
                .orElseThrow(() -> new DomainException("Utilisateur demandeur introuvable."));

        // Seule la cliente propriétaire du carnet ou la couturière propriétaire peut effectuer le partage
        if (!carnet.canBeAccessedBy(demandeur)) {
            throw new DomainException("Vous n'avez pas l'autorisation de partager ce carnet de mesures.");
        }

        // Vérifie si le partage existe déjà
        if (partageCarnetRepository.existsByCarnetMesureIdAndCouturiereId(command.carnetMesureId(), command.couturiereId())) {
            return partageCarnetRepository.findByCarnetMesureIdAndCouturiereId(command.carnetMesureId(), command.couturiereId())
                    .orElseThrow();
        }

        PartageCarnet nouveauPartage = new PartageCarnet(
                UUID.randomUUID(),
                command.carnetMesureId(),
                command.couturiereId(),
                LocalDateTime.now()
        );

        return partageCarnetRepository.save(nouveauPartage);
    }
}
