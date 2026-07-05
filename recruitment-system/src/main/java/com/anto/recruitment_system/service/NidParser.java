package com.anto.recruitment_system.service;

import java.util.Map;

/**
 * Parses Rwanda National ID digits for simulated registry lookup.
 * Positions are 1-based as printed on the card:
 * 2-5 = birth year, 6 = gender (7 female, 8 male), 7-8 = district code, 9-11 = sector code.
 */
final class NidParser {

    private static final Map<String, String> DISTRICTS = Map.ofEntries(
            Map.entry("00", "Gasabo"),
            Map.entry("01", "Kicukiro"),
            Map.entry("02", "Nyarugenge"),
            Map.entry("03", "Musanze"),
            Map.entry("04", "Rubavu"),
            Map.entry("05", "Huye"),
            Map.entry("06", "Muhanga"),
            Map.entry("07", "Rwamagana"),
            Map.entry("08", "Nyagatare"),
            Map.entry("09", "Rusizi")
    );

    private static final Map<String, String> SECTORS = Map.ofEntries(
            Map.entry("001", "Kimironko"),
            Map.entry("002", "Remera"),
            Map.entry("003", "Gikondo"),
            Map.entry("004", "Muhoza"),
            Map.entry("005", "Tumba"),
            Map.entry("123", "Kimironko"),
            Map.entry("234", "Gikondo"),
            Map.entry("345", "Muhoza"),
            Map.entry("456", "Nyamata"),
            Map.entry("567", "Kinigi")
    );

    private NidParser() {
    }

    static ParsedNid parse(String nationalId) {
        if (nationalId == null || !nationalId.matches("\\d{16}")) {
            throw new IllegalArgumentException("National ID must be 16 digits");
        }

        String birthYear = nationalId.substring(1, 5);
        char genderDigit = nationalId.charAt(5);
        String districtCode = nationalId.substring(6, 8);
        String sectorCode = nationalId.substring(8, 11);

        String gender = switch (genderDigit) {
            case '7' -> "Female";
            case '8' -> "Male";
            default -> "Not specified";
        };

        String district = DISTRICTS.getOrDefault(districtCode, "Kigali");
        String sector = SECTORS.getOrDefault(sectorCode, district + " Sector");

        int month = (Integer.parseInt(nationalId.substring(12, 14)) % 12) + 1;
        int day = (Integer.parseInt(nationalId.substring(14, 16)) % 28) + 1;
        String dateOfBirth = String.format("%s-%02d-%02d", birthYear, month, day);
        String address = String.format("Rwanda, %s, %s", district, sector);

        return new ParsedNid(birthYear, dateOfBirth, gender, district, sector, address);
    }

    record ParsedNid(
            String birthYear,
            String dateOfBirth,
            String gender,
            String district,
            String sector,
            String address
    ) {
    }
}
