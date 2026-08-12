package com.harmysewing.presentation.api;

import com.harmysewing.application.ports.out.AtelierRepositoryPort;
import com.harmysewing.application.services.AtelierProvisioningService;
import com.harmysewing.domain.exceptions.DomainException;
import com.harmysewing.domain.models.Atelier;
import com.harmysewing.domain.models.User;
import com.harmysewing.infrastructure.persistence.entities.ReviewJpaEntity;
import com.harmysewing.infrastructure.persistence.repositories.ReviewSpringDataRepository;
import com.harmysewing.infrastructure.security.CurrentUserProvider;
import com.harmysewing.presentation.dtos.AtelierDtoMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/ateliers")
public class AtelierController {

    private final AtelierRepositoryPort atelierRepositoryPort;
    private final ReviewSpringDataRepository reviewRepository;
    private final CurrentUserProvider currentUserProvider;
    private final AtelierProvisioningService atelierProvisioningService;

    public AtelierController(
            AtelierRepositoryPort atelierRepositoryPort,
            ReviewSpringDataRepository reviewRepository,
            CurrentUserProvider currentUserProvider,
            AtelierProvisioningService atelierProvisioningService) {
        this.atelierRepositoryPort = atelierRepositoryPort;
        this.reviewRepository = reviewRepository;
        this.currentUserProvider = currentUserProvider;
        this.atelierProvisioningService = atelierProvisioningService;
    }

    private Map<String, Object> toDto(Atelier a) {
        return AtelierDtoMapper.toDto(a, avisTries(a.getId()));
    }

    private List<ReviewJpaEntity> avisTries(UUID atelierId) {
        if (atelierId == null) {
            return List.of();
        }
        return reviewRepository.findByAtelierId(atelierId).stream()
                .sorted(Comparator.comparing(
                        ReviewJpaEntity::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    /** Annuaire public des ateliers réellement enregistrés. */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listerAteliers() {
        List<Map<String, Object>> dtos = atelierRepositoryPort.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    /** Atelier de la couturière connectée, créé à la volée s'il manque. */
    @GetMapping("/mine")
    public ResponseEntity<Map<String, Object>> monAtelier() {
        User couturiere = currentUserProvider.exigerCouturiere();
        Atelier atelier = atelierProvisioningService.assurerAtelier(couturiere);
        return ResponseEntity.ok(toDto(atelier));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenirAtelierParId(@PathVariable UUID id) {
        Atelier atelier = atelierRepositoryPort.findById(id)
                .orElseThrow(() -> new DomainException("Atelier introuvable avec l'identifiant: " + id));
        return ResponseEntity.ok(toDto(atelier));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<List<Map<String, Object>>> listerAvis(@PathVariable UUID id) {
        List<Map<String, Object>> avis = avisTries(id).stream()
                .map(AtelierDtoMapper::toReviewDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(avis);
    }

    /** Mise à jour du profil : réservée à la propriétaire de l'atelier (ou admin). */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> mettreAJourAtelier(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {

        User user = currentUserProvider.exigerUtilisateur();
        Atelier atelier = atelierRepositoryPort.findById(id)
                .orElseThrow(() -> new DomainException("Atelier introuvable avec l'identifiant: " + id));

        boolean proprietaire = atelier.getCouturiere() != null
                && atelier.getCouturiere().getId().equals(user.getId());
        if (!proprietaire && !user.isAdmin()) {
            throw new DomainException("Vous ne pouvez modifier que votre propre atelier.");
        }

        appliquerTexte(body, "name", atelier::setNom);
        appliquerTexte(body, "bio", atelier::setDescription);
        appliquerTexte(body, "phone", atelier::setTelephone);
        appliquerTexte(body, "address", atelier::setAdresse);
        appliquerTexte(body, "pricing", atelier::setPricing);
        appliquerTexte(body, "portfolioCoverURL", atelier::setPortfolioCoverUrl);
        appliquerTexte(body, "city", atelier::setVille);
        appliquerTexte(body, "country", atelier::setPays);

        // Le frontend envoie aussi location: { city, country }
        Object location = body.get("location");
        if (location instanceof Map<?, ?> loc) {
            if (loc.get("city") != null) {
                atelier.setVille(loc.get("city").toString());
            }
            if (loc.get("country") != null) {
                atelier.setPays(loc.get("country").toString());
            }
        }

        Atelier sauvegarde = atelierRepositoryPort.save(atelier);
        return ResponseEntity.ok(toDto(sauvegarde));
    }

    /** Dépôt d'un avis authentifié et persisté (un avis par personne et par atelier). */
    @PostMapping("/{id}/reviews")
    public ResponseEntity<Map<String, Object>> ajouterAvis(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {

        User auteur = currentUserProvider.exigerUtilisateur();
        Atelier atelier = atelierRepositoryPort.findById(id)
                .orElseThrow(() -> new DomainException("Atelier introuvable avec l'identifiant: " + id));

        if (atelier.getCouturiere() != null && atelier.getCouturiere().getId().equals(auteur.getId())) {
            throw new DomainException("Vous ne pouvez pas évaluer votre propre atelier.");
        }

        int note = lireNote(body.get("rating"));
        String texte = body.get("text") != null ? body.get("text").toString().trim() : "";
        if (texte.isBlank()) {
            throw new DomainException("Merci de rédiger votre avis avant de l'envoyer.");
        }

        ReviewJpaEntity existant = reviewRepository.findByAtelierId(id).stream()
                .filter(r -> auteur.getId().equals(r.getAuthorId()))
                .findFirst()
                .orElse(null);

        if (existant != null) {
            existant.setRating(note);
            existant.setText(texte);
            existant.setAuthorName(auteur.getDisplayName());
            existant.setCreatedAt(LocalDateTime.now());
            reviewRepository.save(existant);
        } else {
            reviewRepository.save(new ReviewJpaEntity(
                    UUID.randomUUID(),
                    id,
                    auteur.getDisplayName(),
                    note,
                    texte,
                    LocalDateTime.now(),
                    auteur.getId()
            ));
        }

        return ResponseEntity.ok(toDto(atelier));
    }

    private void appliquerTexte(Map<String, Object> body, String cle, java.util.function.Consumer<String> setter) {
        Object valeur = body.get(cle);
        if (valeur != null) {
            setter.accept(valeur.toString());
        }
    }

    private int lireNote(Object brut) {
        int note = 5;
        if (brut instanceof Number n) {
            note = n.intValue();
        } else if (brut != null) {
            try {
                note = Integer.parseInt(brut.toString().trim());
            } catch (NumberFormatException ignored) {
                note = 5;
            }
        }
        return Math.max(1, Math.min(5, note));
    }
}
