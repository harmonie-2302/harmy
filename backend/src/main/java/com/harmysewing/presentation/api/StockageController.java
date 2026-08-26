package com.harmysewing.presentation.api;

import com.harmysewing.application.ports.in.UploadImageInputPort;
import com.harmysewing.application.ports.out.FileStoragePort;
import com.harmysewing.domain.exceptions.DomainException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/storage")
public class StockageController {

    private final UploadImageInputPort uploadImageInputPort;
    private final FileStoragePort fileStoragePort;

    public StockageController(UploadImageInputPort uploadImageInputPort, FileStoragePort fileStoragePort) {
        this.uploadImageInputPort = uploadImageInputPort;
        this.fileStoragePort = fileStoragePort;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadImageInputPort.Result> uploaderFichier(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new DomainException("Le fichier envoyé est vide.");
        }

        try {
            UploadImageInputPort.Command command = new UploadImageInputPort.Command(
                    file.getBytes(),
                    file.getOriginalFilename(),
                    file.getContentType()
            );

            UploadImageInputPort.Result result = uploadImageInputPort.executer(command);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);

        } catch (IOException e) {
            throw new DomainException("Impossible de lire les octets du fichier téléversé.", e);
        }
    }

    /**
     * Lecture de secours d'une image, en accès public.
     *
     * <p>En production, nginx sert d'abord le fichier depuis le disque
     * ({@code /uploads/<clé>}). Cette route n'est sollicitée que lorsque le
     * fichier est absent du disque : l'orchestrateur de stockage le récupère
     * alors sur Cloudflare R2, ce qui rend la panne d'un backend invisible pour
     * le visiteur.</p>
     */
    @GetMapping("/{fileKey}")
    public ResponseEntity<byte[]> telechargerFichier(@PathVariable String fileKey) {
        byte[] fileBytes = fileStoragePort.downloadFile(fileKey);
        String lowerKey = fileKey.toLowerCase();
        MediaType mediaType = MediaType.IMAGE_JPEG;
        if (lowerKey.endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        } else if (lowerKey.endsWith(".webp")) {
            mediaType = MediaType.parseMediaType("image/webp");
        } else if (lowerKey.endsWith(".gif")) {
            mediaType = MediaType.IMAGE_GIF;
        } else if (lowerKey.endsWith(".avif")) {
            mediaType = MediaType.parseMediaType("image/avif");
        } else if (lowerKey.endsWith(".svg")) {
            mediaType = MediaType.parseMediaType("image/svg+xml");
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileKey + "\"")
                // La clé est un UUID immuable : le contenu ne changera jamais.
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000, immutable")
                .contentType(mediaType)
                .body(fileBytes);
    }

    @DeleteMapping("/{fileKey}")
    public ResponseEntity<Void> supprimerFichier(@PathVariable String fileKey) {
        fileStoragePort.deleteFile(fileKey);
        return ResponseEntity.noContent().build();
    }
}
