package com.harmysewing.application.ports.in;

import com.harmysewing.domain.models.Commande;

import java.time.LocalDateTime;
import java.util.UUID;

public interface CreerCommandeInputPort {

    record Command(
            String reference,
            UUID clientId,
            UUID atelierId,
            UUID carnetMesureId,
            Double prixTotal,
            Double acompteVerse,
            String description,
            LocalDateTime dateLivraisonPrevue
    ) {}

    Commande executer(Command command);
}
