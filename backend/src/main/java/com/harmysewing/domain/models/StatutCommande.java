package com.harmysewing.domain.models;

public enum StatutCommande {
    TISSU_RECU,
    EN_COUTURE,
    PRET_POUR_ESSAYAGE,
    LIVRE;

    public StatutCommande getNextStatus() {
        switch (this) {
            case TISSU_RECU:
                return EN_COUTURE;
            case EN_COUTURE:
                return PRET_POUR_ESSAYAGE;
            case PRET_POUR_ESSAYAGE:
                return LIVRE;
            case LIVRE:
            default:
                throw new IllegalStateException("La commande est déjà livrée.");
        }
    }
}
