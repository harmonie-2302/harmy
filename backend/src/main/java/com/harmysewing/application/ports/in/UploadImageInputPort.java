package com.harmysewing.application.ports.in;

public interface UploadImageInputPort {

    record Command(
            byte[] fileBytes,
            String fileName,
            String contentType
    ) {}

    record Result(
            String fileKey,
            String fileUrl,
            String contentType,
            long sizeInBytes
    ) {}

    Result executer(Command command);
}
