package com.harmysewing.presentation.api;

import com.harmysewing.application.ports.out.UserRepositoryPort;
import com.harmysewing.domain.exceptions.DomainException;
import com.harmysewing.domain.models.User;
import com.harmysewing.infrastructure.security.JwtTokenProvider;
import com.harmysewing.presentation.dtos.AuthResponse;
import com.harmysewing.presentation.dtos.LoginRequest;
import com.harmysewing.presentation.dtos.RegisterRequest;
import com.harmysewing.presentation.dtos.UserResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepositoryPort userRepositoryPort;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthController(
            UserRepositoryPort userRepositoryPort,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider) {
        this.userRepositoryPort = userRepositoryPort;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepositoryPort.existsByEmail(request.email())) {
            throw new DomainException("Cette adresse email est déjà utilisée.");
        }

        User nouveauUser = new User(
                UUID.randomUUID(),
                request.nom(),
                request.prenom(),
                request.email(),
                passwordEncoder.encode(request.motDePasse()),
                request.role(),
                request.telephone(),
                LocalDateTime.now()
        );

        User userEnregistre = userRepositoryPort.save(nouveauUser);
        String token = jwtTokenProvider.generateToken(userEnregistre.getEmail(), userEnregistre.getRole().name(), userEnregistre.getId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(token, UserResponse.fromDomain(userEnregistre)));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userRepositoryPort.findByEmail(request.email())
                .orElseThrow(() -> new DomainException("Identifiants incorrects (email non trouvé)."));

        if (!passwordEncoder.matches(request.motDePasse(), user.getMotDePasse())) {
            throw new DomainException("Identifiants incorrects (mot de passe invalide).");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        return ResponseEntity.ok(new AuthResponse(token, UserResponse.fromDomain(user)));
    }
}
