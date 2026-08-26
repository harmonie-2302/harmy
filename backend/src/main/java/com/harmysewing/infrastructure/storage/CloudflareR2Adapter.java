package com.harmysewing.infrastructure.storage;

import com.harmysewing.application.ports.out.FileStoragePort;
import com.harmysewing.domain.exceptions.DomainException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.*;

import java.net.URI;

/**
 * Stockage des images sur Cloudflare R2 (API compatible S3).
 *
 * <p><strong>Piège de configuration</strong> : la {@code secret-key} attendue
 * par R2 est le SHA-256 (64 caractères hexadécimaux) de la « Token value »
 * affichée par le tableau de bord Cloudflare. Une clé de longueur différente
 * provoque systématiquement un {@code SignatureDoesNotMatch}. Ce cas est
 * détecté au démarrage et désactive proprement l'adaptateur au lieu de laisser
 * chaque téléversement échouer.</p>
 */
@Component("cloudflareR2Storage")
public class CloudflareR2Adapter implements FileStoragePort {

    private static final Logger log = LoggerFactory.getLogger(CloudflareR2Adapter.class);

    /** Longueur imposée par R2 pour la Secret Access Key (SHA-256 hexadécimal). */
    private static final int LONGUEUR_SECRET_ATTENDUE = 64;

    @Value("${cloudflare.r2.endpoint:}")
    private String endpoint;

    @Value("${cloudflare.r2.bucket:}")
    private String bucketName;

    @Value("${cloudflare.r2.access-key:}")
    private String accessKey;

    @Value("${cloudflare.r2.secret-key:}")
    private String secretKey;

    @Value("${cloudflare.r2.public-url:}")
    private String publicBaseUrl;

    private S3Client s3Client;
    private boolean disponible;

    @PostConstruct
    public void initS3Client() {
        if (estVide(endpoint) || estVide(bucketName) || estVide(accessKey) || estVide(secretKey)) {
            disponible = false;
            log.warn("Cloudflare R2 non configuré : adaptateur désactivé, le disque local assure seul le stockage.");
            return;
        }

        if (secretKey.length() != LONGUEUR_SECRET_ATTENDUE) {
            disponible = false;
            log.error("Cloudflare R2 DÉSACTIVÉ : CLOUDFLARE_R2_SECRET_KEY fait {} caractères au lieu de {}. "
                            + "La Secret Access Key R2 est le SHA-256 de la « Token value » du tableau de bord Cloudflare.",
                    secretKey.length(), LONGUEUR_SECRET_ATTENDUE);
            return;
        }

        try {
            AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
            this.s3Client = S3Client.builder()
                    .endpointOverride(URI.create(endpoint))
                    .credentialsProvider(StaticCredentialsProvider.create(credentials))
                    .region(Region.US_EAST_1)
                    // R2 n'implémente pas l'adressage « virtual-hosted » que le
                    // SDK v2 utilise par défaut : sans ceci les requêtes ciblent
                    // https://<bucket>.<account>.r2.cloudflarestorage.com et échouent.
                    .serviceConfiguration(S3Configuration.builder()
                            .pathStyleAccessEnabled(true)
                            .build())
                    .build();
            this.disponible = true;
            log.info("Cloudflare R2 prêt : bucket « {} » sur {}", bucketName, endpoint);
        } catch (RuntimeException e) {
            this.disponible = false;
            log.error("Cloudflare R2 DÉSACTIVÉ : initialisation impossible ({})", e.getMessage());
        }
    }

    @Override
    public boolean estDisponible() {
        return disponible;
    }

    @Override
    public String nomTechnique() {
        return "Cloudflare R2";
    }

    @Override
    public String uploadFile(byte[] fileBytes, String fileKey, String contentType) {
        exigerDisponibilite();
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .contentType(contentType != null ? contentType : "application/octet-stream")
                    // Affichage dans le navigateur plutôt que téléchargement,
                    // et mise en cache longue : la clé est un UUID immuable.
                    .contentDisposition("inline; filename=\"" + fileKey + "\"")
                    .cacheControl("public, max-age=31536000, immutable")
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(fileBytes));
            return getFileUrl(fileKey);
        } catch (Exception e) {
            throw new DomainException("Échec du téléversement du fichier sur Cloudflare R2: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] downloadFile(String fileKey) {
        exigerDisponibilite();
        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build();

            ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(getObjectRequest);
            return objectBytes.asByteArray();
        } catch (Exception e) {
            throw new DomainException("Échec de la récupération du fichier depuis Cloudflare R2: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteFile(String fileKey) {
        exigerDisponibilite();
        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
        } catch (Exception e) {
            throw new DomainException("Échec de la suppression du fichier sur Cloudflare R2: " + e.getMessage(), e);
        }
    }

    @Override
    public String getFileUrl(String fileKey) {
        if (estVide(publicBaseUrl)) {
            throw new DomainException("CLOUDFLARE_R2_PUBLIC_URL n'est pas configurée.");
        }
        if (publicBaseUrl.endsWith("/")) {
            return publicBaseUrl + fileKey;
        }
        return publicBaseUrl + "/" + fileKey;
    }

    private void exigerDisponibilite() {
        if (!disponible) {
            throw new DomainException("Cloudflare R2 est indisponible (configuration absente ou invalide).");
        }
    }

    private boolean estVide(String valeur) {
        return valeur == null || valeur.isBlank();
    }
}
