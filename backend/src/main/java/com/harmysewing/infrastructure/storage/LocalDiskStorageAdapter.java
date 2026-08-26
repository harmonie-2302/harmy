package com.harmysewing.infrastructure.storage;

import com.harmysewing.application.ports.out.FileStoragePort;
import com.harmysewing.domain.exceptions.DomainException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.file.attribute.PosixFilePermission;
import java.nio.file.attribute.PosixFilePermissions;
import java.util.Set;

/**
 * Stockage des images sur le disque du VPS.
 *
 * <p>Les fichiers sont écrits dans {@code harmy.storage.local.directory}, que
 * nginx expose directement sous le préfixe {@code harmy.storage.local.public-path}.
 * C'est le chemin de lecture rapide : les octets ne traversent pas la JVM.</p>
 *
 * <p>L'URL retournée est <strong>relative</strong> ({@code /uploads/uuid.jpg}),
 * elle reste donc valable quel que soit le domaine ou l'IP publique.</p>
 */
@Component("localDiskStorage")
public class LocalDiskStorageAdapter implements FileStoragePort {

    private static final Logger log = LoggerFactory.getLogger(LocalDiskStorageAdapter.class);

    /**
     * rw-r--r-- : nginx tourne sous www-data et doit pouvoir lire les images.
     * Indispensable car {@link Files#createTempFile} crée le fichier en 600 et
     * {@link Files#move} conserve ces droits.
     */
    private static final Set<PosixFilePermission> DROITS_LECTURE_PUBLIQUE =
            PosixFilePermissions.fromString("rw-r--r--");

    @Value("${harmy.storage.local.directory:/var/www/harmy/uploads}")
    private String directory;

    @Value("${harmy.storage.local.public-path:/uploads}")
    private String publicPath;

    private Path racine;
    private boolean disponible;

    @PostConstruct
    public void initialiserRepertoire() {
        try {
            this.racine = Paths.get(directory).toAbsolutePath().normalize();
            Files.createDirectories(this.racine);
            this.disponible = Files.isWritable(this.racine);
            if (!this.disponible) {
                log.error("Stockage local INDISPONIBLE : {} n'est pas accessible en écriture.", this.racine);
            } else {
                log.info("Stockage local prêt : {} (exposé sous {})", this.racine, publicPath);
            }
        } catch (IOException | RuntimeException e) {
            // Un disque local en échec ne doit pas empêcher le démarrage : R2
            // peut assurer seul le service.
            this.disponible = false;
            log.error("Stockage local INDISPONIBLE ({}) : {}", directory, e.getMessage());
        }
    }

    @Override
    public boolean estDisponible() {
        return disponible;
    }

    @Override
    public String nomTechnique() {
        return "disque local";
    }

    @Override
    public String uploadFile(byte[] fileBytes, String fileKey, String contentType) {
        Path cible = resoudreCleSure(fileKey);
        // Écriture atomique : le fichier temporaire n'est déplacé qu'une fois
        // complet, afin qu'aucune requête ne lise une image partielle.
        Path temporaire = null;
        try {
            temporaire = Files.createTempFile(racine, ".upload-", ".part");
            Files.write(temporaire, fileBytes);
            appliquerDroitsLecturePublique(temporaire);
            Files.move(temporaire, cible, StandardCopyOption.REPLACE_EXISTING);
            return getFileUrl(fileKey);
        } catch (IOException e) {
            supprimerSilencieusement(temporaire);
            throw new DomainException(
                    "Échec de l'enregistrement de l'image sur le disque : " + e.getMessage(), e);
        }
    }

    /**
     * Ouvre l'image en lecture à nginx. Silencieux sur les systèmes de fichiers
     * non POSIX (développement sous Windows), où la notion n'existe pas.
     */
    private void appliquerDroitsLecturePublique(Path chemin) {
        try {
            Files.setPosixFilePermissions(chemin, DROITS_LECTURE_PUBLIQUE);
        } catch (UnsupportedOperationException | IOException e) {
            log.debug("Droits POSIX non applicables sur {} : {}", chemin, e.getMessage());
        }
    }

    @Override
    public byte[] downloadFile(String fileKey) {
        Path source = resoudreCleSure(fileKey);
        if (!Files.isRegularFile(source)) {
            throw new DomainException("Image absente du disque local : " + fileKey);
        }
        try {
            return Files.readAllBytes(source);
        } catch (IOException e) {
            throw new DomainException(
                    "Échec de la lecture de l'image sur le disque : " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteFile(String fileKey) {
        try {
            Files.deleteIfExists(resoudreCleSure(fileKey));
        } catch (IOException e) {
            throw new DomainException(
                    "Échec de la suppression de l'image sur le disque : " + e.getMessage(), e);
        }
    }

    @Override
    public String getFileUrl(String fileKey) {
        String prefixe = publicPath.endsWith("/")
                ? publicPath.substring(0, publicPath.length() - 1)
                : publicPath;
        return prefixe + "/" + fileKey;
    }

    private void supprimerSilencieusement(Path chemin) {
        if (chemin == null) {
            return;
        }
        try {
            Files.deleteIfExists(chemin);
        } catch (IOException ignored) {
            // Le nettoyage ne doit pas masquer l'erreur d'origine.
        }
    }

    /**
     * Convertit une clé en chemin absolu, en refusant toute tentative de sortie
     * du répertoire de stockage (« ../ », chemin absolu, séparateur imbriqué).
     */
    private Path resoudreCleSure(String fileKey) {
        if (fileKey == null || fileKey.isBlank()) {
            throw new DomainException("La clé du fichier est obligatoire.");
        }
        if (fileKey.contains("/") || fileKey.contains("\\") || fileKey.contains("..")) {
            throw new DomainException("Clé de fichier invalide : " + fileKey);
        }

        Path resolu = racine.resolve(fileKey).normalize();
        if (!resolu.startsWith(racine)) {
            throw new DomainException("Clé de fichier invalide : " + fileKey);
        }
        return resolu;
    }
}
