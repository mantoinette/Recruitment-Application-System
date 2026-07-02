package com.anto.recruitment_system.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;

@RestController
@RequestMapping("/files")
public class FileController {

    @GetMapping("/download")
    public ResponseEntity<Resource> downloadFile(@RequestParam String path) throws Exception {
        if (path == null || path.isBlank()) {
            throw new IllegalArgumentException("File path is required");
        }

        Path normalized = Path.of(path).normalize();
        if (!normalized.startsWith("uploads")) {
            throw new IllegalArgumentException("Invalid file path");
        }

        Resource resource = new UrlResource(normalized.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            throw new IllegalArgumentException("File not found");
        }

        String filename = normalized.getFileName().toString();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(exception.getMessage());
    }
}
