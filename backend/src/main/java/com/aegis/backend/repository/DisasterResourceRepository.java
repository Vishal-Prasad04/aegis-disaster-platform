package com.aegis.backend.repository;

import com.aegis.backend.entity.DisasterResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface DisasterResourceRepository extends JpaRepository<DisasterResource, String>, JpaSpecificationExecutor<DisasterResource> {
    // Added for idempotent demo-data seeding (DataSeeder) - lets the seeder look up
    // (or confirm the absence of) a resource by name before inserting it again.
    Optional<DisasterResource> findByName(String name);
}
