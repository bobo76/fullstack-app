package com.calendar.backend.dto;

import java.time.LocalDateTime;

public record AppointmentPatchRequest(
        String title,
        String description,
        LocalDateTime startTime,
        LocalDateTime endTime,
        Long appointmentTypeId,
        Integer reminderMinutes
) {
}
