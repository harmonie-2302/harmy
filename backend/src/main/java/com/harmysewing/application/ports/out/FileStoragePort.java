package com.harmysewing.application.ports.out;

public interface FileStoragePort {

    /**
     * Televerse un fichier bytes vers le stockage Cloudflare R2 / S3.
     * @param fileBytes Le contenu binaire du fichier
     * @param fileName Le nom original ou généré du fichier
     * @param contentType Le type MIME (ex: image/png, image/jpeg)
     * @return La clé ou l'URL publique d'accès au fichier
     */
    String uploadFile(byte[] fileBytes, String fileName, String contentType);

    /**
     * Télécharge le contenu d'un fichier depuis Cloudflare R2.
     * @param fileKey La clé du fichier dans le bucket
     * @return Les octets du fichier
     */
    byte[] downloadFile(String fileKey);

    /**
     * Supprime un fichier du stockage.
     * @param fileKey La clé du fichier dans le bucket
     */
    void deleteFile(String fileKey);

    /**
     * Retourne l'URL d'accès publique d'un fichier.
     * @param fileKey La clé du fichier dans le bucket
     * @return L'URL publique
     */
    String getFileUrl(String fileKey);
}
