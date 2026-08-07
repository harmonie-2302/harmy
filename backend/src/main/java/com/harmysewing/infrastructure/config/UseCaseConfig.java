package com.harmysewing.infrastructure.config;

import com.harmysewing.application.ports.out.AtelierRepositoryPort;
import com.harmysewing.application.ports.out.CarnetMesureRepositoryPort;
import com.harmysewing.application.ports.out.CommandeRepositoryPort;
import com.harmysewing.application.ports.out.PartageCarnetRepositoryPort;
import com.harmysewing.application.ports.out.UserRepositoryPort;
import com.harmysewing.application.usecases.CreerCommandeUseCase;
import com.harmysewing.application.usecases.MettreAJourStatutKanbanUseCase;
import com.harmysewing.application.usecases.PartagerCarnetMesureUseCase;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UseCaseConfig {

    @Bean
    public CreerCommandeUseCase creerCommandeUseCase(
            CommandeRepositoryPort commandeRepositoryPort,
            CarnetMesureRepositoryPort carnetMesureRepositoryPort,
            AtelierRepositoryPort atelierRepositoryPort,
            UserRepositoryPort userRepositoryPort) {
        return new CreerCommandeUseCase(
                commandeRepositoryPort,
                carnetMesureRepositoryPort,
                atelierRepositoryPort,
                userRepositoryPort
        );
    }

    @Bean
    public MettreAJourStatutKanbanUseCase mettreAJourStatutKanbanUseCase(
            CommandeRepositoryPort commandeRepositoryPort) {
        return new MettreAJourStatutKanbanUseCase(commandeRepositoryPort);
    }

    @Bean
    public PartagerCarnetMesureUseCase partagerCarnetMesureUseCase(
            CarnetMesureRepositoryPort carnetMesureRepositoryPort,
            PartageCarnetRepositoryPort partageCarnetRepositoryPort,
            UserRepositoryPort userRepositoryPort) {
        return new PartagerCarnetMesureUseCase(
                carnetMesureRepositoryPort,
                partageCarnetRepositoryPort,
                userRepositoryPort
        );
    }

    @Bean
    public com.harmysewing.application.usecases.EnvoyerMessageUseCase envoyerMessageUseCase(
            com.harmysewing.application.ports.out.MessageRepositoryPort messageRepositoryPort,
            UserRepositoryPort userRepositoryPort) {
        return new com.harmysewing.application.usecases.EnvoyerMessageUseCase(
                messageRepositoryPort,
                userRepositoryPort
        );
    }

    @Bean
    public com.harmysewing.application.usecases.UploadImageUseCase uploadImageUseCase(
            com.harmysewing.application.ports.out.FileStoragePort fileStoragePort) {
        return new com.harmysewing.application.usecases.UploadImageUseCase(fileStoragePort);
    }
}
