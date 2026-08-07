package com.harmysewing.application.ports.in;

import com.harmysewing.domain.models.Commande;
import com.harmysewing.domain.models.StatutCommande;

import java.util.UUID;

public interface MettreAJourStatutKanbanInputPort {

    record Command(
            UUID commandeId,
            StatutCommande nouveauStatut
    ) {}

    Commande executer(Command command);
}
