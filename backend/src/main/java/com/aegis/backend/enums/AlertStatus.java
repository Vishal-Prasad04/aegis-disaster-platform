package com.aegis.backend.enums;

public enum AlertStatus {
    OPEN("Open"),
    ACKNOWLEDGED("Acknowledged"),
    RESOLVED("Resolved");

    private final String label;

    AlertStatus(String label) { this.label = label; }
    public String getLabel() { return label; }

    public static AlertStatus fromLabel(String label) {
        for (AlertStatus s : values()) {
            if (s.label.equalsIgnoreCase(label) || s.name().equalsIgnoreCase(label)) return s;
        }
        throw new IllegalArgumentException("Unknown alert status: " + label);
    }
}
