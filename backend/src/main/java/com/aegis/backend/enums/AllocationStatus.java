package com.aegis.backend.enums;

public enum AllocationStatus {
    PENDING("Pending"),
    APPROVED("Approved"),
    IN_PROGRESS("In Progress"),
    COMPLETED("Completed"),
    REJECTED("Rejected");

    private final String label;

    AllocationStatus(String label) { this.label = label; }
    public String getLabel() { return label; }

    public static AllocationStatus fromLabel(String label) {
        for (AllocationStatus s : values()) {
            if (s.label.equalsIgnoreCase(label) || s.name().equalsIgnoreCase(label)) return s;
        }
        throw new IllegalArgumentException("Unknown allocation status: " + label);
    }
}
