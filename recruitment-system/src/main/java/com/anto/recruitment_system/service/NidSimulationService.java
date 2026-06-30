package com.anto.recruitment_system.service;

import com.anto.recruitment_system.dto.NidProfileResponse;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Simulates the National ID (NID) API used during application submission.
 */
@Service
public class NidSimulationService {

    private static final Map<String, NidProfileResponse> MOCK_REGISTRY = Map.of(
            "1199880012345678", new NidProfileResponse(
                    "1199880012345678",
                    "Jean Claude Uwimana",
                    "1998-04-12",
                    "Male",
                    "Kigali, Gasabo",
                    "Profile retrieved from NID registry"
            ),
            "1199770023456789", new NidProfileResponse(
                    "1199770023456789",
                    "Marie Claire Mukamana",
                    "1997-08-21",
                    "Female",
                    "Kigali, Kicukiro",
                    "Profile retrieved from NID registry"
            ),
            "1199660034567890", new NidProfileResponse(
                    "1199660034567890",
                    "Patrick Nshimiyimana",
                    "1996-11-03",
                    "Male",
                    "Musanze, Northern Province",
                    "Profile retrieved from NID registry"
            )
    );

    public NidProfileResponse lookup(String nationalId) {
        if (nationalId == null || nationalId.isBlank()) {
            throw new IllegalArgumentException("National ID is required");
        }

        String normalizedId = nationalId.trim();

        NidProfileResponse profile = MOCK_REGISTRY.get(normalizedId);
        if (profile != null) {
            return profile;
        }

        if (!normalizedId.matches("\\d{16}")) {
            throw new IllegalArgumentException("National ID must be 16 digits");
        }

        return new NidProfileResponse(
                normalizedId,
                "Verified Applicant",
                "1999-01-01",
                "Not specified",
                "Rwanda",
                "Profile retrieved from NID registry (simulated)"
        );
    }
}
