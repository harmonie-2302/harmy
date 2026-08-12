package com.harmysewing.presentation.api;

import com.harmysewing.application.ports.out.UserRepositoryPort;
import com.harmysewing.application.services.AtelierProvisioningService;
import com.harmysewing.domain.exceptions.DomainException;
import com.harmysewing.domain.models.Atelier;
import com.harmysewing.domain.models.User;
import com.harmysewing.infrastructure.security.CurrentUserProvider;
import com.harmysewing.presentation.dtos.UserResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepositoryPort userRepositoryPort;
    private final CurrentUserProvider currentUserProvider;
    private final AtelierProvisioningService atelierProvisioningService;

    public UserController(
            UserRepositoryPort userRepositoryPort,
            CurrentUserProvider currentUserProvider,
            AtelierProvisioningService atelierProvisioningService) {
        this.userRepositoryPort = userRepositoryPort;
        this.currentUserProvider = currentUserProvider;
        this.atelierProvisioningService = atelierProvisioningService;
    }

    /** Profil complet de l'utilisateur connecté. */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> monProfil() {
        User user = currentUserProvider.exigerUtilisateur();
        return ResponseEntity.ok(UserResponse.fromDomain(user, atelierIdDe(user)));
    }

    /** Mise à jour du profil : identité, contacts et photo. */
    @PutMapping("/me")
    public ResponseEntity<UserResponse> mettreAJourMonProfil(@RequestBody Map<String, Object> body) {
        User user = currentUserProvider.exigerUtilisateur();

        if (body.get("nom") != null) {
            user.setNom(texte(body.get("nom")));
        }
        if (body.get("prenom") != null) {
            user.setPrenom(texte(body.get("prenom")));
        }
        if (body.get("telephone") != null || body.get("phone") != null) {
            Object brut = body.get("telephone") != null ? body.get("telephone") : body.get("phone");
            user.setTelephone(texte(brut));
        }
        if (body.get("whatsapp") != null) {
            user.setWhatsapp(texte(body.get("whatsapp")));
        }
        if (body.get("photoURL") != null || body.get("photoUrl") != null) {
            Object brut = body.get("photoURL") != null ? body.get("photoURL") : body.get("photoUrl");
            user.setPhotoUrl(texte(brut));
        }

        if (texte(user.getNom()).isBlank() && texte(user.getPrenom()).isBlank()) {
            throw new DomainException("Renseignez au moins votre nom ou votre prénom.");
        }

        User sauvegarde = userRepositoryPort.save(user);
        return ResponseEntity.ok(UserResponse.fromDomain(sauvegarde, atelierIdDe(sauvegarde)));
    }

    /** Annuaire réservé à l'administration. */
    @GetMapping
    public ResponseEntity<List<UserResponse>> listerTousLesUtilisateurs() {
        currentUserProvider.exigerAdmin();
        List<UserResponse> users = userRepositoryPort.findAll()
                .stream()
                .map(u -> UserResponse.fromDomain(u, atelierIdDe(u)))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> obtenirUtilisateurParId(@PathVariable UUID id) {
        currentUserProvider.exigerUtilisateur();
        User user = userRepositoryPort.findById(id)
                .orElseThrow(() -> new DomainException("Utilisateur introuvable avec l'identifiant: " + id));
        return ResponseEntity.ok(UserResponse.fromDomain(user, atelierIdDe(user)));
    }

    @GetMapping("/by-email")
    public ResponseEntity<UserResponse> obtenirUtilisateurParEmail(@RequestParam String email) {
        currentUserProvider.exigerAdmin();
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new DomainException("Utilisateur introuvable avec l'email: " + email));
        return ResponseEntity.ok(UserResponse.fromDomain(user, atelierIdDe(user)));
    }

    private UUID atelierIdDe(User user) {
        if (!user.isCouturiere()) {
            return null;
        }
        return atelierProvisioningService.trouverPourCouturiere(user.getId())
                .map(Atelier::getId)
                .orElse(null);
    }

    private String texte(Object valeur) {
        return valeur != null ? valeur.toString().trim() : "";
    }
}
