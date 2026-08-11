package com.harmysewing.presentation.api;

import com.harmysewing.application.ports.out.UserRepositoryPort;
import com.harmysewing.domain.exceptions.DomainException;
import com.harmysewing.domain.models.User;
import com.harmysewing.presentation.dtos.UserResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepositoryPort userRepositoryPort;

    public UserController(UserRepositoryPort userRepositoryPort) {
        this.userRepositoryPort = userRepositoryPort;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> listerTousLesUtilisateurs() {
        List<UserResponse> users = userRepositoryPort.findAll()
                .stream()
                .map(UserResponse::fromDomain)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> obtenirUtilisateurParId(@PathVariable UUID id) {
        User user = userRepositoryPort.findById(id)
                .orElseThrow(() -> new DomainException("Utilisateur introuvable avec l'identifiant: " + id));
        return ResponseEntity.ok(UserResponse.fromDomain(user));
    }

    @GetMapping("/by-email")
    public ResponseEntity<UserResponse> obtenirUtilisateurParEmail(@RequestParam String email) {
        User user = userRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new DomainException("Utilisateur introuvable avec l'email: " + email));
        return ResponseEntity.ok(UserResponse.fromDomain(user));
    }
}
