package com.calendar.backend.service;

import com.calendar.backend.model.AppointmentTitle;
import com.calendar.backend.repository.AppointmentTitleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing appointment title autocomplete and usage tracking.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentTitleService {

    private final AppointmentTitleRepository appointmentTitleRepository;
    private static final int AUTOCOMPLETE_LIMIT = 10;

    /**
     * Increments usage count for a title. Creates new entry if title doesn't exist.
     *
     * @param title the appointment title to track
     */
    @Transactional
    public void trackTitleUsage(String title) {
        if (title == null || title.isBlank()) {
            return;
        }

        log.debug("Tracking usage for title: {}", title);

        appointmentTitleRepository.findByTitle(title)
                .ifPresentOrElse(
                        existingTitle -> {
                            existingTitle.setUsageCount(existingTitle.getUsageCount() + 1);
                            appointmentTitleRepository.save(existingTitle);
                            log.debug("Incremented usage count for title: {} to {}", title, existingTitle.getUsageCount());
                        },
                        () -> {
                            AppointmentTitle newTitle = AppointmentTitle.builder()
                                    .title(title)
                                    .usageCount(1)
                                    .build();
                            appointmentTitleRepository.save(newTitle);
                            log.debug("Created new title entry: {}", title);
                        }
                );
    }

    /**
     * Searches for appointment titles matching the query.
     * Returns top 10 results ordered by usage count.
     *
     * @param query the search query (partial title)
     * @return list of matching titles (max 10), ordered by popularity
     */
    @Transactional(readOnly = true)
    public List<String> autocomplete(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        log.debug("Autocomplete search for: {}", query);

        return appointmentTitleRepository.findByTitleContainingOrderByUsageCount(query)
                .stream()
                .limit(AUTOCOMPLETE_LIMIT)
                .map(AppointmentTitle::getTitle)
                .collect(Collectors.toList());
    }
}
