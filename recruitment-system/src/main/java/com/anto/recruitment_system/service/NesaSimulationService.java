package com.anto.recruitment_system.service;

import com.anto.recruitment_system.dto.NesaRecordResponse;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Simulates the NESA API used to verify secondary school grade and option.
 */
@Service
public class NesaSimulationService {

    private static final Map<String, NesaRecordResponse> MOCK_RESULTS = Map.of(
            "1199888012345678", new NesaRecordResponse(
                    "1199888012345678",
                    "Mushimiyimana Antoinette",
                    "A",
                    "Mathematics, Physics, Computer Science",
                    "GS Kigali",
                    "2018",
                    "Academic record retrieved from NESA"
            ),
            "1199777012345678", new NesaRecordResponse(
                    "1199777012345678",
                    "Gira Rei",
                    "B+",
                    "Biology, Chemistry, Mathematics",
                    "ES Kicukiro",
                    "2017",
                    "Academic record retrieved from NESA"
            ),
            "1199668034567890", new NesaRecordResponse(
                    "1199668034567890",
                    "Ikamba Gaia",
                    "A-",
                    "Economics, Geography, History",
                    "GS Musanze",
                    "2016",
                    "Academic record retrieved from NESA"
            )
    );

    public NesaRecordResponse lookup(String nationalId) {
        if (nationalId == null || nationalId.isBlank()) {
            throw new IllegalArgumentException("National ID is required for NESA lookup");
        }

        String normalizedId = nationalId.trim();
        NesaRecordResponse record = MOCK_RESULTS.get(normalizedId);

        if (record != null) {
            return record;
        }

        return new NesaRecordResponse(
                normalizedId,
                "Verified Candidate",
                "B",
                "General Studies",
                "Secondary School",
                "2019",
                "Academic record retrieved from NESA (simulated)"
        );
    }
}
