package com.harmysewing.presentation.api;

import com.harmysewing.application.ports.in.CreerCommandeInputPort;
import com.harmysewing.application.ports.in.MettreAJourStatutKanbanInputPort;
import com.harmysewing.application.ports.out.CarnetMesureRepositoryPort;
import com.harmysewing.application.ports.out.CommandeRepositoryPort;
import com.harmysewing.domain.exceptions.DomainException;
import com.harmysewing.domain.models.CarnetMesure;
import com.harmysewing.domain.models.Commande;
import com.harmysewing.presentation.dtos.CommandeResponse;
import com.harmysewing.presentation.dtos.CreateCommandeRequest;
import com.harmysewing.presentation.dtos.UpdateKanbanStatusRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/orders")
public class CommandeController {

    private final CreerCommandeInputPort creerCommandeInputPort;
    private final MettreAJourStatutKanbanInputPort mettreAJourStatutKanbanInputPort;
    private final CommandeRepositoryPort commandeRepositoryPort;
    private final CarnetMesureRepositoryPort carnetMesureRepositoryPort;

    public CommandeController(
            CreerCommandeInputPort creerCommandeInputPort,
            MettreAJourStatutKanbanInputPort mettreAJourStatutKanbanInputPort,
            CommandeRepositoryPort commandeRepositoryPort,
            CarnetMesureRepositoryPort carnetMesureRepositoryPort) {
        this.creerCommandeInputPort = creerCommandeInputPort;
        this.mettreAJourStatutKanbanInputPort = mettreAJourStatutKanbanInputPort;
        this.commandeRepositoryPort = commandeRepositoryPort;
        this.carnetMesureRepositoryPort = carnetMesureRepositoryPort;
    }

    @PostMapping
    public ResponseEntity<CommandeResponse> creerCommande(@Valid @RequestBody CreateCommandeRequest request) {
        UUID carnetId = request.carnetMesureId();
        if (carnetId == null) {
            List<CarnetMesure> carnets = carnetMesureRepositoryPort.findByClienteId(request.clientId());
            if (!carnets.isEmpty()) {
                carnetId = carnets.get(0).getId();
            } else {
                Map<String, Double> m = new HashMap<>();
                m.put("bust", 90.0);
                m.put("waist", 70.0);
                m.put("hips", 95.0);
                m.put("arm", 60.0);
                CarnetMesure nouveau = carnetMesureRepositoryPort.save(new CarnetMesure(
                        UUID.randomUUID(),
                        "Cliente",
                        null,
                        null,
                        false,
                        m,
                        LocalDateTime.now(),
                        LocalDateTime.now()
                ));
                carnetId = nouveau.getId();
            }
        }

        double total = request.prixTotal() != null ? request.prixTotal() : 0.0;
        double deposit = request.acompteVerse() != null ? request.acompteVerse() : 0.0;

        CreerCommandeInputPort.Command command = new CreerCommandeInputPort.Command(
                request.reference() != null ? request.reference() : "CMD-" + System.currentTimeMillis() % 100000,
                request.clientId(),
                request.atelierId(),
                carnetId,
                total,
                deposit,
                request.description(),
                request.dateLivraisonPrevue()
        );

        Commande commandeCreee = creerCommandeInputPort.executer(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(CommandeResponse.fromDomain(commandeCreee));
    }

    @GetMapping
    public ResponseEntity<List<CommandeResponse>> listerToutesLesCommandes() {
        List<CommandeResponse> commandes = commandeRepositoryPort.findAll()
                .stream()
                .map(CommandeResponse::fromDomain)
                .collect(Collectors.toList());
        return ResponseEntity.ok(commandes);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<CommandeResponse> mettreAJourStatutPatch(
            @PathVariable UUID id,
            @RequestBody UpdateKanbanStatusRequest request) {
        return mettreAJourStatut(id, request);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<CommandeResponse> mettreAJourStatutPut(
            @PathVariable UUID id,
            @RequestBody UpdateKanbanStatusRequest request) {
        return mettreAJourStatut(id, request);
    }

    private ResponseEntity<CommandeResponse> mettreAJourStatut(UUID id, UpdateKanbanStatusRequest request) {
        if (request.statut() == null) {
            throw new DomainException("Le statut de la commande est obligatoire.");
        }
        MettreAJourStatutKanbanInputPort.Command command = new MettreAJourStatutKanbanInputPort.Command(
                id,
                request.statut()
        );

        Commande commandeMiseAJour = mettreAJourStatutKanbanInputPort.executer(command);
        return ResponseEntity.ok(CommandeResponse.fromDomain(commandeMiseAJour));
    }

    @PutMapping("/{id}/payment")
    public ResponseEntity<CommandeResponse> ajouterPaiement(@PathVariable UUID id, @RequestBody Map<String, Number> body) {
        Commande commande = commandeRepositoryPort.findById(id)
                .orElseThrow(() -> new DomainException("Commande introuvable avec l'identifiant: " + id));

        double montant = body.get("amount") != null ? body.get("amount").doubleValue() : 0.0;
        double nouvelAcompte = commande.getAcompteVerse() + montant;
        double nouveauSolde = Math.max(0.0, commande.getPrixTotal() - nouvelAcompte);

        Commande commandeMiseAJour = new Commande(
                commande.getId(),
                commande.getReference(),
                commande.getClient(),
                commande.getAtelier(),
                commande.getCarnetMesure(),
                commande.getStatut(),
                commande.getPrixTotal(),
                nouvelAcompte,
                nouveauSolde,
                commande.getDescription(),
                commande.getDateCommande(),
                commande.getDateLivraisonPrevue()
        );

        Commande sauv = commandeRepositoryPort.save(commandeMiseAJour);
        return ResponseEntity.ok(CommandeResponse.fromDomain(sauv));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerCommande(@PathVariable UUID id) {
        commandeRepositoryPort.deleteById(id);
        return ResponseEntity.noContent().build();
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
