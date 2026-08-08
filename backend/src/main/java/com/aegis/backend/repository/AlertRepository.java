package com.aegis.backend.repository;

import com.aegis.backend.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface AlertRepository extends JpaRepository<Alert, String>, JpaSpecificationExecutor<Alert> {
    // Added for idempotent demo-data seeding (DataSeeder) - lets the seeder check
    // whether a given alert already exists by title before inserting it again.
    boolean existsByTitle(String title);
}
