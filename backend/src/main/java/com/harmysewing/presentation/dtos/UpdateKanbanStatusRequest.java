package com.harmysewing.presentation.dtos;

import com.harmysewing.domain.models.StatutCommande;
import jakarta.validation.constraints.NotNull;

public record UpdateKanbanStatusRequest(
        @NotNull(message = "Le statut Kanban est obligatoire.")
        StatutCommande statut
) {}
