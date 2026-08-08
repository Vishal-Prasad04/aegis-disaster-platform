package com.aegis.backend.config;

import com.aegis.backend.entity.*;
import com.aegis.backend.enums.*;
import com.aegis.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Seeds demo data for the Aegis platform so the app isn't empty on a fresh
 * database. One account per role (needed to exercise every permission path
 * in the UI), plus a baseline set of records per operational module, plus a
 * larger independently-checked batch of additional demo records so every
 * screen (dashboard, analytics, maps, lists) has enough data to look
 * properly populated.
 *
 * Runs whenever app.seed.enabled=true (default). Each entity type is
 * seeded/skipped independently based on whether ITS OWN records already
 * exist (checked by name/title, or by a natural key for join entities) -
 * never based on whether users exist - so re-running the app never creates
 * duplicates and never depends on unrelated tables being empty.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DisasterRepository disasterRepository;
    private final DisasterResourceRepository resourceRepository;
    private final AllocationRepository allocationRepository;
    private final ShelterRepository shelterRepository;
    private final RescueTeamRepository teamRepository;
    private final AlertRepository alertRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("Seeding disabled via app.seed.enabled=false");
            return;
        }

        // Baseline demo set: only inserted the very first time (when there are
        // no users yet), exactly as before - this never runs again once the
        // app has been started once, so it never adds/duplicates users.
        if (userRepository.count() == 0) {
            log.info("Seeding a small set of Aegis baseline demo data...");
            seedUsers();
            List<Disaster> disasters = seedDisasters();
            List<DisasterResource> resources = seedResources();
            seedShelters(disasters);
            seedTeams(disasters);
            seedAllocations(resources, disasters);
            seedAlerts(disasters);
            log.info("Baseline seed complete.");
        } else {
            log.info("Users already exist - skipping baseline seed (users are never added/modified by seeding).");
        }

        // Additional demo data: each entity type is checked and seeded
        // independently by its own natural key, regardless of whether users
        // (or any other table) already had data. Safe to run on every boot.
        log.info("Checking additional Aegis demo data...");
        List<Disaster> additionalDisasters = seedAdditionalDisasters();
        List<DisasterResource> additionalResources = seedAdditionalResources();
        seedAdditionalShelters(additionalDisasters);
        seedAdditionalTeams(additionalDisasters);
        seedAdditionalAllocations(additionalResources, additionalDisasters);
        seedAdditionalAlerts(additionalDisasters);
        log.info("Additional demo data check complete.");
    }

    // ---------------------------------------------------------------- users

    private void seedUsers() {
        // Exactly one account per role that the frontend's login page and
        // README document — enough to exercise every permission path
        // without generating filler accounts nobody will use.
        userRepository.saveAll(List.of(
                user("Ananya Rao", "admin@aegis.gov", "admin123", Role.ADMIN, "AR", "National HQ"),
                user("Rohit Malhotra", "coordinator@aegis.gov", "coord123", Role.COORDINATOR, "RM", "Bhopal Division"),
                user("Devendra Chouhan", "field@aegis.gov", "field123", Role.FIELD_OFFICER, "DC", "Hoshangabad Sector"),
                user("Priya Sharma", "volunteer@aegis.gov", "vol123", Role.VOLUNTEER, "PS", "Bhopal Division")
        ));
    }

    private User user(String name, String email, String rawPassword, Role role, String avatar, String region) {
        return User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .role(role)
                .avatar(avatar)
                .phone("+91 98765 10000")
                .region(region)
                .active(true)
                .build();
    }

    // ------------------------------------------------------------ disasters

    private List<Disaster> seedDisasters() {
        List<Disaster> disasters = List.of(
                Disaster.builder()
                        .name("Hoshangabad Basin Flooding")
                        .type("Flood")
                        .status(DisasterStatus.ACTIVE)
                        .priority(Priority.CRITICAL)
                        .affectedPopulation(18500)
                        .location("Hoshangabad, Madhya Pradesh")
                        .lat(22.7526).lng(77.7274)
                        .requiredResources(List.of("Water", "Food", "Medical"))
                        .startedAt(Instant.now().minus(3, ChronoUnit.DAYS))
                        .description("Heavy rainfall has caused the Narmada river near Hoshangabad to breach embankments, displacing residents across several low-lying blocks.")
                        .build(),
                Disaster.builder()
                        .name("Betul Hillside Landslide")
                        .type("Landslide")
                        .status(DisasterStatus.MONITORING)
                        .priority(Priority.HIGH)
                        .affectedPopulation(2200)
                        .location("Betul, Madhya Pradesh")
                        .lat(21.9022).lng(77.9008)
                        .requiredResources(List.of("Shelter Material", "Equipment"))
                        .startedAt(Instant.now().minus(9, ChronoUnit.DAYS))
                        .description("Continuous monsoon rain triggered a landslide on the slopes above Betul, blocking roads and threatening nearby homes.")
                        .build(),
                Disaster.builder()
                        .name("Chhindwara Extreme Heatwave")
                        .type("Heatwave")
                        .status(DisasterStatus.CONTAINED)
                        .priority(Priority.MEDIUM)
                        .affectedPopulation(9400)
                        .location("Chhindwara, Madhya Pradesh")
                        .lat(22.0574).lng(78.9382)
                        .requiredResources(List.of("Water", "Medical"))
                        .startedAt(Instant.now().minus(20, ChronoUnit.DAYS))
                        .description("An extended heatwave strained water supplies and public health infrastructure across the Chhindwara region.")
                        .build()
        );
        return disasterRepository.saveAll(disasters);
    }

    // ------------------------------------------------------------- resources

    private List<DisasterResource> seedResources() {
        List<DisasterResource> resources = List.of(
                DisasterResource.builder()
                        .name("Drinking Water Cans (20L)")
                        .category("Water")
                        .quantity(1200)
                        .unit("cans")
                        .status(ResourceStatus.AVAILABLE)
                        .warehouse("Bhopal Central Depot")
                        .updatedAt(Instant.now())
                        .build(),
                DisasterResource.builder()
                        .name("Emergency Food Kits")
                        .category("Food")
                        .quantity(800)
                        .unit("kits")
                        .status(ResourceStatus.ALLOCATED)
                        .warehouse("Indore Regional Warehouse")
                        .updatedAt(Instant.now())
                        .build(),
                DisasterResource.builder()
                        .name("First Aid Kits")
                        .category("Medical")
                        .quantity(350)
                        .unit("kits")
                        .status(ResourceStatus.AVAILABLE)
                        .warehouse("Hoshangabad Forward Base")
                        .updatedAt(Instant.now())
                        .build()
        );
        return resourceRepository.saveAll(resources);
    }

    // -------------------------------------------------------------- shelters

    private void seedShelters(List<Disaster> disasters) {
        shelterRepository.saveAll(List.of(
                Shelter.builder()
                        .name("Hoshangabad Community Hall")
                        .location("Hoshangabad")
                        .capacity(600).occupancy(410)
                        .food("Adequate").water("Low").medical("Adequate")
                        .disaster(disasters.get(0))
                        .build(),
                Shelter.builder()
                        .name("Betul Government School")
                        .location("Betul")
                        .capacity(250).occupancy(90)
                        .food("Adequate").water("Adequate").medical("Low")
                        .disaster(disasters.get(1))
                        .build(),
                Shelter.builder()
                        .name("Chhindwara Municipal Complex")
                        .location("Chhindwara")
                        .capacity(400).occupancy(120)
                        .food("Adequate").water("Adequate").medical("Adequate")
                        .disaster(disasters.get(2))
                        .build()
        ));
    }

    // ----------------------------------------------------------------- teams

    private void seedTeams(List<Disaster> disasters) {
        teamRepository.saveAll(List.of(
                RescueTeam.builder()
                        .name("Alpha Response Unit")
                        .members(12)
                        .vehicle("4x4 Rescue Truck #1")
                        .status(TeamStatus.DEPLOYED)
                        .assignment(disasters.get(0))
                        .currentLocation("Hoshangabad Sector 2")
                        .leader("Insp. Devendra Chouhan")
                        .build(),
                RescueTeam.builder()
                        .name("Bravo Response Unit")
                        .members(8)
                        .vehicle("Mobile Medical Van #2")
                        .status(TeamStatus.STANDBY)
                        .assignment(null)
                        .currentLocation("Base Camp")
                        .leader("Dr. Kavita Menon")
                        .build(),
                RescueTeam.builder()
                        .name("Charlie Response Unit")
                        .members(10)
                        .vehicle("Fire Tender #3")
                        .status(TeamStatus.DEPLOYED)
                        .assignment(disasters.get(1))
                        .currentLocation("Betul Sector 1")
                        .leader("Capt. Arvind Nair")
                        .build()
        ));
    }

    // ------------------------------------------------------------ allocations

    private void seedAllocations(List<DisasterResource> resources, List<Disaster> disasters) {
        allocationRepository.saveAll(List.of(
                Allocation.builder()
                        .resource(resources.get(0)).disaster(disasters.get(0))
                        .quantity(300).status(AllocationStatus.IN_PROGRESS)
                        .requestedBy("Rohit Malhotra")
                        .requestedAt(Instant.now().minus(2, ChronoUnit.DAYS))
                        .build(),
                Allocation.builder()
                        .resource(resources.get(1)).disaster(disasters.get(0))
                        .quantity(150).status(AllocationStatus.PENDING)
                        .requestedBy("Devendra Chouhan")
                        .requestedAt(Instant.now().minus(1, ChronoUnit.DAYS))
                        .build(),
                Allocation.builder()
                        .resource(resources.get(2)).disaster(disasters.get(1))
                        .quantity(60).status(AllocationStatus.COMPLETED)
                        .requestedBy("Rohit Malhotra")
                        .requestedAt(Instant.now().minus(6, ChronoUnit.DAYS))
                        .completedAt(Instant.now().minus(5, ChronoUnit.DAYS))
                        .build()
        ));
    }

    // ----------------------------------------------------------------- alerts

    private void seedAlerts(List<Disaster> disasters) {
        alertRepository.saveAll(List.of(
                Alert.builder()
                        .title("Water level breach reported near Hoshangabad embankment")
                        .priority(Priority.CRITICAL).status(AlertStatus.OPEN)
                        .disaster(disasters.get(0))
                        .createdAt(Instant.now().minus(6, ChronoUnit.HOURS))
                        .description("Field teams have flagged rising water levels and are coordinating an evacuation with local authorities.")
                        .build(),
                Alert.builder()
                        .title("Road access blocked near Betul - rescue teams rerouting")
                        .priority(Priority.HIGH).status(AlertStatus.ACKNOWLEDGED)
                        .disaster(disasters.get(1))
                        .createdAt(Instant.now().minus(2, ChronoUnit.DAYS))
                        .description("A secondary slide has blocked the main access road; Charlie Response Unit is using an alternate route.")
                        .build(),
                Alert.builder()
                        .title("Heat advisory lifted for Chhindwara district")
                        .priority(Priority.LOW).status(AlertStatus.RESOLVED)
                        .disaster(disasters.get(2))
                        .createdAt(Instant.now().minus(18, ChronoUnit.DAYS))
                        .description("Temperatures have returned to seasonal norms; shelters are winding down heat-relief operations.")
                        .build()
        ));
    }

    // =====================================================================
    // ADDITIONAL DEMO DATA
    //
    // Everything below adds a larger batch of demo records on top of the
    // baseline set above. Each entity is looked up by its natural key
    // (name / title, or a resource+disaster+requester combination for
    // Allocation, which has no name field) before insert, so this is safe
    // to run on every application startup: already-seeded records are left
    // untouched and never duplicated, and nothing here touches users.
    // =====================================================================

    // ------------------------------------------------------- add: disasters

    private List<Disaster> seedAdditionalDisasters() {
        List<Disaster> toSeed = List.of(
                Disaster.builder()
                        .name("Sagar Riverbank Flooding")
                        .type("Flood")
                        .status(DisasterStatus.ACTIVE)
                        .priority(Priority.HIGH)
                        .affectedPopulation(12300)
                        .location("Sagar, Madhya Pradesh")
                        .lat(23.8388).lng(78.7378)
                        .requiredResources(List.of("Water", "Food", "Shelter Material"))
                        .startedAt(Instant.now().minus(2, ChronoUnit.DAYS))
                        .description("Sustained heavy rain has swollen the Beas river past its banks near Sagar, cutting off several riverside colonies.")
                        .build(),
                Disaster.builder()
                        .name("Indore Industrial Complex Fire")
                        .type("Industrial Fire")
                        .status(DisasterStatus.MONITORING)
                        .priority(Priority.HIGH)
                        .affectedPopulation(1800)
                        .location("Indore, Madhya Pradesh")
                        .lat(22.7196).lng(75.8577)
                        .requiredResources(List.of("Equipment", "Medical"))
                        .startedAt(Instant.now().minus(5, ChronoUnit.DAYS))
                        .description("A chemical storage fire at an industrial estate on the city outskirts sent smoke over nearby residential blocks, prompting a partial evacuation.")
                        .build(),
                Disaster.builder()
                        .name("Jabalpur Earthquake Aftermath")
                        .type("Earthquake")
                        .status(DisasterStatus.ACTIVE)
                        .priority(Priority.CRITICAL)
                        .affectedPopulation(26700)
                        .location("Jabalpur, Madhya Pradesh")
                        .lat(23.1815).lng(79.9864)
                        .requiredResources(List.of("Shelter Material", "Medical", "Equipment"))
                        .startedAt(Instant.now().minus(1, ChronoUnit.DAYS))
                        .description("A moderate earthquake damaged several older buildings in the old city area; structural assessments and search-and-rescue operations are ongoing.")
                        .build(),
                Disaster.builder()
                        .name("Ratlam Drought Crisis")
                        .type("Drought")
                        .status(DisasterStatus.MONITORING)
                        .priority(Priority.MEDIUM)
                        .affectedPopulation(15400)
                        .location("Ratlam, Madhya Pradesh")
                        .lat(23.3315).lng(75.0367)
                        .requiredResources(List.of("Water"))
                        .startedAt(Instant.now().minus(45, ChronoUnit.DAYS))
                        .description("Below-average monsoon rainfall has left reservoirs at critically low levels across Ratlam district, straining rural drinking-water supplies.")
                        .build(),
                Disaster.builder()
                        .name("Gwalior Cold Wave")
                        .type("Cold Wave")
                        .status(DisasterStatus.CONTAINED)
                        .priority(Priority.LOW)
                        .affectedPopulation(6200)
                        .location("Gwalior, Madhya Pradesh")
                        .lat(26.2183).lng(78.1828)
                        .requiredResources(List.of("Shelter Material", "Medical"))
                        .startedAt(Instant.now().minus(30, ChronoUnit.DAYS))
                        .description("A prolonged cold spell drove night shelters to near capacity across Gwalior, with health camps set up for exposure-related cases.")
                        .build(),
                Disaster.builder()
                        .name("Ujjain Flash Flooding")
                        .type("Flood")
                        .status(DisasterStatus.ACTIVE)
                        .priority(Priority.HIGH)
                        .affectedPopulation(8900)
                        .location("Ujjain, Madhya Pradesh")
                        .lat(23.1765).lng(75.7885)
                        .requiredResources(List.of("Water", "Food"))
                        .startedAt(Instant.now().minus(4, ChronoUnit.DAYS))
                        .description("Intense overnight rainfall overwhelmed urban drainage in low-lying wards of Ujjain, flooding homes and a stretch of the ring road.")
                        .build(),
                Disaster.builder()
                        .name("Rewa Dam Overflow")
                        .type("Flood")
                        .status(DisasterStatus.MONITORING)
                        .priority(Priority.CRITICAL)
                        .affectedPopulation(21000)
                        .location("Rewa, Madhya Pradesh")
                        .lat(24.5362).lng(81.3037)
                        .requiredResources(List.of("Shelter Material", "Food", "Equipment"))
                        .startedAt(Instant.now().minus(6, ChronoUnit.DAYS))
                        .description("Controlled release from an upstream dam after heavy inflows has raised downstream water levels, prompting precautionary evacuations near Rewa.")
                        .build(),
                Disaster.builder()
                        .name("Satna Chemical Spill")
                        .type("Industrial Accident")
                        .status(DisasterStatus.RESOLVED)
                        .priority(Priority.MEDIUM)
                        .affectedPopulation(950)
                        .location("Satna, Madhya Pradesh")
                        .lat(24.6005).lng(80.8322)
                        .requiredResources(List.of("Medical", "Equipment"))
                        .startedAt(Instant.now().minus(40, ChronoUnit.DAYS))
                        .description("A transport spill near a cement plant required a short road closure and air-quality monitoring; cleanup concluded without reported injuries.")
                        .build()
        );

        List<Disaster> result = new ArrayList<>();
        for (Disaster d : toSeed) {
            result.add(disasterRepository.findByName(d.getName())
                    .orElseGet(() -> disasterRepository.save(d)));
        }
        return result;
    }

    // ------------------------------------------------------- add: resources

    private List<DisasterResource> seedAdditionalResources() {
        List<DisasterResource> toSeed = List.of(
                DisasterResource.builder().name("Instant Noodle Cartons").category("Food").quantity(600).unit("cartons").status(ResourceStatus.AVAILABLE).warehouse("Sagar District Store").updatedAt(Instant.now()).build(),
                DisasterResource.builder().name("Water Purification Tablets").category("Water").quantity(50000).unit("tablets").status(ResourceStatus.AVAILABLE).warehouse("Bhopal Central Depot").updatedAt(Instant.now()).build(),
                DisasterResource.builder().name("Portable Water Tankers").category("Water").quantity(18).unit("tankers").status(ResourceStatus.IN_TRANSIT).warehouse("Ratlam Field Depot").updatedAt(Instant.now()).build(),
                DisasterResource.builder().name("Emergency Tents (6-person)").category("Shelter Material").quantity(420).unit("tents").status(ResourceStatus.AVAILABLE).warehouse("Jabalpur Forward Base").updatedAt(Instant.now()).build(),
                DisasterResource.builder().name("Wool Blankets").category("Shelter Material").quantity(2500).unit("pieces").status(ResourceStatus.ALLOCATED).warehouse("Gwalior Regional Warehouse").updatedAt(Instant.now()).build(),
                DisasterResource.builder().name("Tarpaulin Sheets").category("Shelter Material").quantity(900).unit("sheets").status(ResourceStatus.AVAILABLE).warehouse("Rewa Forward Base").updatedAt(Instant.now()).build(),
                DisasterResource.builder().name("Trauma Care Kits").category("Medical").quantity(180).unit("kits").status(ResourceStatus.AVAILABLE).warehouse("Jabalpur Forward Base").updatedAt(Instant.now()).build(),
                DisasterResource.builder().name("Oral Rehydration Salts").category("Medical").quantity(12000).unit("sachets").status(ResourceStatus.AVAILABLE).warehouse("Indore Regional Warehouse").updatedAt(Instant.now()).build(),
                DisasterResource.builder().name("Mobile Medical Units").category("Medical").quantity(6).unit("units").status(ResourceStatus.ALLOCATED).warehouse("Bhopal Central Depot").updatedAt(Instant.now()).build(),
                DisasterResource.builder().name("Diesel Generators (5kVA)").category("Equipment").quantity(35).unit("units").status(ResourceStatus.AVAILABLE).warehouse("Indore Regional Warehouse").updatedAt(Instant.now()).build(),
                DisasterResource.builder().name("Water Pumps").category("Equipment").quantity(60).unit("units").status(ResourceStatus.AVAILABLE).warehouse("Sagar District Store").updatedAt(Instant.now()).build(),
                DisasterResource.builder().name("Chainsaws").category("Equipment").quantity(24).unit("units").status(ResourceStatus.DEPLETED).warehouse("Satna District Store").updatedAt(Instant.now()).build(),
                DisasterResource.builder().name("Inflatable Rescue Boats").category("Equipment").quantity(15).unit("boats").status(ResourceStatus.IN_TRANSIT).warehouse("Rewa Forward Base").updatedAt(Instant.now()).build(),
                DisasterResource.builder().name("Diesel Fuel (Jerry Cans)").category("Fuel").quantity(3200).unit("liters").status(ResourceStatus.AVAILABLE).warehouse("Bhopal Central Depot").updatedAt(Instant.now()).build(),
                DisasterResource.builder().name("Satellite Phones").category("Communication").quantity(45).unit("units").status(ResourceStatus.AVAILABLE).warehouse("Jabalpur Forward Base").updatedAt(Instant.now()).build(),
                DisasterResource.builder().name("VHF Radio Sets").category("Communication").quantity(80).unit("units").status(ResourceStatus.ALLOCATED).warehouse("Indore Regional Warehouse").updatedAt(Instant.now()).build(),
                DisasterResource.builder().name("Cooked Meal Packets").category("Food").quantity(5000).unit("packets").status(ResourceStatus.AVAILABLE).warehouse("Ujjain District Store").updatedAt(Instant.now()).build()
        );

        List<DisasterResource> result = new ArrayList<>();
        for (DisasterResource r : toSeed) {
            result.add(resourceRepository.findByName(r.getName())
                    .orElseGet(() -> resourceRepository.save(r)));
        }
        return result;
    }

    // -------------------------------------------------------- add: shelters

    private void seedAdditionalShelters(List<Disaster> d) {
        List<Shelter> toSeed = List.of(
                Shelter.builder().name("Sagar District Sports Stadium").location("Sagar").capacity(800).occupancy(560).food("Adequate").water("Adequate").medical("Low").disaster(d.get(0)).build(),
                Shelter.builder().name("Indore Community Health Centre").location("Indore").capacity(150).occupancy(40).food("Adequate").water("Adequate").medical("Adequate").disaster(d.get(1)).build(),
                Shelter.builder().name("Jabalpur Railway Institute Hall").location("Jabalpur").capacity(900).occupancy(720).food("Low").water("Low").medical("Adequate").disaster(d.get(2)).build(),
                Shelter.builder().name("Ratlam Agricultural College Hostel").location("Ratlam").capacity(300).occupancy(110).food("Adequate").water("Low").medical("Adequate").disaster(d.get(3)).build(),
                Shelter.builder().name("Gwalior Night Shelter Complex").location("Gwalior").capacity(500).occupancy(380).food("Adequate").water("Adequate").medical("Low").disaster(d.get(4)).build(),
                Shelter.builder().name("Ujjain Ring Road Relief Camp").location("Ujjain").capacity(350).occupancy(210).food("Adequate").water("Adequate").medical("Adequate").disaster(d.get(5)).build(),
                Shelter.builder().name("Rewa Engineering College Campus").location("Rewa").capacity(1000).occupancy(640).food("Low").water("Adequate").medical("Low").disaster(d.get(6)).build(),
                Shelter.builder().name("Satna Municipal Guest House").location("Satna").capacity(120).occupancy(15).food("Adequate").water("Adequate").medical("Adequate").disaster(d.get(7)).build()
        );

        for (Shelter s : toSeed) {
            if (!shelterRepository.existsByName(s.getName())) {
                shelterRepository.save(s);
            }
        }
    }

    // ----------------------------------------------------------- add: teams

    private void seedAdditionalTeams(List<Disaster> d) {
        List<RescueTeam> toSeed = List.of(
                RescueTeam.builder().name("Delta Response Unit").members(11).vehicle("4x4 Rescue Truck #2").status(TeamStatus.DEPLOYED).assignment(d.get(0)).currentLocation("Sagar Sector 1").leader("Insp. Manoj Tiwari").build(),
                RescueTeam.builder().name("Echo Response Unit").members(9).vehicle("Hazmat Response Vehicle").status(TeamStatus.DEPLOYED).assignment(d.get(1)).currentLocation("Indore Industrial Estate").leader("Chief Sunil Bhargava").build(),
                RescueTeam.builder().name("Foxtrot Response Unit").members(14).vehicle("Heavy Search & Rescue Truck").status(TeamStatus.DEPLOYED).assignment(d.get(2)).currentLocation("Jabalpur Old City").leader("Capt. Neha Joshi").build(),
                RescueTeam.builder().name("Golf Response Unit").members(7).vehicle("Water Tanker Support Vehicle").status(TeamStatus.STANDBY).assignment(null).currentLocation("Base Camp").leader("Lt. Rajesh Pawar").build(),
                RescueTeam.builder().name("Hotel Response Unit").members(8).vehicle("Mobile Medical Van #3").status(TeamStatus.ON_DUTY).assignment(d.get(4)).currentLocation("Gwalior Central Camp").leader("Dr. Sanjana Iyer").build(),
                RescueTeam.builder().name("India Response Unit").members(10).vehicle("Amphibious Rescue Vehicle").status(TeamStatus.DEPLOYED).assignment(d.get(5)).currentLocation("Ujjain Ring Road").leader("Capt. Farhan Ali").build(),
                RescueTeam.builder().name("Juliet Response Unit").members(13).vehicle("Boat Rescue Trailer Unit").status(TeamStatus.DEPLOYED).assignment(d.get(6)).currentLocation("Rewa Riverside Camp").leader("Insp. Kavya Reddy").build(),
                RescueTeam.builder().name("Kilo Response Unit").members(6).vehicle("Field Support Van #4").status(TeamStatus.OFF_DUTY).assignment(null).currentLocation("Base Camp").leader("Lt. Aditya Sengupta").build()
        );

        for (RescueTeam t : toSeed) {
            if (!teamRepository.existsByName(t.getName())) {
                teamRepository.save(t);
            }
        }
    }

    // ------------------------------------------------------ add: allocations

    private void seedAdditionalAllocations(List<DisasterResource> r, List<Disaster> d) {
        List<Allocation> toSeed = List.of(
                Allocation.builder().resource(r.get(0)).disaster(d.get(0)).quantity(200).status(AllocationStatus.IN_PROGRESS).requestedBy("Manoj Tiwari").requestedAt(Instant.now().minus(1, ChronoUnit.DAYS)).build(),
                Allocation.builder().resource(r.get(3)).disaster(d.get(2)).quantity(150).status(AllocationStatus.APPROVED).requestedBy("Neha Joshi").requestedAt(Instant.now().minus(1, ChronoUnit.DAYS)).build(),
                Allocation.builder().resource(r.get(6)).disaster(d.get(2)).quantity(80).status(AllocationStatus.PENDING).requestedBy("Neha Joshi").requestedAt(Instant.now().minus(12, ChronoUnit.HOURS)).build(),
                Allocation.builder().resource(r.get(1)).disaster(d.get(3)).quantity(20000).status(AllocationStatus.COMPLETED).requestedBy("Rajesh Pawar").requestedAt(Instant.now().minus(20, ChronoUnit.DAYS)).completedAt(Instant.now().minus(18, ChronoUnit.DAYS)).build(),
                Allocation.builder().resource(r.get(5)).disaster(d.get(6)).quantity(300).status(AllocationStatus.IN_PROGRESS).requestedBy("Kavya Reddy").requestedAt(Instant.now().minus(3, ChronoUnit.DAYS)).build(),
                Allocation.builder().resource(r.get(12)).disaster(d.get(6)).quantity(8).status(AllocationStatus.PENDING).requestedBy("Kavya Reddy").requestedAt(Instant.now().minus(2, ChronoUnit.DAYS)).build(),
                Allocation.builder().resource(r.get(7)).disaster(d.get(7)).quantity(500).status(AllocationStatus.COMPLETED).requestedBy("Sunil Bhargava").requestedAt(Instant.now().minus(35, ChronoUnit.DAYS)).completedAt(Instant.now().minus(33, ChronoUnit.DAYS)).build()
        );

        for (Allocation a : toSeed) {
            boolean exists = allocationRepository.existsByDisaster_IdAndResource_IdAndRequestedBy(
                    a.getDisaster().getId(), a.getResource().getId(), a.getRequestedBy());
            if (!exists) {
                allocationRepository.save(a);
            }
        }
    }

    // ----------------------------------------------------------- add: alerts

    private void seedAdditionalAlerts(List<Disaster> d) {
        List<Alert> toSeed = List.of(
                Alert.builder().title("Riverbank colonies isolated near Sagar").priority(Priority.HIGH).status(AlertStatus.OPEN).disaster(d.get(0)).createdAt(Instant.now().minus(10, ChronoUnit.HOURS)).description("Delta Response Unit is coordinating boat evacuations for cut-off riverside colonies.").build(),
                Alert.builder().title("Smoke plume drifting toward residential blocks in Indore").priority(Priority.HIGH).status(AlertStatus.ACKNOWLEDGED).disaster(d.get(1)).createdAt(Instant.now().minus(4, ChronoUnit.DAYS)).description("Echo Response Unit and local fire services are containing the source while air-quality advisories remain in effect.").build(),
                Alert.builder().title("Aftershock risk flagged for Jabalpur old city").priority(Priority.CRITICAL).status(AlertStatus.OPEN).disaster(d.get(2)).createdAt(Instant.now().minus(6, ChronoUnit.HOURS)).description("Structural engineers have flagged several buildings as unsafe pending further aftershock assessment.").build(),
                Alert.builder().title("Reservoir levels critical across Ratlam district").priority(Priority.MEDIUM).status(AlertStatus.ACKNOWLEDGED).disaster(d.get(3)).createdAt(Instant.now().minus(10, ChronoUnit.DAYS)).description("Water tankers have been rerouted to the worst-affected rural blocks pending rainfall recovery.").build(),
                Alert.builder().title("Cold wave advisory downgraded for Gwalior").priority(Priority.LOW).status(AlertStatus.RESOLVED).disaster(d.get(4)).createdAt(Instant.now().minus(25, ChronoUnit.DAYS)).description("Night temperatures have moderated; shelter occupancy is being scaled back gradually.").build(),
                Alert.builder().title("Ring road flooding disrupts Ujjain traffic").priority(Priority.HIGH).status(AlertStatus.OPEN).disaster(d.get(5)).createdAt(Instant.now().minus(1, ChronoUnit.DAYS)).description("India Response Unit has diverted traffic while pumping operations continue along the ring road stretch.").build(),
                Alert.builder().title("Precautionary evacuation ordered downstream of Rewa dam").priority(Priority.CRITICAL).status(AlertStatus.ACKNOWLEDGED).disaster(d.get(6)).createdAt(Instant.now().minus(2, ChronoUnit.DAYS)).description("Juliet Response Unit is assisting district authorities with evacuation of low-lying villages downstream.").build(),
                Alert.builder().title("Satna spill site cleared after final air-quality check").priority(Priority.LOW).status(AlertStatus.RESOLVED).disaster(d.get(7)).createdAt(Instant.now().minus(38, ChronoUnit.DAYS)).description("Follow-up monitoring confirmed air and soil readings back within normal limits at the spill site.").build()
        );

        for (Alert a : toSeed) {
            if (!alertRepository.existsByTitle(a.getTitle())) {
                alertRepository.save(a);
            }
        }
    }
}
