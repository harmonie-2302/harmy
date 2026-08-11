package com.harmysewing.presentation.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.harmysewing.application.ports.in.PartagerCarnetMesureInputPort;
import com.harmysewing.application.ports.out.CarnetMesureRepositoryPort;
import com.harmysewing.application.ports.out.PartageCarnetRepositoryPort;
import com.harmysewing.application.ports.out.UserRepositoryPort;
import com.harmysewing.domain.models.CarnetMesure;
import com.harmysewing.domain.models.User;
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
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CarnetMesureController.class)
@AutoConfigureMockMvc(addFilters = false)
class CarnetMesureControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CarnetMesureRepositoryPort carnetMesureRepositoryPort;

    @MockBean
    private PartagerCarnetMesureInputPort partagerCarnetMesureInputPort;

    @MockBean
    private PartageCarnetRepositoryPort partageCarnetRepositoryPort;

    @MockBean
    private UserRepositoryPort userRepositoryPort;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    private UUID userId;
    private CarnetMesure carnet;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        given(jwtTokenProvider.getUserIdFromToken(any())).willReturn(userId);

        Map<String, Double> m = new HashMap<>();
        m.put("bust", 92.0);
        m.put("waist", 72.0);
        m.put("hips", 98.0);
        m.put("arm", 62.0);

        carnet = new CarnetMesure(
                UUID.randomUUID(),
                "Fatou cliente",
                null,
                null,
                false,
                m,
                LocalDateTime.now(),
                LocalDateTime.now()
        );
    }

    @Test
    @DisplayName("GET /measurements/my - Retourner le carnet au format MeasureBook")
    void shouldGetMyMeasurementBook() throws Exception {
        given(carnetMesureRepositoryPort.findByClienteId(userId)).willReturn(List.of(carnet));

        mockMvc.perform(get("/measurements/my")
                        .header("Authorization", "Bearer mock-jwt-token")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerUserId").value(userId.toString()))
                .andExpect(jsonPath("$.measurements.bust").value(92.0));
    }

    @Test
    @DisplayName("POST /measurements/my/shares avec grant=false - Révoquer un partage de carnet")
    void shouldRevokeShareWhenGrantIsFalse() throws Exception {
        given(carnetMesureRepositoryPort.findByClienteId(userId)).willReturn(List.of(carnet));

        UUID atelierId = UUID.randomUUID();
        Map<String, Object> body = new HashMap<>();
        body.put("atelierId", atelierId.toString());
        body.put("grant", false);

        mockMvc.perform(post("/measurements/my/shares")
                        .header("Authorization", "Bearer mock-jwt-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk());

        verify(partageCarnetRepositoryPort).deleteByCarnetMesureIdAndCouturiereId(carnet.getId(), atelierId);
    }
}
