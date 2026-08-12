package com.harmysewing.presentation.api;

import com.harmysewing.application.ports.in.PartagerCarnetMesureInputPort;
import com.harmysewing.application.ports.out.CarnetMesureRepositoryPort;
import com.harmysewing.application.ports.out.PartageCarnetRepositoryPort;
import com.harmysewing.application.ports.out.UserRepositoryPort;
import com.harmysewing.application.services.AtelierProvisioningService;
import com.harmysewing.domain.exceptions.DomainException;
import com.harmysewing.domain.models.Atelier;
import com.harmysewing.domain.models.CarnetMesure;
import com.harmysewing.domain.models.PartageCarnet;
import com.harmysewing.domain.models.User;
import com.harmysewing.infrastructure.security.CurrentUserProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/measurements")
public class CarnetMesureController {

    private static final List<String> MESURES_ATTENDUES = List.of("bust", "waist", "hips", "arm");

    private final CarnetMesureRepositoryPort carnetMesureRepositoryPort;
    private final PartagerCarnetMesureInputPort partagerCarnetMesureInputPort;
    private final PartageCarnetRepositoryPort partageCarnetRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;
    private final AtelierProvisioningService atelierProvisioningService;
    private final CurrentUserProvider currentUserProvider;

    public CarnetMesureController(
            CarnetMesureRepositoryPort carnetMesureRepositoryPort,
            PartagerCarnetMesureInputPort partagerCarnetMesureInputPort,
            PartageCarnetRepositoryPort partageCarnetRepositoryPort,
            UserRepositoryPort userRepositoryPort,
            AtelierProvisioningService atelierProvisioningService,
            CurrentUserProvider currentUserProvider) {
        this.carnetMesureRepositoryPort = carnetMesureRepositoryPort;
        this.partagerCarnetMesureInputPort = partagerCarnetMesureInputPort;
        this.partageCarnetRepositoryPort = partageCarnetRepositoryPort;
        this.userRepositoryPort = userRepositoryPort;
        this.atelierProvisioningService = atelierProvisioningService;
        this.currentUserProvider = currentUserProvider;
    }

    // ------------------------------------------------------------------
    // Carnet personnel de la cliente
    // ------------------------------------------------------------------

    @GetMapping("/my")
    public ResponseEntity<Map<String, Object>> obtenirMonCarnet() {
        User user = currentUserProvider.exigerUtilisateur();
        return ResponseEntity.ok(toMeasureBookMap(carnetPersonnel(user), user));
    }

    @PutMapping("/my")
    public ResponseEntity<Map<String, Object>> mettreAJourMonCarnet(@RequestBody Map<String, Object> body) {
        User user = currentUserProvider.exigerUtilisateur();

        Map<String, Double> mesures = lireMesures(body.get("measurements"));
        if (mesures.isEmpty()) {
            throw new DomainException("Aucune mesure valide n'a été transmise.");
        }

        CarnetMesure carnet = carnetPersonnel(user);
        carnet.getMesures().putAll(mesures);
        carnet.setNomClient(user.getDisplayName());
        carnet.setDateModification(LocalDateTime.now());

        CarnetMesure sauvegarde = carnetMesureRepositoryPort.save(carnet);
        return ResponseEntity.ok(toMeasureBookMap(sauvegarde, user));
    }

    /**
     * Autorise ou révoque l'accès d'un atelier au carnet de la cliente.
     * L'identifiant reçu peut être celui de l'atelier ou celui de la couturière.
     */
    @PostMapping("/my/shares")
    @Transactional
    public ResponseEntity<Map<String, Object>> partagerMesures(@RequestBody Map<String, Object> body) {
        User user = currentUserProvider.exigerUtilisateur();

        Object brut = body.get("atelierId") != null ? body.get("atelierId") : body.get("couturiereId");
        if (brut == null) {
            throw new DomainException("L'atelier destinataire du partage est obligatoire.");
        }

        UUID couturiereId = resoudreCouturiere(brut.toString());
        boolean accorder = !Boolean.FALSE.equals(body.get("grant"));

        CarnetMesure carnet = carnetPersonnel(user);

        if (accorder) {
            partagerCarnetMesureInputPort.executer(new PartagerCarnetMesureInputPort.Command(
                    carnet.getId(),
                    couturiereId,
                    user.getId()
            ));
        } else {
            partageCarnetRepositoryPort.deleteByCarnetMesureIdAndCouturiereId(carnet.getId(), couturiereId);
        }

        return ResponseEntity.ok(toMeasureBookMap(carnet, user));
    }

    // ------------------------------------------------------------------
    // Carnets partagés avec la couturière connectée
    // ------------------------------------------------------------------

    @GetMapping("/shared")
    public ResponseEntity<List<Map<String, Object>>> carnetsPartagesAvecMoi() {
        User couturiere = currentUserProvider.exigerCouturiere();

        List<UUID> carnetIds = partageCarnetRepositoryPort.findByCouturiereId(couturiere.getId()).stream()
                .map(PartageCarnet::getCarnetMesureId)
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        List<Map<String, Object>> dtos = carnetMesureRepositoryPort.findByIds(carnetIds).stream()
                .sorted(Comparator.comparing(
                        CarnetMesure::getDateModification,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toCarnetPartageDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // ------------------------------------------------------------------
    // Sérialisation
    // ------------------------------------------------------------------

    private Map<String, Object> toMeasureBookMap(CarnetMesure carnet, User proprietaire) {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("id", carnet.getId() != null ? carnet.getId().toString() : null);
        res.put("customerUserId", proprietaire.getId().toString());
        res.put("customerName", carnet.getNomClient());
        res.put("measurements", mesuresCompletes(carnet.getMesures()));

        List<PartageCarnet> partages = carnet.getId() != null
                ? partageCarnetRepositoryPort.findByCarnetMesureId(carnet.getId())
                : List.of();

        // « shares » contient l'identifiant de la couturière ET celui de son
        // atelier : le frontend peut ainsi tester l'un ou l'autre.
        List<String> shares = new ArrayList<>();
        List<Map<String, Object>> detail = new ArrayList<>();

        for (PartageCarnet p : partages) {
            if (p.getCouturiereId() == null) {
                continue;
            }
            shares.add(p.getCouturiereId().toString());

            Atelier atelier = atelierProvisioningService.trouverPourCouturiere(p.getCouturiereId()).orElse(null);
            if (atelier != null) {
                shares.add(atelier.getId().toString());
            }

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("couturiereId", p.getCouturiereId().toString());
            item.put("atelierId", atelier != null ? atelier.getId().toString() : null);
            item.put("atelierName", atelier != null ? atelier.getNom() : null);
            item.put("sharedAt", p.getDatePartage() != null ? p.getDatePartage().toString() : null);
            detail.add(item);
        }

        res.put("shares", shares);
        res.put("shareDetails", detail);
        res.put("updatedAt", carnet.getDateModification() != null
                ? carnet.getDateModification().toString()
                : (carnet.getDateCreation() != null ? carnet.getDateCreation().toString() : null));
        return res;
    }

    private Map<String, Object> toCarnetPartageDto(CarnetMesure carnet) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", carnet.getId().toString());
        dto.put("customerName", carnet.getNomClient());
        dto.put("customerUserId", carnet.getCliente() != null ? carnet.getCliente().getId().toString() : null);
        dto.put("phone", carnet.getCliente() != null ? carnet.getCliente().getTelephone() : null);
        dto.put("photoURL", carnet.getCliente() != null ? carnet.getCliente().getPhotoUrl() : null);
        dto.put("measurements", mesuresCompletes(carnet.getMesures()));
        dto.put("updatedAt", carnet.getDateModification() != null ? carnet.getDateModification().toString() : null);
        return dto;
    }

    // ------------------------------------------------------------------
    // Utilitaires
    // ------------------------------------------------------------------

    /** Carnet personnel, créé vide (et non pré-rempli) au premier accès. */
    private CarnetMesure carnetPersonnel(User user) {
        List<CarnetMesure> carnets = carnetMesureRepositoryPort.findByClienteId(user.getId());
        if (!carnets.isEmpty()) {
            return carnets.get(0);
        }

        Map<String, Double> vides = new LinkedHashMap<>();
        MESURES_ATTENDUES.forEach(cle -> vides.put(cle, 0.0));

        return carnetMesureRepositoryPort.save(new CarnetMesure(
                UUID.randomUUID(),
                user.getDisplayName(),
                user,
                null,
                false,
                vides,
                LocalDateTime.now(),
                LocalDateTime.now()
        ));
    }

    /** Accepte un identifiant d'atelier ou de couturière. */
    private UUID resoudreCouturiere(String brut) {
        UUID id;
        try {
            id = UUID.fromString(brut.trim());
        } catch (IllegalArgumentException e) {
            throw new DomainException("Identifiant d'atelier invalide.");
        }

        Optional<User> couturiere = userRepositoryPort.findById(id).filter(User::isCouturiere);
        if (couturiere.isPresent()) {
            return couturiere.get().getId();
        }

        return atelierProvisioningService.trouverPourCouturiere(id)
                .map(a -> a.getCouturiere() != null ? a.getCouturiere().getId() : null)
                .filter(Objects::nonNull)
                .orElseGet(() -> atelierParId(id));
    }

    private UUID atelierParId(UUID atelierId) {
        // Dernier recours : l'identifiant reçu est celui d'un atelier.
        return userRepositoryPort.findAll().stream()
                .filter(User::isCouturiere)
                .filter(u -> atelierProvisioningService.trouverPourCouturiere(u.getId())
                        .map(a -> atelierId.equals(a.getId()))
                        .orElse(false))
                .map(User::getId)
                .findFirst()
                .orElseThrow(() -> new DomainException("Atelier introuvable pour le partage du carnet."));
    }

    private Map<String, Double> lireMesures(Object brut) {
        Map<String, Double> mesures = new LinkedHashMap<>();
        if (!(brut instanceof Map<?, ?> map)) {
            return mesures;
        }

        map.forEach((cle, valeur) -> {
            if (cle == null || valeur == null) {
                return;
            }
            Double nombre = null;
            if (valeur instanceof Number n) {
                nombre = n.doubleValue();
            } else {
                try {
                    nombre = Double.parseDouble(valeur.toString().trim());
                } catch (NumberFormatException ignored) {
                    return;
                }
            }
            if (nombre < 0) {
                throw new DomainException("Une mesure ne peut pas être négative.");
            }
            mesures.put(cle.toString(), nombre);
        });

        return mesures;
    }

    private Map<String, Double> mesuresCompletes(Map<String, Double> mesures) {
        Map<String, Double> completes = new LinkedHashMap<>();
        MESURES_ATTENDUES.forEach(cle -> completes.put(cle, 0.0));
        if (mesures != null) {
            mesures.forEach((cle, valeur) -> completes.put(cle, valeur != null ? valeur : 0.0));
        }
        return completes;
    }
}
