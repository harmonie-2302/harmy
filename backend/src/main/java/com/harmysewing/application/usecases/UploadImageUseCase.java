package com.harmysewing.application.usecases;

import com.harmysewing.application.ports.in.UploadImageInputPort;
import com.harmysewing.application.ports.out.FileStoragePort;
import com.harmysewing.domain.exceptions.DomainException;

import java.util.UUID;

public class UploadImageUseCase implements UploadImageInputPort {

    private final FileStoragePort fileStoragePort;

    public UploadImageUseCase(FileStoragePort fileStoragePort) {
        this.fileStoragePort = fileStoragePort;
    }

    @Override
    public Result executer(Command command) {
        if (command.fileBytes() == null || command.fileBytes().length == 0) {
            throw new DomainException("Le fichier fourni est vide ou invalide.");
        }

        String extension = getFileExtension(command.fileName());
        String fileKey = UUID.randomUUID() + (extension.isEmpty() ? "" : "." + extension);

        String fileUrl = fileStoragePort.uploadFile(command.fileBytes(), fileKey, command.contentType());

        return new Result(
                fileKey,
                fileUrl,
                command.contentType(),
                command.fileBytes().length
        );
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    }
}
