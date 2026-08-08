package com.aegis.backend.enums;

public enum Priority {
    CRITICAL("Critical"),
    HIGH("High"),
    MEDIUM("Medium"),
    LOW("Low");

    private final String label;

    Priority(String label) { this.label = label; }
    public String getLabel() { return label; }

    public static Priority fromLabel(String label) {
        for (Priority p : values()) {
            if (p.label.equalsIgnoreCase(label) || p.name().equalsIgnoreCase(label)) return p;
        }
        throw new IllegalArgumentException("Unknown priority: " + label);
    }
}
