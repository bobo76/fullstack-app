package com.calendar.backend.dto;

import jakarta.validation.constraints.Pattern;

public record AppointmentTypePatchRequest(
        String name,

        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color must be a valid hex code (e.g., #FF5733)")
        String color
) {
}
