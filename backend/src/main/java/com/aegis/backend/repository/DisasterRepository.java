package com.aegis.backend.repository;

import com.aegis.backend.entity.Disaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface DisasterRepository extends JpaRepository<Disaster, String>, JpaSpecificationExecutor<Disaster> {
    // Added for idempotent demo-data seeding (DataSeeder) - lets the seeder check
    // whether a given disaster already exists by name before inserting it again.
    Optional<Disaster> findByName(String name);
}
