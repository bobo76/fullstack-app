package com.calendar.backend.controller;

import com.calendar.backend.dto.AppointmentPatchRequest;
import com.calendar.backend.dto.AppointmentRequest;
import com.calendar.backend.dto.AppointmentResponse;
import com.calendar.backend.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * REST controller for appointment management.
 * Provides CRUD endpoints for appointments with date range filtering.
 */
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Appointments", description = "APIs for managing calendar appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final com.calendar.backend.service.AppointmentTitleService appointmentTitleService;

    @Operation(summary = "Get all appointments", description = "Retrieve all appointments or filter by date range")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved appointments",
                    content = @Content(schema = @Schema(implementation = AppointmentResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> getAppointments(
            @Parameter(description = "Start date/time for filtering (ISO 8601 format)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @Parameter(description = "End date/time for filtering (ISO 8601 format)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        log.debug("GET /api/appointments?start={}&end={}", start, end);

        List<AppointmentResponse> appointments;
        if (start != null && end != null) {
            appointments = appointmentService.getAppointmentsByDateRange(start, end);
        } else {
            appointments = appointmentService.getAllAppointments();
        }

        return ResponseEntity.ok(appointments);
    }

    @Operation(summary = "Get appointment by ID", description = "Retrieve a specific appointment by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved appointment",
                    content = @Content(schema = @Schema(implementation = AppointmentResponse.class))),
            @ApiResponse(responseCode = "404", description = "Appointment not found", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentResponse> getAppointmentById(
            @Parameter(description = "Appointment ID") @PathVariable Long id) {
        log.debug("GET /api/appointments/{}", id);
        AppointmentResponse appointment = appointmentService.getAppointmentById(id);
        return ResponseEntity.ok(appointment);
    }

    @Operation(summary = "Create appointment", description = "Create a new appointment")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Appointment created successfully",
                    content = @Content(schema = @Schema(implementation = AppointmentResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request data", content = @Content)
    })
    @PostMapping
    public ResponseEntity<AppointmentResponse> createAppointment(
            @Parameter(description = "Appointment data") @Valid @RequestBody AppointmentRequest request) {
        log.debug("POST /api/appointments");
        AppointmentResponse appointment = appointmentService.createAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(appointment);
    }

    @Operation(summary = "Update appointment", description = "Partially update an existing appointment")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Appointment updated successfully",
                    content = @Content(schema = @Schema(implementation = AppointmentResponse.class))),
            @ApiResponse(responseCode = "404", description = "Appointment not found", content = @Content),
            @ApiResponse(responseCode = "400", description = "Invalid request data", content = @Content)
    })
    @PatchMapping("/{id}")
    public ResponseEntity<AppointmentResponse> updateAppointment(
            @Parameter(description = "Appointment ID") @PathVariable Long id,
            @Parameter(description = "Fields to update") @Valid @RequestBody AppointmentPatchRequest request) {
        log.debug("PATCH /api/appointments/{}", id);
        AppointmentResponse appointment = appointmentService.updateAppointment(id, request);
        return ResponseEntity.ok(appointment);
    }

    @Operation(summary = "Delete appointment", description = "Delete an appointment by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Appointment deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Appointment not found", content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(
            @Parameter(description = "Appointment ID") @PathVariable Long id) {
        log.debug("DELETE /api/appointments/{}", id);
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Autocomplete appointment titles", description = "Search for appointment titles matching the query, ordered by usage frequency")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved matching titles",
                    content = @Content(schema = @Schema(implementation = String.class)))
    })

    @GetMapping("/autocomplete")
    public ResponseEntity<List<String>> titleAutoComplete(
            @Parameter(description = "Search query (partial title)") @RequestParam String query) {
        log.debug("GET /api/appointments/autocomplete?query={}", query);
        List<String> suggestions = appointmentTitleService.autocomplete(query);
        return ResponseEntity.ok(suggestions);
    }
}
