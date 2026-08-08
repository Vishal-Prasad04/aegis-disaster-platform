package com.aegis.backend.service;

import com.aegis.backend.dto.request.ShelterRequest;
import com.aegis.backend.dto.request.ShelterUpdateRequest;
import com.aegis.backend.dto.response.PagedResponse;
import com.aegis.backend.dto.response.ShelterResponse;
import com.aegis.backend.entity.Disaster;
import com.aegis.backend.entity.Shelter;
import com.aegis.backend.exception.ResourceNotFoundException;
import com.aegis.backend.mapper.ShelterMapper;
import com.aegis.backend.repository.DisasterRepository;
import com.aegis.backend.repository.ShelterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ShelterService {

    private final ShelterRepository shelterRepository;
    private final DisasterRepository disasterRepository;
    private final ShelterMapper shelterMapper;

    public PagedResponse<ShelterResponse> getShelters(String disasterId) {
        List<Shelter> results = StringUtils.hasText(disasterId)
                ? shelterRepository.findByDisaster_Id(disasterId)
                : shelterRepository.findAll();

        List<ShelterResponse> items = results.stream().map(shelterMapper::toResponse).toList();
        return PagedResponse.<ShelterResponse>builder().items(items).total(items.size()).build();
    }

    public ShelterResponse getById(String id) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Shelter", id));
        return shelterMapper.toResponse(shelter);
    }

    @Transactional
    public ShelterResponse create(ShelterRequest request) {
        Disaster disaster = resolveDisaster(request.getDisasterId());

        Shelter shelter = Shelter.builder()
                .name(request.getName())
                .location(request.getLocation())
                .capacity(request.getCapacity())
                .occupancy(request.getOccupancy())
                .food(StringUtils.hasText(request.getFood()) ? request.getFood() : "Adequate")
                .water(StringUtils.hasText(request.getWater()) ? request.getWater() : "Adequate")
                .medical(StringUtils.hasText(request.getMedical()) ? request.getMedical() : "Adequate")
                .disaster(disaster)
                .build();

        shelter = shelterRepository.save(shelter);
        return shelterMapper.toResponse(shelter);
    }

    @Transactional
    public ShelterResponse update(String id, ShelterUpdateRequest request) {
        Shelter shelter = shelterRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Shelter", id));

        if (request.getName() != null) shelter.setName(request.getName());
        if (request.getLocation() != null) shelter.setLocation(request.getLocation());
        if (request.getCapacity() != null) shelter.setCapacity(request.getCapacity());
        if (request.getOccupancy() != null) shelter.setOccupancy(request.getOccupancy());
        if (request.getFood() != null) shelter.setFood(request.getFood());
        if (request.getWater() != null) shelter.setWater(request.getWater());
        if (request.getMedical() != null) shelter.setMedical(request.getMedical());
        if (request.getDisasterId() != null) shelter.setDisaster(resolveDisaster(request.getDisasterId()));

        shelter = shelterRepository.save(shelter);
        return shelterMapper.toResponse(shelter);
    }

    @Transactional
    public void delete(String id) {
        if (!shelterRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Shelter", id);
        }
        shelterRepository.deleteById(id);
    }

    private Disaster resolveDisaster(String disasterId) {
        if (!StringUtils.hasText(disasterId)) return null;
        return disasterRepository.findById(disasterId)
                .orElseThrow(() -> ResourceNotFoundException.of("Disaster", disasterId));
    }
}
