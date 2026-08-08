package com.aegis.backend.enums;

public enum ResourceStatus {
    AVAILABLE("Available"),
    ALLOCATED("Allocated"),
    IN_TRANSIT("In Transit"),
    DEPLETED("Depleted");

    private final String label;

    ResourceStatus(String label) { this.label = label; }
    public String getLabel() { return label; }

    public static ResourceStatus fromLabel(String label) {
        for (ResourceStatus s : values()) {
            if (s.label.equalsIgnoreCase(label) || s.name().equalsIgnoreCase(label)) return s;
        }
        throw new IllegalArgumentException("Unknown resource status: " + label);
    }
}
