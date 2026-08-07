package com.harmysewing.presentation.api;

import com.harmysewing.application.ports.in.CreerCommandeInputPort;
import com.harmysewing.application.ports.in.MettreAJourStatutKanbanInputPort;
import com.harmysewing.application.ports.out.CommandeRepositoryPort;
import com.harmysewing.domain.exceptions.DomainException;
import com.harmysewing.domain.models.Commande;
import com.harmysewing.presentation.dtos.CommandeResponse;
import com.harmysewing.presentation.dtos.CreateCommandeRequest;
import com.harmysewing.presentation.dtos.UpdateKanbanStatusRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/orders")
public class CommandeController {

    private final CreerCommandeInputPort creerCommandeInputPort;
    private final MettreAJourStatutKanbanInputPort mettreAJourStatutKanbanInputPort;
    private final CommandeRepositoryPort commandeRepositoryPort;

    public CommandeController(
            CreerCommandeInputPort creerCommandeInputPort,
            MettreAJourStatutKanbanInputPort mettreAJourStatutKanbanInputPort,
            CommandeRepositoryPort commandeRepositoryPort) {
        this.creerCommandeInputPort = creerCommandeInputPort;
        this.mettreAJourStatutKanbanInputPort = mettreAJourStatutKanbanInputPort;
        this.commandeRepositoryPort = commandeRepositoryPort;
    }

    @PostMapping
    public ResponseEntity<CommandeResponse> creerCommande(@Valid @RequestBody CreateCommandeRequest request) {
        CreerCommandeInputPort.Command command = new CreerCommandeInputPort.Command(
                request.reference(),
                request.clientId(),
                request.atelierId(),
                request.carnetMesureId(),
                request.prixTotal(),
                request.acompteVerse(),
                request.description(),
                request.dateLivraisonPrevue()
        );

        Commande commandeCreee = creerCommandeInputPort.executer(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(CommandeResponse.fromDomain(commandeCreee));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CommandeResponse> mettreAJourStatut(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateKanbanStatusRequest request) {
        MettreAJourStatutKanbanInputPort.Command command = new MettreAJourStatutKanbanInputPort.Command(
                id,
                request.statut()
        );

        Commande commandeMiseAJour = mettreAJourStatutKanbanInputPort.executer(command);
        return ResponseEntity.ok(CommandeResponse.fromDomain(commandeMiseAJour));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommandeResponse> obtenirCommandeParId(@PathVariable UUID id) {
        Commande commande = commandeRepositoryPort.findById(id)
                .orElseThrow(() -> new DomainException("Commande introuvable avec l'identifiant: " + id));
        return ResponseEntity.ok(CommandeResponse.fromDomain(commande));
    }

    @GetMapping("/atelier/{atelierId}")
    public ResponseEntity<List<CommandeResponse>> listerCommandesParAtelier(@PathVariable UUID atelierId) {
        List<CommandeResponse> commandes = commandeRepositoryPort.findByAtelierId(atelierId)
                .stream()
                .map(CommandeResponse::fromDomain)
                .collect(Collectors.toList());
        return ResponseEntity.ok(commandes);
    }
}
