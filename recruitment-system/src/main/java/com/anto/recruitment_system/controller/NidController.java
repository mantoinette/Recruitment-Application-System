package com.anto.recruitment_system.controller;

import com.anto.recruitment_system.dto.NidProfileResponse;
import com.anto.recruitment_system.service.NidSimulationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/nid")
public class NidController {

    private final NidSimulationService nidSimulationService;

    public NidController(NidSimulationService nidSimulationService) {
        this.nidSimulationService = nidSimulationService;
    }

    @GetMapping("/{nationalId}")
    public ResponseEntity<NidProfileResponse> lookup(@PathVariable String nationalId) {
        return ResponseEntity.ok(nidSimulationService.lookup(nationalId));
    }
}
