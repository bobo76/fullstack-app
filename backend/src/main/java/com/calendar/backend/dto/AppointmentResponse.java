package com.calendar.backend.dto;

import com.calendar.backend.model.Appointment;

import java.time.LocalDateTime;

public record AppointmentResponse(
        Long id,
        String title,
        String description,
        LocalDateTime startTime,
        LocalDateTime endTime,
        AppointmentTypeResponse appointmentType,
        Integer reminderMinutes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static AppointmentResponse from(Appointment appointment) {
        return new AppointmentResponse(
                appointment.getId(),
                appointment.getTitle(),
                appointment.getDescription(),
                appointment.getStartTime(),
                appointment.getEndTime(),
                appointment.getAppointmentType() != null
                        ? AppointmentTypeResponse.from(appointment.getAppointmentType())
                        : null,
                appointment.getReminderMinutes(),
                appointment.getCreatedAt(),
                appointment.getUpdatedAt()
        );
    }
}
