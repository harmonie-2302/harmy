package com.harmysewing.application.usecases;

import com.harmysewing.application.ports.in.MettreAJourStatutKanbanInputPort;
import com.harmysewing.application.ports.out.CommandeRepositoryPort;
import com.harmysewing.domain.exceptions.DomainException;
import com.harmysewing.domain.models.Commande;
import com.harmysewing.domain.models.StatutCommande;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MettreAJourStatutKanbanUseCaseTest {

    @Mock
    private CommandeRepositoryPort commandeRepository;

    private MettreAJourStatutKanbanUseCase useCase;

    @BeforeEach
    void setUp() {
        useCase = new MettreAJourStatutKanbanUseCase(commandeRepository);
    }

    @Test
    @DisplayName("Devrait lever DomainException si le solde restant est > 0 lors du passage au statut LIVRE")
    void testEchecLivraisonSoldeImpaye() {
        UUID commandeId = UUID.randomUUID();
        Commande commande = new Commande();
        commande.setId(commandeId);
        commande.setPrixTotal(50000.0);
        commande.setAcompteVerse(20000.0); // Solde restant = 30000.0 > 0
        commande.setStatut(StatutCommande.EN_COUTURE);

        when(commandeRepository.findById(commandeId)).thenReturn(Optional.of(commande));

        MettreAJourStatutKanbanInputPort.Command input = new MettreAJourStatutKanbanInputPort.Command(
                commandeId,
                StatutCommande.LIVRE
        );

        DomainException exception = assertThrows(DomainException.class, () -> useCase.executer(input));
        assertTrue(exception.getMessage().contains("Impossible de livrer la commande"));

        verify(commandeRepository, never()).save(any());
    }

    @Test
    @DisplayName("Devrait réussir le passage au statut LIVRE quand le solde restant est égal à 0")
    void testSuccesLivraisonSoldeZero() {
        UUID commandeId = UUID.randomUUID();
        Commande commande = new Commande();
        commande.setId(commandeId);
        commande.setPrixTotal(50000.0);
        commande.setAcompteVerse(50000.0); // Solde restant = 0
        commande.setStatut(StatutCommande.PRET_POUR_ESSAYAGE);

        when(commandeRepository.findById(commandeId)).thenReturn(Optional.of(commande));
        when(commandeRepository.save(any(Commande.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MettreAJourStatutKanbanInputPort.Command input = new MettreAJourStatutKanbanInputPort.Command(
                commandeId,
                StatutCommande.LIVRE
        );

        Commande resultat = useCase.executer(input);

        assertEquals(StatutCommande.LIVRE, resultat.getStatut());
        verify(commandeRepository, times(1)).save(commande);
    }
}
