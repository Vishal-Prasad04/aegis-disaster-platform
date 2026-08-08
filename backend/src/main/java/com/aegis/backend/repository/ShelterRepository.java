package com.aegis.backend.repository;

import com.aegis.backend.entity.Shelter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShelterRepository extends JpaRepository<Shelter, String> {
    List<Shelter> findByDisaster_Id(String disasterId);

    // Added for idempotent demo-data seeding (DataSeeder) - lets the seeder check
    // whether a given shelter already exists by name before inserting it again.
    boolean existsByName(String name);
}
