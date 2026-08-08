package com.aegis.backend.enums;

public enum DisasterStatus {
    ACTIVE("Active"),
    MONITORING("Monitoring"),
    CONTAINED("Contained"),
    RESOLVED("Resolved");

    private final String label;

    DisasterStatus(String label) { this.label = label; }
    public String getLabel() { return label; }

    public static DisasterStatus fromLabel(String label) {
        for (DisasterStatus s : values()) {
            if (s.label.equalsIgnoreCase(label) || s.name().equalsIgnoreCase(label)) return s;
        }
        throw new IllegalArgumentException("Unknown disaster status: " + label);
    }
}
