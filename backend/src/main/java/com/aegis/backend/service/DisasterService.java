package com.aegis.backend.service;

import com.aegis.backend.dto.request.DisasterRequest;
import com.aegis.backend.dto.request.DisasterUpdateRequest;
import com.aegis.backend.dto.response.DisasterResponse;
import com.aegis.backend.dto.response.PagedResponse;
import com.aegis.backend.entity.Disaster;
import com.aegis.backend.enums.DisasterStatus;
import com.aegis.backend.enums.Priority;
import com.aegis.backend.exception.ResourceNotFoundException;
import com.aegis.backend.mapper.DisasterMapper;
import com.aegis.backend.repository.DisasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class DisasterService {

    private final DisasterRepository disasterRepository;
    private final DisasterMapper disasterMapper;

    public PagedResponse<DisasterResponse> getDisasters(String status, String priority, String search) {
        Specification<Disaster> spec = Specification.where(null);

        if (StringUtils.hasText(status)) {
            DisasterStatus s = DisasterStatus.fromLabel(status);
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), s));
        }
        if (StringUtils.hasText(priority)) {
            Priority p = Priority.fromLabel(priority);
            spec = spec.and((root, query, cb) -> cb.equal(root.get("priority"), p));
        }
        if (StringUtils.hasText(search)) {
            String like = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("location")), like),
                    cb.like(cb.lower(root.get("type")), like)
            ));
        }

        List<Disaster> results = disasterRepository.findAll(spec);
        results.sort(Comparator.comparing(Disaster::getStartedAt, Comparator.nullsLast(Comparator.reverseOrder())));

        List<DisasterResponse> items = results.stream().map(disasterMapper::toResponse).toList();
        return PagedResponse.<DisasterResponse>builder().items(items).total(items.size()).build();
    }

    public DisasterResponse getById(String id) {
        Disaster disaster = disasterRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Disaster", id));
        return disasterMapper.toResponse(disaster);
    }

    @Transactional
    public DisasterResponse create(DisasterRequest request) {
        Disaster disaster = Disaster.builder()
                .name(request.getName())
                .type(request.getType())
                .status(StringUtils.hasText(request.getStatus()) ? DisasterStatus.fromLabel(request.getStatus()) : DisasterStatus.ACTIVE)
                .priority(StringUtils.hasText(request.getPriority()) ? Priority.fromLabel(request.getPriority()) : Priority.MEDIUM)
                .affectedPopulation(request.getAffectedPopulation())
                .location(request.getLocation())
                .lat(request.getLat())
                .lng(request.getLng())
                .requiredResources(request.getRequiredResources() != null ? new ArrayList<>(request.getRequiredResources()) : new ArrayList<>())
                .startedAt(request.getStartedAt() != null ? request.getStartedAt() : Instant.now())
                .description(request.getDescription())
                .build();

        disaster = disasterRepository.save(disaster);
        return disasterMapper.toResponse(disaster);
    }

    @Transactional
    public DisasterResponse update(String id, DisasterUpdateRequest request) {
        Disaster disaster = disasterRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Disaster", id));

        if (request.getName() != null) disaster.setName(request.getName());
        if (request.getType() != null) disaster.setType(request.getType());
        if (request.getStatus() != null) disaster.setStatus(DisasterStatus.fromLabel(request.getStatus()));
        if (request.getPriority() != null) disaster.setPriority(Priority.fromLabel(request.getPriority()));
        if (request.getAffectedPopulation() != null) disaster.setAffectedPopulation(request.getAffectedPopulation());
        if (request.getLocation() != null) disaster.setLocation(request.getLocation());
        if (request.getLat() != null) disaster.setLat(request.getLat());
        if (request.getLng() != null) disaster.setLng(request.getLng());
        if (request.getRequiredResources() != null) disaster.setRequiredResources(new ArrayList<>(request.getRequiredResources()));
        if (request.getStartedAt() != null) disaster.setStartedAt(request.getStartedAt());
        if (request.getDescription() != null) disaster.setDescription(request.getDescription());

        disaster = disasterRepository.save(disaster);
        return disasterMapper.toResponse(disaster);
    }

    @Transactional
    public void delete(String id) {
        if (!disasterRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Disaster", id);
        }
        disasterRepository.deleteById(id);
    }
}
