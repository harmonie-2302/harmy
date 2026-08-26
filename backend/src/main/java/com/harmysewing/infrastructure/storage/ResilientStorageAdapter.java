package com.harmysewing.infrastructure.storage;

import com.harmysewing.application.ports.out.FileStoragePort;
import com.harmysewing.domain.exceptions.DomainException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Orchestrateur de stockage à redondance : le disque local du VPS et
 * Cloudflare R2 se suppléent mutuellement.
 *
 * <h3>Écriture — miroir</h3>
 * <p>Chaque image est écrite sur <em>tous</em> les backends disponibles. Le
 * téléversement est considéré réussi dès qu'un seul y parvient ; les échecs des
 * autres sont journalisés sans interrompre la publication. Une panne de R2
 * <strong>ou</strong> une saturation du disque n'empêche donc jamais une
 * couturière de publier.</p>
 *
 * <h3>Lecture — bascule</h3>
 * <p>{@link #downloadFile(String)} interroge les backends dans l'ordre jusqu'à
 * en trouver un qui possède l'image. Une image écrite sur R2 alors que le
 * disque était en panne reste donc accessible, et inversement.</p>
 *
 * <h3>URL stockée en base</h3>
 * <p>L'URL renvoyée est toujours celle du disque local ({@code /uploads/<clé>}),
 * quel que soit le backend qui a réellement accepté l'écriture. Cette
 * indirection est volontaire : elle est relative (donc indépendante du domaine)
 * et <em>stable</em>, ce qui permet à nginx de servir le fichier depuis le
 * disque quand il est présent, et de se rabattre sur l'API — donc sur R2 —
 * lorsqu'il est absent. Aucune URL enregistrée ne dépend d'un backend
 * particulier, il n'y a donc rien à migrer en base si l'un disparaît.</p>
 */
@Component
@Primary
public class ResilientStorageAdapter implements FileStoragePort {

    private static final Logger log = LoggerFactory.getLogger(ResilientStorageAdapter.class);

    private final FileStoragePort disqueLocal;
    private final FileStoragePort cloudflareR2;

    /** Ordre de préférence en lecture : « local » (disque d'abord) ou « r2 ». */
    @Value("${harmy.storage.prefer:local}")
    private String preference;

    public ResilientStorageAdapter(
            @Qualifier("localDiskStorage") FileStoragePort disqueLocal,
            @Qualifier("cloudflareR2Storage") FileStoragePort cloudflareR2) {
        this.disqueLocal = disqueLocal;
        this.cloudflareR2 = cloudflareR2;
    }

    @PostConstruct
    public void journaliserEtat() {
        log.info("Stockage des images — disque local : {} | Cloudflare R2 : {} | préférence lecture : {}",
                disqueLocal.estDisponible() ? "disponible" : "INDISPONIBLE",
                cloudflareR2.estDisponible() ? "disponible" : "INDISPONIBLE",
                preference);

        if (backendsDisponibles().isEmpty()) {
            log.error("AUCUN backend de stockage disponible : les téléversements d'images échoueront.");
        }
    }

    /** Backends dans l'ordre de préférence, filtrés sur leur disponibilité. */
    private List<FileStoragePort> backendsDisponibles() {
        List<FileStoragePort> ordonnes = "r2".equalsIgnoreCase(preference)
                ? Arrays.asList(cloudflareR2, disqueLocal)
                : Arrays.asList(disqueLocal, cloudflareR2);

        List<FileStoragePort> retenus = new ArrayList<>();
        for (FileStoragePort backend : ordonnes) {
            if (backend.estDisponible()) {
                retenus.add(backend);
            }
        }
        return retenus;
    }

    @Override
    public String uploadFile(byte[] fileBytes, String fileKey, String contentType) {
        List<FileStoragePort> backends = backendsDisponibles();
        if (backends.isEmpty()) {
            throw new DomainException(
                    "Aucun espace de stockage n'est disponible pour enregistrer l'image. "
                            + "Contactez l'administrateur du site.");
        }

        List<String> echecs = new ArrayList<>();
        int reussites = 0;

        for (FileStoragePort backend : backends) {
            try {
                backend.uploadFile(fileBytes, fileKey, contentType);
                reussites++;
            } catch (RuntimeException e) {
                echecs.add(backend.nomTechnique() + " : " + e.getMessage());
                log.warn("Réplication de l'image {} impossible sur {} — {}",
                        fileKey, backend.nomTechnique(), e.getMessage());
            }
        }

        if (reussites == 0) {
            throw new DomainException(
                    "Enregistrement de l'image impossible sur tous les espaces de stockage. "
                            + String.join(" | ", echecs));
        }

        if (!echecs.isEmpty()) {
            log.warn("Image {} enregistrée sur {} backend(s) sur {} : redondance dégradée.",
                    fileKey, reussites, backends.size());
        }

        return getFileUrl(fileKey);
    }

    @Override
    public byte[] downloadFile(String fileKey) {
        List<FileStoragePort> backends = backendsDisponibles();
        if (backends.isEmpty()) {
            throw new DomainException("Aucun espace de stockage n'est disponible pour lire l'image.");
        }

        RuntimeException dernièreErreur = null;
        for (FileStoragePort backend : backends) {
            try {
                return backend.downloadFile(fileKey);
            } catch (RuntimeException e) {
                dernièreErreur = e;
                log.debug("Image {} absente de {} — bascule sur le backend suivant.",
                        fileKey, backend.nomTechnique());
            }
        }

        // Message contenant « introuvable » : le gestionnaire global le traduit en 404.
        throw new DomainException("Image introuvable : " + fileKey,
                dernièreErreur);
    }

    @Override
    public void deleteFile(String fileKey) {
        // Suppression sur tous les backends : la copie miroir ne doit pas
        // ressusciter une image supprimée via la bascule de lecture.
        boolean auMoinsUneReussite = false;
        for (FileStoragePort backend : backendsDisponibles()) {
            try {
                backend.deleteFile(fileKey);
                auMoinsUneReussite = true;
            } catch (RuntimeException e) {
                log.warn("Suppression de l'image {} impossible sur {} — {}",
                        fileKey, backend.nomTechnique(), e.getMessage());
            }
        }

        if (!auMoinsUneReussite) {
            throw new DomainException("Suppression de l'image impossible : " + fileKey);
        }
    }

    /**
     * URL publique stable, indépendante du backend réellement utilisé.
     * Voir la note de classe : nginx sert le fichier depuis le disque s'il
     * existe, sinon la requête est relayée à l'API qui la récupère sur R2.
     */
    @Override
    public String getFileUrl(String fileKey) {
        return disqueLocal.getFileUrl(fileKey);
    }

    @Override
    public boolean estDisponible() {
        return !backendsDisponibles().isEmpty();
    }

    @Override
    public String nomTechnique() {
        return "stockage redondant";
    }
}
