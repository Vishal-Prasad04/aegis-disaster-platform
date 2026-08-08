package com.aegis.backend.enums;

public enum Role {
    ADMIN("Admin"),
    COORDINATOR("Coordinator"),
    FIELD_OFFICER("Field Officer"),
    VOLUNTEER("Volunteer");

    private final String label;

    Role(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static Role fromLabel(String label) {
        for (Role r : values()) {
            if (r.label.equalsIgnoreCase(label) || r.name().equalsIgnoreCase(label)) {
                return r;
            }
        }
        throw new IllegalArgumentException("Unknown role: " + label);
    }
}
