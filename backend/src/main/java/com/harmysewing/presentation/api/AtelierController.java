package com.harmysewing.presentation.api;

import com.harmysewing.application.ports.out.AtelierRepositoryPort;
import com.harmysewing.domain.exceptions.DomainException;
import com.harmysewing.domain.models.Atelier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/ateliers")
public class AtelierController {

    private final AtelierRepositoryPort atelierRepositoryPort;

    public AtelierController(AtelierRepositoryPort atelierRepositoryPort) {
        this.atelierRepositoryPort = atelierRepositoryPort;
    }

    private Map<String, Object> toAtelierDto(Atelier a) {
        Map<String, Object> map = new HashMap<>();
        String couturiereId = a.getCouturiere() != null ? a.getCouturiere().getId().toString() : UUID.randomUUID().toString();

        map.put("id", a.getId().toString());
        map.put("ownerId", couturiereId);
        map.put("couturiereId", couturiereId);
        map.put("name", a.getNom() != null ? a.getNom() : "Atelier Haute Couture");
        map.put("bio", a.getDescription() != null ? a.getDescription() : "Atelier de confection et création sur mesure.");

        Map<String, String> location = new HashMap<>();
        location.put("city", a.getAdresse() != null ? a.getAdresse() : "Dakar");
        location.put("country", "Sénégal");
        map.put("location", location);

        map.put("pricing", "Sur devis");
        map.put("portfolioCoverURL", "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800");
        map.put("createdAt", a.getDateCreation() != null ? a.getDateCreation().toString() : LocalDateTime.now().toString());
        map.put("rating", 4.9);

        List<Map<String, Object>> reviews = new ArrayList<>();
        Map<String, Object> rev1 = new HashMap<>();
        rev1.put("authorName", "Amina D.");
        rev1.put("rating", 5);
        rev1.put("text", "Travail impeccable et finition haute couture !");
        rev1.put("createdAt", LocalDateTime.now().toString());
        reviews.add(rev1);
        map.put("reviews", reviews);

        return map;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listerAteliers() {
        List<Atelier> ateliers = atelierRepositoryPort.findAll();
        if (ateliers.isEmpty()) {
            Atelier dummy = new Atelier(
                    UUID.randomUUID(),
                    "Atelier Harmy'sewing",
                    "Haute Couture & Créations d'exception",
                    "Dakar, Plateau",
                    "+221 77 000 00 00",
                    null,
                    LocalDateTime.now()
            );
            return ResponseEntity.ok(List.of(toAtelierDto(dummy)));
        }
        return ResponseEntity.ok(ateliers.stream().map(this::toAtelierDto).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenirAtelierParId(@PathVariable UUID id) {
        Atelier atelier = atelierRepositoryPort.findById(id)
                .orElseThrow(() -> new DomainException("Atelier introuvable avec l'identifiant: " + id));
        return ResponseEntity.ok(toAtelierDto(atelier));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> mettreAJourAtelier(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        Atelier existant = atelierRepositoryPort.findById(id).orElse(null);
        String name = body.get("name") != null ? body.get("name").toString() : (existant != null ? existant.getNom() : "Atelier");
        String bio = body.get("bio") != null ? body.get("bio").toString() : (existant != null ? existant.getDescription() : "Description");

        Atelier maj = new Atelier(
                id,
                name,
                bio,
                existant != null ? existant.getAdresse() : "Dakar",
                existant != null ? existant.getTelephone() : "+221 77 000 00 00",
                existant != null ? existant.getCouturiere() : null,
                existant != null ? existant.getDateCreation() : LocalDateTime.now()
        );

        Atelier sauvegarde = atelierRepositoryPort.save(maj);
        return ResponseEntity.ok(toAtelierDto(sauvegarde));
    }

    @PostMapping("/{id}/reviews")
    public ResponseEntity<Map<String, Object>> ajouterAvis(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        Atelier atelier = atelierRepositoryPort.findById(id).orElse(null);
        Map<String, Object> dto = atelier != null ? toAtelierDto(atelier) : new HashMap<>();
        return ResponseEntity.ok(dto);
    }
}
