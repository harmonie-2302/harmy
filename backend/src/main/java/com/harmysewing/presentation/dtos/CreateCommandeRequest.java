package com.harmysewing.presentation.dtos;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.PositiveOrZero;

import java.util.UUID;

/**
 * Création d'une commande.
 *
 * {@code customerRefId} désigne une fiche cliente de l'atelier (table customers)
 * et {@code clientId} un compte utilisateur : les deux identifiants ne partagent
 * pas le même référentiel et ne doivent donc jamais être confondus.
 * {@code dateLivraisonPrevue} est reçue en texte pour accepter aussi bien
 * « 2026-08-20 » que « 2026-08-20T10:00:00 ».
 */
public record CreateCommandeRequest(
        String reference,
        UUID clientId,
        UUID customerRefId,
        UUID atelierId,
        @JsonAlias({"carnetMesureId", "measureBookId"})
        UUID carnetMesureId,
        @JsonAlias({"prixTotal", "total"})
        @PositiveOrZero(message = "Le prix total doit être positif ou nul.")
        Double prixTotal,
        @JsonAlias({"acompteVerse", "deposit"})
        @PositiveOrZero(message = "L'acompte versé doit être positif ou nul.")
        Double acompteVerse,
        @JsonAlias({"description", "modelCaption"})
        String description,
        @JsonAlias({"dateLivraisonPrevue", "dueDate"})
        String dateLivraisonPrevue,
        String modelPostId
) {}
