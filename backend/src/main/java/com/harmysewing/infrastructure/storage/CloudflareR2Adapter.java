package com.harmysewing.infrastructure.storage;

import com.harmysewing.application.ports.out.FileStoragePort;
import com.harmysewing.domain.exceptions.DomainException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.net.URI;

@Component
public class CloudflareR2Adapter implements FileStoragePort {

    @Value("${cloudflare.r2.endpoint:https://account_id.r2.cloudflarestorage.com}")
    private String endpoint;

    @Value("${cloudflare.r2.bucket:harmy-storage}")
    private String bucketName;

    @Value("${cloudflare.r2.access-key:MY_ACCESS_KEY}")
    private String accessKey;

    @Value("${cloudflare.r2.secret-key:MY_SECRET_KEY}")
    private String secretKey;

    @Value("${cloudflare.r2.public-url:https://pub-r2.harmysewing.com}")
    private String publicBaseUrl;

    private S3Client s3Client;

    @PostConstruct
    public void initS3Client() {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
        this.s3Client = S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .region(Region.US_EAST_1)
                .build();
    }

    @Override
    public String uploadFile(byte[] fileBytes, String fileKey, String contentType) {
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileKey)
                    .contentType(contentType != null ? contentType : "application/octet-stream")
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(fileBytes));
            return getFileUrl(fileKey);
        } catch (Exception e) {
            throw new DomainException("Échec du téléversement du fichier sur Cloudflare R2: " + e.getMessage(), e);
        }
    }

    @Override
    public byte[] downloadFile(String fileKey) {
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
        if (publicBaseUrl.endsWith("/")) {
            return publicBaseUrl + fileKey;
        }
        return publicBaseUrl + "/" + fileKey;
    }
}
