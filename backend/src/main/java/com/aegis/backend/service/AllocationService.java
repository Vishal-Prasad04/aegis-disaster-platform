package com.aegis.backend.service;

import com.aegis.backend.dto.request.AssignResourceRequest;
import com.aegis.backend.dto.response.AllocationResponse;
import com.aegis.backend.dto.response.PagedResponse;
import com.aegis.backend.entity.Allocation;
import com.aegis.backend.entity.Disaster;
import com.aegis.backend.entity.DisasterResource;
import com.aegis.backend.enums.AllocationStatus;
import com.aegis.backend.enums.ResourceStatus;
import com.aegis.backend.exception.ConflictException;
import com.aegis.backend.exception.ResourceNotFoundException;
import com.aegis.backend.mapper.AllocationMapper;
import com.aegis.backend.repository.AllocationRepository;
import com.aegis.backend.repository.DisasterRepository;
import com.aegis.backend.repository.DisasterResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AllocationService {

    private final AllocationRepository allocationRepository;
    private final DisasterResourceRepository resourceRepository;
    private final DisasterRepository disasterRepository;
    private final AllocationMapper allocationMapper;

    public PagedResponse<AllocationResponse> getAllocations(String status, String disasterId) {
        List<Allocation> results;

        if (StringUtils.hasText(disasterId) && StringUtils.hasText(status)) {
            AllocationStatus s = AllocationStatus.fromLabel(status);
            results = allocationRepository.findByDisaster_IdAndStatusIn(disasterId, List.of(s));
        } else if (StringUtils.hasText(disasterId)) {
            results = allocationRepository.findByDisaster_Id(disasterId);
        } else if (StringUtils.hasText(status)) {
            AllocationStatus s = AllocationStatus.fromLabel(status);
            results = allocationRepository.findByStatus(s);
        } else {
            results = allocationRepository.findAll();
        }

        List<AllocationResponse> items = results.stream().map(allocationMapper::toResponse).toList();
        return PagedResponse.<AllocationResponse>builder().items(items).total(items.size()).build();
    }

    public PagedResponse<AllocationResponse> getHistory(String disasterId) {
        List<AllocationStatus> terminal = List.of(AllocationStatus.COMPLETED, AllocationStatus.REJECTED);
        List<Allocation> results = StringUtils.hasText(disasterId)
                ? allocationRepository.findByDisaster_IdAndStatusIn(disasterId, terminal)
                : allocationRepository.findByStatusIn(terminal);

        List<AllocationResponse> items = results.stream().map(allocationMapper::toResponse).toList();
        return PagedResponse.<AllocationResponse>builder().items(items).total(items.size()).build();
    }

    @Transactional
    public AllocationResponse assign(AssignResourceRequest request) {
        DisasterResource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> ResourceNotFoundException.of("Resource", request.getResourceId()));
        Disaster disaster = disasterRepository.findById(request.getDisasterId())
                .orElseThrow(() -> ResourceNotFoundException.of("Disaster", request.getDisasterId()));

        if (request.getQuantity() > resource.getQuantity()) {
            throw new ConflictException("Requested quantity (" + request.getQuantity() +
                    ") exceeds available stock (" + resource.getQuantity() + ") for " + resource.getName());
        }

        resource.setQuantity(resource.getQuantity() - request.getQuantity());
        if (resource.getQuantity() == 0) {
            resource.setStatus(ResourceStatus.DEPLETED);
        } else {
            resource.setStatus(ResourceStatus.ALLOCATED);
        }
        resource.setUpdatedAt(Instant.now());
        resourceRepository.save(resource);

        Allocation allocation = Allocation.builder()
                .resource(resource)
                .disaster(disaster)
                .quantity(request.getQuantity())
                .status(AllocationStatus.PENDING)
                .requestedBy(request.getRequestedBy())
                .requestedAt(Instant.now())
                .build();

        allocation = allocationRepository.save(allocation);
        return allocationMapper.toResponse(allocation);
    }

    @Transactional
    public AllocationResponse updateStatus(String id, String status) {
        Allocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Allocation", id));

        AllocationStatus newStatus = AllocationStatus.fromLabel(status);
        allocation.setStatus(newStatus);

        if (newStatus == AllocationStatus.COMPLETED) {
            allocation.setCompletedAt(Instant.now());
        }

        if (newStatus == AllocationStatus.REJECTED) {
            // Return stock back to the resource pool
            DisasterResource resource = allocation.getResource();
            resource.setQuantity(resource.getQuantity() + allocation.getQuantity());
            resource.setStatus(ResourceStatus.AVAILABLE);
            resource.setUpdatedAt(Instant.now());
            resourceRepository.save(resource);
            allocation.setCompletedAt(Instant.now());
        }

        allocation = allocationRepository.save(allocation);
        return allocationMapper.toResponse(allocation);
    }
}
