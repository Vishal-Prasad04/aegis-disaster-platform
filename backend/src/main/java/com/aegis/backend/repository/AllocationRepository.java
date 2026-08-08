package com.aegis.backend.repository;

import com.aegis.backend.entity.Allocation;
import com.aegis.backend.enums.AllocationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AllocationRepository extends JpaRepository<Allocation, String> {
    List<Allocation> findByDisaster_Id(String disasterId);
    List<Allocation> findByStatus(AllocationStatus status);
    List<Allocation> findByDisaster_IdAndStatusIn(String disasterId, List<AllocationStatus> statuses);
    List<Allocation> findByStatusIn(List<AllocationStatus> statuses);

    // Added for idempotent demo-data seeding (DataSeeder) - Allocation has no natural
    // unique field, so the seeder checks this resource+disaster+requester combination
    // already exists before inserting it again.
    boolean existsByDisaster_IdAndResource_IdAndRequestedBy(String disasterId, String resourceId, String requestedBy);
}
