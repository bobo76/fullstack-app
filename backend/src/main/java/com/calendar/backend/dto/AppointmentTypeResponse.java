package com.calendar.backend.dto;

import com.calendar.backend.model.AppointmentType;

import java.time.LocalDateTime;

public record AppointmentTypeResponse(
        Long id,
        String name,
        String color,
        LocalDateTime createdAt
) {
    public static AppointmentTypeResponse from(AppointmentType type) {
        return new AppointmentTypeResponse(
                type.getId(),
                type.getName(),
                type.getColor(),
                type.getCreatedAt()
        );
    }
}
