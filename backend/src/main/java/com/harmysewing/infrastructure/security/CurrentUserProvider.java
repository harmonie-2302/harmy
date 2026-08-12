package com.harmysewing.infrastructure.security;

import com.harmysewing.application.ports.out.UserRepositoryPort;
import com.harmysewing.domain.exceptions.DomainException;
import com.harmysewing.domain.models.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Résout l'utilisateur courant à partir du contexte de sécurité alimenté par
 * {@link JwtAuthenticationFilter}. Évite de dupliquer le décodage du jeton dans
 * chaque contrôleur.
 */
@Component
public class CurrentUserProvider {

    private final UserRepositoryPort userRepositoryPort;

    public CurrentUserProvider(UserRepositoryPort userRepositoryPort) {
        this.userRepositoryPort = userRepositoryPort;
    }

    public Optional<User> utilisateurCourant() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }
        Object principal = authentication.getPrincipal();
        if (principal == null || "anonymousUser".equals(principal)) {
            return Optional.empty();
        }
        return userRepositoryPort.findByEmail(principal.toString());
    }

    public User exigerUtilisateur() {
        return utilisateurCourant()
                .orElseThrow(() -> new DomainException("Authentification requise pour cette action."));
    }

    public User exigerCouturiere() {
        User user = exigerUtilisateur();
        if (!user.isCouturiere() && !user.isAdmin()) {
            throw new DomainException("Cette action est réservée aux couturières.");
        }
        return user;
    }

    public User exigerAdmin() {
        User user = exigerUtilisateur();
        if (!user.isAdmin()) {
            throw new DomainException("Cette action est réservée aux administrateurs.");
        }
        return user;
    }
}
