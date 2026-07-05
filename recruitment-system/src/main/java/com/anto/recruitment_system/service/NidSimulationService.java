package com.anto.recruitment_system.service;

import com.anto.recruitment_system.dto.NidProfileResponse;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Simulates the National ID (NID) API used during profile completion.
 */
@Service
public class NidSimulationService {

    private static final Map<String, NidProfileResponse> MOCK_REGISTRY = Map.of(
            "1199888012345678", namedProfile(
                    "1199888012345678",
                    "Jean Claude Uwimana"
            ),
            "1199777012345678", namedProfile(
                    "1199777012345678",
                    "Marie Claire Mukamana"
            ),
            "1199668034567890", namedProfile(
                    "1199668034567890",
                    "Patrick Nshimiyimana"
            )
    );

    public NidProfileResponse lookup(String nationalId) {
        if (nationalId == null || nationalId.isBlank()) {
            throw new IllegalArgumentException("National ID is required");
        }

        String normalizedId = nationalId.trim();

        if (!normalizedId.matches("\\d{16}")) {
            throw new IllegalArgumentException("National ID must be 16 digits");
        }

        NidProfileResponse knownProfile = MOCK_REGISTRY.get(normalizedId);
        if (knownProfile != null) {
            return knownProfile;
        }

        return buildFromDigits(normalizedId, "");
    }

    private static NidProfileResponse namedProfile(String nationalId, String fullName) {
        return buildFromDigits(nationalId, fullName);
    }

    private static NidProfileResponse buildFromDigits(String nationalId, String fullName) {
        NidParser.ParsedNid parsed = NidParser.parse(nationalId);

        return new NidProfileResponse(
                nationalId,
                fullName == null || fullName.isBlank() ? null : fullName,
                parsed.dateOfBirth(),
                parsed.gender(),
                parsed.district(),
                parsed.sector(),
                parsed.address(),
                "Profile retrieved from NID registry (birth year "
                        + parsed.birthYear()
                        + ", gender digit "
                        + nationalId.charAt(5)
                        + ")"
        );
    }
}
