package com.harmysewing.presentation.api;

import com.harmysewing.application.ports.in.CreerCommandeInputPort;
import com.harmysewing.application.ports.in.MettreAJourStatutKanbanInputPort;
import com.harmysewing.application.ports.out.CarnetMesureRepositoryPort;
import com.harmysewing.application.ports.out.CommandeRepositoryPort;
import com.harmysewing.application.services.AtelierProvisioningService;
import com.harmysewing.domain.exceptions.DomainException;
import com.harmysewing.domain.models.Atelier;
import com.harmysewing.domain.models.CarnetMesure;
import com.harmysewing.domain.models.Commande;
import com.harmysewing.domain.models.User;
import com.harmysewing.infrastructure.persistence.entities.CustomerJpaEntity;
import com.harmysewing.infrastructure.persistence.repositories.CustomerSpringDataRepository;
import com.harmysewing.infrastructure.security.CurrentUserProvider;
import com.harmysewing.presentation.dtos.CommandeResponse;
import com.harmysewing.presentation.dtos.CreateCommandeRequest;
import com.harmysewing.presentation.dtos.UpdateKanbanStatusRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.Comparator;
import java.util.LinkedHashMap;
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
    private final CustomerSpringDataRepository customerRepository;
    private final CurrentUserProvider currentUserProvider;
    private final AtelierProvisioningService atelierProvisioningService;

    public CommandeController(
            CreerCommandeInputPort creerCommandeInputPort,
            MettreAJourStatutKanbanInputPort mettreAJourStatutKanbanInputPort,
            CommandeRepositoryPort commandeRepositoryPort,
            CarnetMesureRepositoryPort carnetMesureRepositoryPort,
            CustomerSpringDataRepository customerRepository,
            CurrentUserProvider currentUserProvider,
            AtelierProvisioningService atelierProvisioningService) {
        this.creerCommandeInputPort = creerCommandeInputPort;
        this.mettreAJourStatutKanbanInputPort = mettreAJourStatutKanbanInputPort;
        this.commandeRepositoryPort = commandeRepositoryPort;
        this.carnetMesureRepositoryPort = carnetMesureRepositoryPort;
        this.customerRepository = customerRepository;
        this.currentUserProvider = currentUserProvider;
        this.atelierProvisioningService = atelierProvisioningService;
    }

    // ------------------------------------------------------------------
    // Création
    // ------------------------------------------------------------------

    @PostMapping
    public ResponseEntity<CommandeResponse> creerCommande(@Valid @RequestBody CreateCommandeRequest request) {
        User user = currentUserProvider.exigerUtilisateur();

        UUID atelierId;
        UUID carnetId;
        UUID clientId;

        if (user.isCouturiere()) {
            Atelier atelier = atelierProvisioningService.assurerAtelier(user);
            atelierId = atelier.getId();

            CustomerJpaEntity fiche = resoudreFicheCliente(request.customerRefId(), atelierId);
            clientId = fiche.getRegisteredUserId();
            carnetId = request.carnetMesureId() != null
                    ? request.carnetMesureId()
                    : carnetPourFiche(fiche, user).getId();
        } else {
            // Une cliente commande auprès d'un atelier : l'atelier doit être fourni.
            if (request.atelierId() == null) {
                throw new DomainException("L'atelier destinataire de la commande est obligatoire.");
            }
            atelierId = request.atelierId();
            clientId = user.getId();
            carnetId = request.carnetMesureId() != null
                    ? request.carnetMesureId()
                    : carnetPourCliente(user).getId();
        }

        CreerCommandeInputPort.Command command = new CreerCommandeInputPort.Command(
                request.reference() != null && !request.reference().isBlank()
                        ? request.reference()
                        : genererReference(),
                clientId,
                atelierId,
                carnetId,
                request.prixTotal() != null ? request.prixTotal() : 0.0,
                request.acompteVerse() != null ? request.acompteVerse() : 0.0,
                descriptionOuDefaut(request.description()),
                parseDate(request.dateLivraisonPrevue())
        );

        Commande commandeCreee = creerCommandeInputPort.executer(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(CommandeResponse.fromDomain(commandeCreee));
    }

    // ------------------------------------------------------------------
    // Lecture
    // ------------------------------------------------------------------

    /** Chaque profil ne voit que les commandes qui le concernent. */
    @GetMapping
    public ResponseEntity<List<CommandeResponse>> listerCommandes() {
        User user = currentUserProvider.exigerUtilisateur();

        List<Commande> commandes;
        if (user.isAdmin()) {
            commandes = commandeRepositoryPort.findAll();
        } else if (user.isCouturiere()) {
            commandes = commandeRepositoryPort.findByAtelierId(
                    atelierProvisioningService.assurerAtelier(user).getId());
        } else {
            commandes = commandeRepositoryPort.findByClientId(user.getId());
        }

        List<CommandeResponse> reponses = commandes.stream()
                .sorted(Comparator.comparing(
                        Commande::getDateCommande,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(CommandeResponse::fromDomain)
                .collect(Collectors.toList());

        return ResponseEntity.ok(reponses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommandeResponse> obtenirCommandeParId(@PathVariable UUID id) {
        User user = currentUserProvider.exigerUtilisateur();
        Commande commande = chargerCommande(id);
        exigerLecture(user, commande);
        return ResponseEntity.ok(CommandeResponse.fromDomain(commande));
    }

    @GetMapping("/atelier/{atelierId}")
    public ResponseEntity<List<CommandeResponse>> listerCommandesParAtelier(@PathVariable UUID atelierId) {
        User user = currentUserProvider.exigerUtilisateur();
        if (!user.isAdmin()) {
            UUID sien = atelierProvisioningService.trouverPourCouturiere(user.getId())
                    .map(Atelier::getId).orElse(null);
            if (!atelierId.equals(sien)) {
                throw new DomainException("Vous ne pouvez consulter que les commandes de votre atelier.");
            }
        }

        List<CommandeResponse> commandes = commandeRepositoryPort.findByAtelierId(atelierId).stream()
                .sorted(Comparator.comparing(
                        Commande::getDateCommande,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(CommandeResponse::fromDomain)
                .collect(Collectors.toList());
        return ResponseEntity.ok(commandes);
    }

    // ------------------------------------------------------------------
    // Mise à jour
    // ------------------------------------------------------------------

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
        User user = currentUserProvider.exigerUtilisateur();
        exigerAtelierDeLaCommande(user, chargerCommande(id));

        if (request == null || request.statut() == null) {
            throw new DomainException("Le statut de la commande est obligatoire.");
        }

        Commande commandeMiseAJour = mettreAJourStatutKanbanInputPort.executer(
                new MettreAJourStatutKanbanInputPort.Command(id, request.statut()));
        return ResponseEntity.ok(CommandeResponse.fromDomain(commandeMiseAJour));
    }

    /** Modification du devis : montant, acompte, modèle, échéance. */
    @PutMapping("/{id}")
    public ResponseEntity<CommandeResponse> mettreAJourCommande(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {

        User user = currentUserProvider.exigerUtilisateur();
        Commande commande = chargerCommande(id);
        exigerAtelierDeLaCommande(user, commande);

        if (body.get("total") != null || body.get("prixTotal") != null) {
            Object brut = body.get("total") != null ? body.get("total") : body.get("prixTotal");
            double total = nombre(brut, commande.getPrixTotal());
            if (total < 0) {
                throw new DomainException("Le prix total ne peut pas être négatif.");
            }
            commande.setPrixTotal(total);
        }

        if (body.get("deposit") != null || body.get("acompteVerse") != null) {
            Object brut = body.get("deposit") != null ? body.get("deposit") : body.get("acompteVerse");
            double acompte = nombre(brut, commande.getAcompteVerse());
            if (acompte < 0) {
                throw new DomainException("L'acompte ne peut pas être négatif.");
            }
            if (commande.getPrixTotal() != null && acompte > commande.getPrixTotal()) {
                throw new DomainException("L'acompte ne peut pas dépasser le montant total.");
            }
            commande.setAcompteVerse(acompte);
        }

        Object caption = body.get("modelCaption") != null ? body.get("modelCaption") : body.get("description");
        if (caption != null) {
            commande.setDescription(descriptionOuDefaut(caption.toString()));
        }

        Object echeance = body.get("dueDate") != null ? body.get("dueDate") : body.get("dateLivraisonPrevue");
        if (echeance != null) {
            commande.setDateLivraisonPrevue(parseDate(echeance.toString()));
        }

        commande.recalculerSolde();
        Commande sauvegarde = commandeRepositoryPort.save(commande);
        return ResponseEntity.ok(CommandeResponse.fromDomain(sauvegarde));
    }

    /** Encaissement d'un versement complémentaire. */
    @PutMapping("/{id}/payment")
    public ResponseEntity<CommandeResponse> ajouterPaiement(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {

        User user = currentUserProvider.exigerUtilisateur();
        Commande commande = chargerCommande(id);
        exigerAtelierDeLaCommande(user, commande);

        double montant = nombre(body.get("amount"), 0.0);
        if (montant <= 0) {
            throw new DomainException("Le montant du paiement doit être supérieur à zéro.");
        }

        double dejaVerse = commande.getAcompteVerse() != null ? commande.getAcompteVerse() : 0.0;
        double total = commande.getPrixTotal() != null ? commande.getPrixTotal() : 0.0;
        if (dejaVerse + montant > total) {
            throw new DomainException("Ce versement dépasse le solde restant ("
                    + Math.max(0.0, total - dejaVerse) + " FC).");
        }

        commande.ajouterPaiement(montant);
        Commande sauvegarde = commandeRepositoryPort.save(commande);
        return ResponseEntity.ok(CommandeResponse.fromDomain(sauvegarde));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerCommande(@PathVariable UUID id) {
        User user = currentUserProvider.exigerUtilisateur();
        exigerAtelierDeLaCommande(user, chargerCommande(id));

        commandeRepositoryPort.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ------------------------------------------------------------------
    // Utilitaires
    // ------------------------------------------------------------------

    private Commande chargerCommande(UUID id) {
        return commandeRepositoryPort.findById(id)
                .orElseThrow(() -> new DomainException("Commande introuvable avec l'identifiant: " + id));
    }

    private CustomerJpaEntity resoudreFicheCliente(UUID customerRefId, UUID atelierId) {
        if (customerRefId == null) {
            throw new DomainException("Sélectionnez la cliente concernée par la commande.");
        }
        CustomerJpaEntity fiche = customerRepository.findById(customerRefId)
                .orElseThrow(() -> new DomainException("Fiche cliente introuvable."));
        if (!atelierId.equals(fiche.getAtelierId())) {
            throw new DomainException("Cette fiche cliente appartient à un autre atelier.");
        }
        return fiche;
    }

    /** Un carnet par fiche cliente, réutilisé d'une commande à l'autre. */
    private CarnetMesure carnetPourFiche(CustomerJpaEntity fiche, User couturiere) {
        Map<String, Double> mesures = new LinkedHashMap<>();
        mesures.put("bust", fiche.getBust() != null ? fiche.getBust() : 0.0);
        mesures.put("waist", fiche.getWaist() != null ? fiche.getWaist() : 0.0);
        mesures.put("hips", fiche.getHips() != null ? fiche.getHips() : 0.0);
        mesures.put("arm", fiche.getArm() != null ? fiche.getArm() : 0.0);

        CarnetMesure existant = carnetMesureRepositoryPort.findByCustomerId(fiche.getId()).orElse(null);
        if (existant != null) {
            existant.setNomClient(fiche.getName());
            existant.setMesures(mesures);
            existant.setDateModification(LocalDateTime.now());
            return carnetMesureRepositoryPort.save(existant);
        }

        return carnetMesureRepositoryPort.save(new CarnetMesure(
                UUID.randomUUID(),
                fiche.getName(),
                null,
                couturiere,
                true,
                mesures,
                LocalDateTime.now(),
                LocalDateTime.now(),
                fiche.getId()
        ));
    }

    /** Carnet personnel d'une cliente, créé vide s'il n'existe pas encore. */
    private CarnetMesure carnetPourCliente(User cliente) {
        List<CarnetMesure> carnets = carnetMesureRepositoryPort.findByClienteId(cliente.getId());
        if (!carnets.isEmpty()) {
            return carnets.get(0);
        }

        Map<String, Double> mesures = new LinkedHashMap<>();
        mesures.put("bust", 0.0);
        mesures.put("waist", 0.0);
        mesures.put("hips", 0.0);
        mesures.put("arm", 0.0);

        return carnetMesureRepositoryPort.save(new CarnetMesure(
                UUID.randomUUID(),
                cliente.getDisplayName(),
                cliente,
                null,
                false,
                mesures,
                LocalDateTime.now(),
                LocalDateTime.now()
        ));
    }

    private void exigerLecture(User user, Commande commande) {
        if (user.isAdmin()) {
            return;
        }
        UUID atelierId = commande.getAtelier() != null ? commande.getAtelier().getId() : null;
        UUID clientId = commande.getClient() != null ? commande.getClient().getId() : null;

        boolean estSonAtelier = atelierId != null && atelierId.equals(
                atelierProvisioningService.trouverPourCouturiere(user.getId()).map(Atelier::getId).orElse(null));
        boolean estSaCommande = user.getId().equals(clientId);

        if (!estSonAtelier && !estSaCommande) {
            throw new DomainException("Cette commande ne vous est pas accessible.");
        }
    }

    private void exigerAtelierDeLaCommande(User user, Commande commande) {
        if (user.isAdmin()) {
            return;
        }
        UUID atelierId = commande.getAtelier() != null ? commande.getAtelier().getId() : null;
        UUID sien = atelierProvisioningService.trouverPourCouturiere(user.getId())
                .map(Atelier::getId).orElse(null);

        if (atelierId == null || sien == null || !atelierId.equals(sien)) {
            throw new DomainException("Seul l'atelier en charge peut modifier cette commande.");
        }
    }

    private String descriptionOuDefaut(String description) {
        return description != null && !description.isBlank() ? description.trim() : "Confection sur mesure";
    }

    private String genererReference() {
        return "CMD-" + LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyMMdd"))
                + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    private double nombre(Object valeur, Double defaut) {
        double repli = defaut != null ? defaut : 0.0;
        if (valeur instanceof Number n) {
            return n.doubleValue();
        }
        if (valeur == null) {
            return repli;
        }
        try {
            return Double.parseDouble(valeur.toString().trim());
        } catch (NumberFormatException e) {
            return repli;
        }
    }

    /** Accepte « 2026-08-20 » comme « 2026-08-20T10:15:00 ». */
    private LocalDateTime parseDate(String brut) {
        if (brut == null || brut.isBlank()) {
            return null;
        }
        String valeur = brut.trim();
        try {
            return LocalDateTime.parse(valeur);
        } catch (DateTimeParseException ignored) {
            // format date seule
        }
        try {
            return LocalDate.parse(valeur).atTime(12, 0);
        } catch (DateTimeParseException ignored) {
            return null;
        }
    }
}
