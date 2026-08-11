package com.harmysewing.presentation.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.harmysewing.application.ports.in.EnvoyerMessageInputPort;
import com.harmysewing.application.ports.out.MessageRepositoryPort;
import com.harmysewing.application.ports.out.UserRepositoryPort;
import com.harmysewing.domain.models.Message;
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

@WebMvcTest(MessagerieController.class)
@AutoConfigureMockMvc(addFilters = false)
class MessagerieControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MessageRepositoryPort messageRepositoryPort;

    @MockBean
    private EnvoyerMessageInputPort envoyerMessageInputPort;

    @MockBean
    private UserRepositoryPort userRepositoryPort;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    private String roomId;
    private Message testMessage;

    @BeforeEach
    void setUp() {
        roomId = "room_123";
        testMessage = new Message(
                UUID.randomUUID(),
                roomId,
                null,
                "Bonjour, la commande est-elle prête ?",
                LocalDateTime.now()
        );
    }

    @Test
    @DisplayName("GET /conversations - Lister les conversations de l'utilisateur")
    void shouldGetConversations() throws Exception {
        given(messageRepositoryPort.findByRoomId(any())).willReturn(List.of(testMessage));

        mockMvc.perform(get("/conversations")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").exists())
                .andExpect(jsonPath("$[0].lastMessagePreview").exists());
    }

    @Test
    @DisplayName("GET /conversations/{roomId}/messages - Lister les messages d'un salon")
    void shouldGetRoomMessages() throws Exception {
        given(messageRepositoryPort.findByRoomId(roomId)).willReturn(List.of(testMessage));

        mockMvc.perform(get("/conversations/" + roomId + "/messages")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].content").value("Bonjour, la commande est-elle prête ?"))
                .andExpect(jsonPath("$[0].senderName").value("Anonyme"));
    }

    @Test
    @DisplayName("POST /conversations/{roomId}/messages - Envoyer et persister un message")
    void shouldSendMessage() throws Exception {
        given(envoyerMessageInputPort.executer(any())).willReturn(testMessage);

        Map<String, String> body = new HashMap<>();
        body.put("text", "Bonjour, la commande est-elle prête ?");

        mockMvc.perform(post("/conversations/" + roomId + "/messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Bonjour, la commande est-elle prête ?"));
    }
}
