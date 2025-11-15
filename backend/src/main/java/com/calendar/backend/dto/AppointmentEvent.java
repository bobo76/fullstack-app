package com.calendar.backend.dto;

import java.time.LocalDateTime;

public record AppointmentEvent(
        EventType eventType,
        AppointmentResponse appointment,
        LocalDateTime timestamp
) {
    public enum EventType {
        CREATED,
        UPDATED,
        DELETED
    }

    public static AppointmentEvent created(AppointmentResponse appointment) {
        return new AppointmentEvent(EventType.CREATED, appointment, LocalDateTime.now());
    }

    public static AppointmentEvent updated(AppointmentResponse appointment) {
        return new AppointmentEvent(EventType.UPDATED, appointment, LocalDateTime.now());
    }

    public static AppointmentEvent deleted(AppointmentResponse appointment) {
        return new AppointmentEvent(EventType.DELETED, appointment, LocalDateTime.now());
    }
}
