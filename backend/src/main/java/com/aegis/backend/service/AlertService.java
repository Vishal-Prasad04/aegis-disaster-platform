package com.aegis.backend.service;

import com.aegis.backend.dto.request.AlertRequest;
import com.aegis.backend.dto.response.AlertResponse;
import com.aegis.backend.dto.response.PagedResponse;
import com.aegis.backend.entity.Alert;
import com.aegis.backend.entity.Disaster;
import com.aegis.backend.enums.AlertStatus;
import com.aegis.backend.enums.Priority;
import com.aegis.backend.exception.ResourceNotFoundException;
import com.aegis.backend.mapper.AlertMapper;
import com.aegis.backend.repository.AlertRepository;
import com.aegis.backend.repository.DisasterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository alertRepository;
    private final DisasterRepository disasterRepository;
    private final AlertMapper alertMapper;

    public PagedResponse<AlertResponse> getAlerts(String status, String priority) {
        Specification<Alert> spec = Specification.where(null);

        if (StringUtils.hasText(status)) {
            AlertStatus s = AlertStatus.fromLabel(status);
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), s));
        }
        if (StringUtils.hasText(priority)) {
            Priority p = Priority.fromLabel(priority);
            spec = spec.and((root, query, cb) -> cb.equal(root.get("priority"), p));
        }

        List<Alert> results = alertRepository.findAll(spec);
        results.sort(Comparator.comparing(Alert::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())));

        List<AlertResponse> items = results.stream().map(alertMapper::toResponse).toList();
        return PagedResponse.<AlertResponse>builder().items(items).total(items.size()).build();
    }

    @Transactional
    public AlertResponse create(AlertRequest request) {
        Disaster disaster = resolveDisaster(request.getDisasterId());

        Alert alert = Alert.builder()
                .title(request.getTitle())
                .priority(Priority.fromLabel(request.getPriority()))
                .status(AlertStatus.OPEN)
                .disaster(disaster)
                .createdAt(Instant.now())
                .description(request.getDescription())
                .build();

        alert = alertRepository.save(alert);
        return alertMapper.toResponse(alert);
    }

    @Transactional
    public AlertResponse updateStatus(String id, String status) {
        Alert alert = alertRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Alert", id));
        alert.setStatus(AlertStatus.fromLabel(status));
        alert = alertRepository.save(alert);
        return alertMapper.toResponse(alert);
    }

    @Transactional
    public void delete(String id) {
        if (!alertRepository.existsById(id)) {
            throw ResourceNotFoundException.of("Alert", id);
        }
        alertRepository.deleteById(id);
    }

    private Disaster resolveDisaster(String disasterId) {
        if (!StringUtils.hasText(disasterId)) return null;
        return disasterRepository.findById(disasterId)
                .orElseThrow(() -> ResourceNotFoundException.of("Disaster", disasterId));
    }
}
