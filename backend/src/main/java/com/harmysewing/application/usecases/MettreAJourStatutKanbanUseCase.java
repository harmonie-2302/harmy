package com.harmysewing.application.usecases;

import com.harmysewing.application.ports.in.MettreAJourStatutKanbanInputPort;
import com.harmysewing.application.ports.out.CommandeRepositoryPort;
import com.harmysewing.domain.exceptions.DomainException;
import com.harmysewing.domain.models.Commande;

public class MettreAJourStatutKanbanUseCase implements MettreAJourStatutKanbanInputPort {

    private final CommandeRepositoryPort commandeRepository;

    public MettreAJourStatutKanbanUseCase(CommandeRepositoryPort commandeRepository) {
        this.commandeRepository = commandeRepository;
    }

    @Override
    public Commande executer(Command command) {
        if (command.commandeId() == null) {
            throw new DomainException("L'identifiant de la commande est obligatoire.");
        }
        if (command.nouveauStatut() == null) {
            throw new DomainException("Le nouveau statut Kanban est obligatoire.");
        }

        Commande commande = commandeRepository.findById(command.commandeId())
                .orElseThrow(() -> new DomainException("Commande introuvable avec l'ID: " + command.commandeId()));

        // Applique les règles métiers d'état (ex: solde == 0 pour passage à LIVRE)
        commande.setStatut(command.nouveauStatut());

        return commandeRepository.save(commande);
    }
}
