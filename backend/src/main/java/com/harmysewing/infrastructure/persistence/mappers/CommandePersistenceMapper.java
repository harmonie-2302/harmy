package com.harmysewing.infrastructure.persistence.mappers;

import com.harmysewing.domain.models.Commande;
import com.harmysewing.infrastructure.persistence.entities.CommandeJpaEntity;

public class CommandePersistenceMapper {

    public static Commande toDomain(CommandeJpaEntity entity) {
        if (entity == null) {
            return null;
        }
        Commande commande = new Commande(
                entity.getId(),
                entity.getReference(),
                UserPersistenceMapper.toDomain(entity.getClient()),
                AtelierPersistenceMapper.toDomain(entity.getAtelier()),
                CarnetMesurePersistenceMapper.toDomain(entity.getCarnetMesure()),
                entity.getPrixTotal(),
                entity.getAcompteVerse(),
                entity.getDescription(),
                entity.getDateCommande(),
                entity.getDateLivraisonPrevue()
        );
        // Force l'état d'origine depuis la BDD (sans déclencher la validation de statut)
        commande.setStatut(entity.getStatut());
        return commande;
    }

    public static CommandeJpaEntity toJpaEntity(Commande domain) {
        if (domain == null) {
            return null;
        }
        return new CommandeJpaEntity(
                domain.getId(),
                domain.getReference(),
                UserPersistenceMapper.toJpaEntity(domain.getClient()),
                AtelierPersistenceMapper.toJpaEntity(domain.getAtelier()),
                CarnetMesurePersistenceMapper.toJpaEntity(domain.getCarnetMesure()),
                domain.getStatut(),
                domain.getPrixTotal(),
                domain.getAcompteVerse(),
                domain.getSoldeRestant(),
                domain.getDescription(),
                domain.getDateCommande(),
                domain.getDateLivraisonPrevue()
        );
    }
}
