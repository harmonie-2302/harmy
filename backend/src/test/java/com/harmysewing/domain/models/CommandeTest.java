package com.harmysewing.domain.models;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CommandeTest {

    @Test
    @DisplayName("Devrait calculer le solde restant correctement")
    void testCalculerSolde() {
        Commande commande = new Commande();
        commande.setPrixTotal(50000.0);
        commande.setAcompteVerse(20000.0);

        commande.calculerSolde();

        assertEquals(30000.0, commande.getSoldeRestant());
    }

    @Test
    @DisplayName("Devrait retourner true pour peutEtreLivre quand le solde est 0")
    void testPeutEtreLivreNominal() {
        Commande commande = new Commande();
        commande.setPrixTotal(30000.0);
        commande.setAcompteVerse(30000.0);

        assertTrue(commande.peutEtreLivre());
    }

    @Test
    @DisplayName("Devrait retourner false pour peutEtreLivre quand il reste un solde impayé")
    void testPeutEtreLivreEchecSoldeIncomplet() {
        Commande commande = new Commande();
        commande.setPrixTotal(40000.0);
        commande.setAcompteVerse(15000.0);

        assertFalse(commande.peutEtreLivre());
    }
}
