package com.harmysewing.presentation.api;

import com.harmysewing.application.ports.in.PartagerCarnetMesureInputPort;
import com.harmysewing.application.ports.out.CarnetMesureRepositoryPort;
import com.harmysewing.application.ports.out.PartageCarnetRepositoryPort;
import com.harmysewing.application.ports.out.UserRepositoryPort;
import com.harmysewing.domain.exceptions.DomainException;
import com.harmysewing.domain.models.CarnetMesure;
import com.harmysewing.domain.models.PartageCarnet;
import com.harmysewing.domain.models.User;
import com.harmysewing.infrastructure.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/measurements")
public class CarnetMesureController {

    private final CarnetMesureRepositoryPort carnetMesureRepositoryPort;
    private final PartagerCarnetMesureInputPort partagerCarnetMesureInputPort;
    private final PartageCarnetRepositoryPort partageCarnetRepositoryPort;
    private final UserRepositoryPort userRepositoryPort;
    private final JwtTokenProvider jwtTokenProvider;

    public CarnetMesureController(
            CarnetMesureRepositoryPort carnetMesureRepositoryPort,
            PartagerCarnetMesureInputPort partagerCarnetMesureInputPort,
            PartageCarnetRepositoryPort partageCarnetRepositoryPort,
            UserRepositoryPort userRepositoryPort,
            JwtTokenProvider jwtTokenProvider) {
        this.carnetMesureRepositoryPort = carnetMesureRepositoryPort;
        this.partagerCarnetMesureInputPort = partagerCarnetMesureInputPort;
        this.partageCarnetRepositoryPort = partageCarnetRepositoryPort;
        this.userRepositoryPort = userRepositoryPort;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    private UUID getUserIdFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtTokenProvider.getUserIdFromToken(token);
        }
        throw new DomainException("Non authentifié.");
    }

    private Map<String, Object> toMeasureBookMap(CarnetMesure carnet, UUID userId) {
        Map<String, Object> res = new HashMap<>();
        res.put("customerUserId", userId.toString());
        res.put("measurements", carnet.getMesures());

        List<String> shares = partageCarnetRepositoryPort.findByCarnetMesureId(carnet.getId())
                .stream()
                .map(p -> p.getCouturiereId() != null ? p.getCouturiereId().toString() : "")
                .filter(s -> !s.isBlank())
                .collect(Collectors.toList());

        res.put("shares", shares);
        res.put("updatedAt", carnet.getDateModification() != null ? carnet.getDateModification().toString() : LocalDateTime.now().toString());
        return res;
    }

    @GetMapping("/my")
    public ResponseEntity<Map<String, Object>> obtenirMonCarnet(HttpServletRequest request) {
        UUID userId = getUserIdFromRequest(request);
        List<CarnetMesure> carnets = carnetMesureRepositoryPort.findByClienteId(userId);
        CarnetMesure carnet;

        if (!carnets.isEmpty()) {
            carnet = carnets.get(0);
        } else {
            User cliente = userRepositoryPort.findById(userId).orElse(null);
            Map<String, Double> mesuresDefaut = new HashMap<>();
            mesuresDefaut.put("bust", 90.0);
            mesuresDefaut.put("waist", 70.0);
            mesuresDefaut.put("hips", 95.0);
            mesuresDefaut.put("arm", 60.0);

            carnet = new CarnetMesure(
                    UUID.randomUUID(),
                    cliente != null ? cliente.getNom() + " " + cliente.getPrenom() : "Cliente",
                    cliente,
                    null,
                    false,
                    mesuresDefaut,
                    LocalDateTime.now(),
                    LocalDateTime.now()
            );
            carnet = carnetMesureRepositoryPort.save(carnet);
        }

        return ResponseEntity.ok(toMeasureBookMap(carnet, userId));
    }

    @PutMapping("/my")
    public ResponseEntity<Map<String, Object>> mettreAJourMonCarnet(
            HttpServletRequest request,
            @RequestBody Map<String, Object> body) {
        UUID userId = getUserIdFromRequest(request);
        List<CarnetMesure> carnets = carnetMesureRepositoryPort.findByClienteId(userId);
        User cliente = userRepositoryPort.findById(userId).orElse(null);

        Map<String, Number> inputMap = (Map<String, Number>) body.get("measurements");
        Map<String, Double> meMap = new HashMap<>();
        if (inputMap != null) {
            inputMap.forEach((k, v) -> meMap.put(k, v != null ? v.doubleValue() : 0.0));
        }

        CarnetMesure carnet;
        if (!carnets.isEmpty()) {
            CarnetMesure existant = carnets.get(0);
            existant.getMesures().clear();
            existant.getMesures().putAll(meMap);
            existant.setDateModification(LocalDateTime.now());
            carnet = carnetMesureRepositoryPort.save(existant);
        } else {
            CarnetMesure nouveau = new CarnetMesure(
                    UUID.randomUUID(),
                    cliente != null ? cliente.getNom() + " " + cliente.getPrenom() : "Cliente",
                    cliente,
                    null,
                    false,
                    meMap,
                    LocalDateTime.now(),
                    LocalDateTime.now()
            );
            carnet = carnetMesureRepositoryPort.save(nouveau);
        }

        return ResponseEntity.ok(toMeasureBookMap(carnet, userId));
    }

    @PostMapping("/my/shares")
    @Transactional
    public ResponseEntity<Map<String, Object>> partagerMesures(
            HttpServletRequest request,
            @RequestBody Map<String, Object> body) {
        UUID userId = getUserIdFromRequest(request);
        String atelierIdStr = (String) body.get("atelierId");
        Boolean grant = (Boolean) body.get("grant");

        List<CarnetMesure> carnets = carnetMesureRepositoryPort.findByClienteId(userId);
        CarnetMesure carnet;
        if (carnets.isEmpty()) {
            User cliente = userRepositoryPort.findById(userId).orElse(null);
            Map<String, Double> meMap = new HashMap<>();
            meMap.put("bust", 90.0);
            meMap.put("waist", 70.0);
            meMap.put("hips", 95.0);
            meMap.put("arm", 60.0);
            carnet = carnetMesureRepositoryPort.save(new CarnetMesure(
                    UUID.randomUUID(),
                    cliente != null ? cliente.getNom() + " " + cliente.getPrenom() : "Cliente",
                    cliente,
                    null,
                    false,
                    meMap,
                    LocalDateTime.now(),
                    LocalDateTime.now()
            ));
        } else {
            carnet = carnets.get(0);
        }

        if (atelierIdStr != null) {
            UUID targetCouturiereOrAtelierId = UUID.fromString(atelierIdStr);
            if (Boolean.TRUE.equals(grant)) {
                PartagerCarnetMesureInputPort.Command command = new PartagerCarnetMesureInputPort.Command(
                        carnet.getId(),
                        targetCouturiereOrAtelierId,
                        userId
                );
                partagerCarnetMesureInputPort.executer(command);
            } else if (Boolean.FALSE.equals(grant)) {
                partageCarnetRepositoryPort.deleteByCarnetMesureIdAndCouturiereId(carnet.getId(), targetCouturiereOrAtelierId);
            }
        }

        return ResponseEntity.ok(toMeasureBookMap(carnet, userId));
    }
}
