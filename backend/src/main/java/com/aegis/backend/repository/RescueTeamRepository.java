package com.aegis.backend.repository;

import com.aegis.backend.entity.RescueTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface RescueTeamRepository extends JpaRepository<RescueTeam, String>, JpaSpecificationExecutor<RescueTeam> {
    // Added for idempotent demo-data seeding (DataSeeder) - lets the seeder check
    // whether a given team already exists by name before inserting it again.
    boolean existsByName(String name);
}
