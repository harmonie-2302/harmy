package com.harmysewing.presentation.dtos;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.harmysewing.domain.models.StatutCommande;

public record UpdateKanbanStatusRequest(
        @JsonAlias({"status", "statut"})
        StatutCommande statut
) {}
