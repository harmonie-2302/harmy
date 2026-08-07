package com.harmysewing.application.usecases;

import com.harmysewing.application.ports.in.CreerCommandeInputPort;
import com.harmysewing.application.ports.out.AtelierRepositoryPort;
import com.harmysewing.application.ports.out.CarnetMesureRepositoryPort;
import com.harmysewing.application.ports.out.CommandeRepositoryPort;
import com.harmysewing.application.ports.out.UserRepositoryPort;
import com.harmysewing.domain.exceptions.DomainException;
import com.harmysewing.domain.models.Atelier;
import com.harmysewing.domain.models.CarnetMesure;
import com.harmysewing.domain.models.Commande;
import com.harmysewing.domain.models.User;

import java.time.LocalDateTime;
import java.util.UUID;

public class CreerCommandeUseCase implements CreerCommandeInputPort {

    private final CommandeRepositoryPort commandeRepository;
    private final CarnetMesureRepositoryPort carnetMesureRepository;
    private final AtelierRepositoryPort atelierRepository;
    private final UserRepositoryPort userRepository;

    public CreerCommandeUseCase(
            CommandeRepositoryPort commandeRepository,
            CarnetMesureRepositoryPort carnetMesureRepository,
            AtelierRepositoryPort atelierRepository,
            UserRepositoryPort userRepository) {
        this.commandeRepository = commandeRepository;
        this.carnetMesureRepository = carnetMesureRepository;
        this.atelierRepository = atelierRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Commande executer(Command command) {
        if (command.carnetMesureId() == null) {
            throw new DomainException("Un carnet de mesures valide est obligatoire pour créer une commande.");
        }

        CarnetMesure carnet = carnetMesureRepository.findById(command.carnetMesureId())
                .orElseThrow(() -> new DomainException("Carnet de mesures introuvable avec l'ID: " + command.carnetMesureId()));

        Atelier atelier = null;
        if (command.atelierId() != null) {
            atelier = atelierRepository.findById(command.atelierId())
                    .orElseThrow(() -> new DomainException("Atelier introuvable avec l'ID: " + command.atelierId()));
        }

        User client = null;
        if (command.clientId() != null) {
            client = userRepository.findById(command.clientId())
                    .orElseThrow(() -> new DomainException("Client introuvable avec l'ID: " + command.clientId()));
        }

        UUID newId = UUID.randomUUID();
        Commande nouvelleCommande = new Commande(
                newId,
                command.reference() != null ? command.reference() : "CMD-" + System.currentTimeMillis(),
                client,
                atelier,
                carnet,
                command.prixTotal(),
                command.acompteVerse(),
                command.description(),
                LocalDateTime.now(),
                command.dateLivraisonPrevue()
        );

        return commandeRepository.save(nouvelleCommande);
    }
}
