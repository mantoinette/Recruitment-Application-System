package com.anto.recruitment_system.controller;

import com.anto.recruitment_system.dto.NesaRecordResponse;
import com.anto.recruitment_system.service.NesaSimulationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/nesa")
public class NesaController {

    private final NesaSimulationService nesaSimulationService;

    public NesaController(NesaSimulationService nesaSimulationService) {
        this.nesaSimulationService = nesaSimulationService;
    }

    @GetMapping("/{nationalId}")
    public ResponseEntity<NesaRecordResponse> lookup(@PathVariable String nationalId) {
        return ResponseEntity.ok(nesaSimulationService.lookup(nationalId));
    }
}
