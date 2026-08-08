package com.aegis.backend.enums;

public enum TeamStatus {
    ON_DUTY("On Duty"),
    DEPLOYED("Deployed"),
    STANDBY("Standby"),
    OFF_DUTY("Off Duty");

    private final String label;

    TeamStatus(String label) { this.label = label; }
    public String getLabel() { return label; }

    public static TeamStatus fromLabel(String label) {
        for (TeamStatus s : values()) {
            if (s.label.equalsIgnoreCase(label) || s.name().equalsIgnoreCase(label)) return s;
        }
        throw new IllegalArgumentException("Unknown team status: " + label);
    }
}
