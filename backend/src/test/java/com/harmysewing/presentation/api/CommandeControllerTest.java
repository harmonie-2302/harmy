package com.harmysewing.presentation.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.harmysewing.application.ports.in.CreerCommandeInputPort;
import com.harmysewing.application.ports.in.MettreAJourStatutKanbanInputPort;
import com.harmysewing.application.ports.out.CarnetMesureRepositoryPort;
import com.harmysewing.application.ports.out.CommandeRepositoryPort;
import com.harmysewing.domain.models.Commande;
import com.harmysewing.domain.models.StatutCommande;
import com.harmysewing.infrastructure.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CommandeController.class)
@AutoConfigureMockMvc(addFilters = false)
class CommandeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CreerCommandeInputPort creerCommandeInputPort;

    @MockBean
    private MettreAJourStatutKanbanInputPort mettreAJourStatutKanbanInputPort;

    @MockBean
    private CommandeRepositoryPort commandeRepositoryPort;

    @MockBean
    private CarnetMesureRepositoryPort carnetMesureRepositoryPort;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    private Commande testCommande;

    @BeforeEach
    void setUp() {
        UUID id = UUID.randomUUID();
        testCommande = new Commande(
                id,
                "CMD-100",
                null,
                null,
                null,
                StatutCommande.TISSU_RECU,
                100000.0,
                30000.0,
                70000.0,
                "Robe wax sur mesure",
                LocalDateTime.now(),
                LocalDateTime.now().plusDays(7)
        );
    }

    @Test
    @DisplayName("GET /orders - Renvoyer la liste de toutes les commandes avec solde calculé")
    void shouldReturnAllOrders() throws Exception {
        given(commandeRepositoryPort.findAll()).willReturn(List.of(testCommande));

        mockMvc.perform(get("/orders")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].reference").value("CMD-100"))
                .andExpect(jsonPath("$[0].prixTotal").value(100000.0))
                .andExpect(jsonPath("$[0].soldeRestant").value(70000.0));
    }

    @Test
    @DisplayName("PUT /orders/{id}/status - Mettre à jour le statut Kanban d'une commande")
    void shouldUpdateOrderStatus() throws Exception {
        given(mettreAJourStatutKanbanInputPort.executer(any()))
                .willReturn(testCommande);

        Map<String, String> body = new HashMap<>();
        body.put("statut", "EN_COUTURE");

        mockMvc.perform(put("/orders/" + testCommande.getId() + "/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.statut").value("TISSU_RECU"));
    }

    @Test
    @DisplayName("PUT /orders/{id}/payment - Recalculer le solde restant lors de l'ajout d'un paiement")
    void shouldAddPaymentAndRecalculateBalance() throws Exception {
        given(commandeRepositoryPort.findById(testCommande.getId()))
                .willReturn(Optional.of(testCommande));
        given(commandeRepositoryPort.save(any()))
                .willAnswer(invocation -> invocation.getArgument(0));

        Map<String, Object> body = new HashMap<>();
        body.put("amount", 20000.0);

        mockMvc.perform(put("/orders/" + testCommande.getId() + "/payment")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.acompteVerse").value(50000.0))
                .andExpect(jsonPath("$.soldeRestant").value(50000.0));
    }
}
