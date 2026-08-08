package com.aegis.backend.service;

import com.aegis.backend.dto.request.ResourceRequest;
import com.aegis.backend.dto.request.ResourceUpdateRequest;
import com.aegis.backend.dto.response.PagedResponse;
import com.aegis.backend.dto.response.ResourceResponse;
import com.aegis.backend.entity.DisasterResource;
import com.aegis.backend.enums.ResourceStatus;
import com.aegis.backend.exception.ResourceNotFoundException;
import com.aegis.backend.mapper.ResourceMapper;
import com.aegis.backend.repository.DisasterResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final DisasterResourceRepository resourceRepository;
    private final ResourceMapper resourceMapper;

    public PagedResponse<ResourceResponse> getResources(String search, String category, String status) {
        Specification<DisasterResource> spec = Specification.where(null);

        if (StringUtils.hasText(category)) {
            spec = spec.and((root, query, cb) -> cb.equal(cb.lower(root.get("category")), category.toLowerCase()));
        }
        if (StringUtils.hasText(status)) {
            ResourceStatus s = ResourceStatus.fromLabel(status);
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), s));
        }
        if (StringUtils.hasText(search)) {
            String like = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), like),
                    cb.like(cb.lower(root.get("warehouse")), like)
            ));
        }

        List<DisasterResource> results = resourceRepository.findAll(spec);
        List<ResourceResponse> items = results.stream().map(resourceMapper::toResponse).toList();
        return PagedResponse.<ResourceResponse>builder().items(items).total(items.size()).build();
    }

    public ResourceResponse getById(String id) {
        DisasterResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Resource", id));
        return resourceMapper.toResponse(resource);
    }

    @Transactional
    public ResourceResponse create(ResourceRequest request) {
        DisasterResource resource = DisasterResource.builder()
                .name(request.getName())
                .category(request.getCategory())
                .quantity(request.getQuantity())
                .unit(request.getUnit())
                .status(StringUtils.hasText(request.getStatus()) ? ResourceStatus.fromLabel(request.getStatus()) : ResourceStatus.AVAILABLE)
                .warehouse(request.getWarehouse())
                .updatedAt(Instant.now())
                .build();
        resource = resourceRepository.save(resource);
        return resourceMapper.toResponse(resource);
    }

    @Transactional
    public ResourceResponse update(String id, ResourceUpdateRequest request) {
        DisasterResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Resource", id));

        if (request.getName() != null) resource.setName(request.getName());
        if (request.getCategory() != null) resource.setCategory(request.getCategory());
        if (request.getQuantity() != null) resource.setQuantity(request.getQuantity());
        if (request.getUnit() != null) resource.setUnit(request.getUnit());
        if (request.getStatus() != null) resource.setStatus(ResourceStatus.fromLabel(request.getStatus()));
        if (request.getWarehouse() != null) resource.setWarehouse(request.getWarehouse());
        resource.setUpdatedAt(Instant.now());

        resource = resourceRepository.save(resource);
        return resourceMapper.toResponse(resource);
    }

    @Transactional
    public void delete(String id) {
        if (!resourceRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Resource", id);
        }
        resourceRepository.deleteById(id);
    }
}
