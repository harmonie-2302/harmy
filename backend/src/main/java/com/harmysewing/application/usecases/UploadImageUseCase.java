package com.harmysewing.application.usecases;

import com.harmysewing.application.ports.in.UploadImageInputPort;
import com.harmysewing.application.ports.out.FileStoragePort;
import com.harmysewing.domain.exceptions.DomainException;

import java.util.Locale;
import java.util.Map;
import java.util.UUID;

public class UploadImageUseCase implements UploadImageInputPort {

    /** 15 Mo : couvre une photo de smartphone, sous la limite nginx de 25 Mo. */
    private static final long TAILLE_MAXIMALE_OCTETS = 15L * 1024 * 1024;

    /**
     * Types d'images acceptés, associés à l'extension canonique utilisée pour
     * la clé stockée. L'extension n'est jamais reprise du nom de fichier
     * d'origine : cela évite qu'un nom tel que « photo.jpg.html » aboutisse à
     * un fichier servi comme du HTML (exécution de script sur le domaine).
     */
    private static final Map<String, String> EXTENSIONS_PAR_TYPE_MIME = Map.of(
            "image/jpeg", "jpg",
            "image/jpg", "jpg",
            "image/png", "png",
            "image/webp", "webp",
            "image/gif", "gif",
            "image/avif", "avif"
    );

    private final FileStoragePort fileStoragePort;

    public UploadImageUseCase(FileStoragePort fileStoragePort) {
        this.fileStoragePort = fileStoragePort;
    }

    @Override
    public Result executer(Command command) {
        if (command.fileBytes() == null || command.fileBytes().length == 0) {
            throw new DomainException("Le fichier fourni est vide ou invalide.");
        }

        if (command.fileBytes().length > TAILLE_MAXIMALE_OCTETS) {
            throw new DomainException(String.format(
                    "Image trop volumineuse (%.1f Mo). La taille maximale autorisée est de 15 Mo.",
                    command.fileBytes().length / (1024.0 * 1024.0)));
        }

        String contentType = normaliserTypeMime(command.contentType());
        String extension = EXTENSIONS_PAR_TYPE_MIME.get(contentType);
        if (extension == null) {
            throw new DomainException(
                    "Format d'image non pris en charge. Formats acceptés : JPEG, PNG, WebP, GIF, AVIF.");
        }

        String fileKey = UUID.randomUUID() + "." + extension;
        String fileUrl = fileStoragePort.uploadFile(command.fileBytes(), fileKey, contentType);

        return new Result(
                fileKey,
                fileUrl,
                contentType,
                command.fileBytes().length
        );
    }

    /** Retire un éventuel paramètre de charset et uniformise la casse. */
    private String normaliserTypeMime(String contentType) {
        if (contentType == null) {
            return "";
        }
        int separateur = contentType.indexOf(';');
        String base = separateur >= 0 ? contentType.substring(0, separateur) : contentType;
        return base.trim().toLowerCase(Locale.ROOT);
    }
}
