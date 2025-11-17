package com.calendar.backend.controller;

import com.calendar.backend.dto.AppointmentTypePatchRequest;
import com.calendar.backend.dto.AppointmentTypeRequest;
import com.calendar.backend.dto.AppointmentTypeResponse;
import com.calendar.backend.service.AppointmentTypeService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for appointment type management.
 * Provides CRUD endpoints for managing appointment categories and their colors.
 */
@RestController
@RequestMapping("/api/appointment-types")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Appointment Types", description = "APIs for managing appointment types and categories")
public class AppointmentTypeController {

    private final AppointmentTypeService appointmentTypeService;

    @Operation(summary = "Get all appointment types", description = "Retrieve all available appointment types")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved appointment types",
                    content = @Content(schema = @Schema(implementation = AppointmentTypeResponse.class)))
    })
    @GetMapping
    public ResponseEntity<List<AppointmentTypeResponse>> getAllAppointmentTypes() {
        log.debug("GET /api/appointment-types");
        List<AppointmentTypeResponse> types = appointmentTypeService.getAllAppointmentTypes();
        return ResponseEntity.ok(types);
    }

    @Operation(summary = "Get appointment type by ID", description = "Retrieve a specific appointment type by its ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully retrieved appointment type",
                    content = @Content(schema = @Schema(implementation = AppointmentTypeResponse.class))),
            @ApiResponse(responseCode = "404", description = "Appointment type not found", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentTypeResponse> getAppointmentTypeById(
            @Parameter(description = "Appointment type ID") @PathVariable Long id) {
        log.debug("GET /api/appointment-types/{}", id);
        AppointmentTypeResponse type = appointmentTypeService.getAppointmentTypeById(id);
        return ResponseEntity.ok(type);
    }

    @Operation(summary = "Create appointment type", description = "Create a new appointment type")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Appointment type created successfully",
                    content = @Content(schema = @Schema(implementation = AppointmentTypeResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request data", content = @Content)
    })
    @PostMapping
    public ResponseEntity<AppointmentTypeResponse> createAppointmentType(
            @Parameter(description = "Appointment type data") @Valid @RequestBody AppointmentTypeRequest request) {
        log.debug("POST /api/appointment-types");
        AppointmentTypeResponse type = appointmentTypeService.createAppointmentType(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(type);
    }

    @Operation(summary = "Update appointment type", description = "Partially update an existing appointment type")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Appointment type updated successfully",
                    content = @Content(schema = @Schema(implementation = AppointmentTypeResponse.class))),
            @ApiResponse(responseCode = "404", description = "Appointment type not found", content = @Content),
            @ApiResponse(responseCode = "400", description = "Invalid request data", content = @Content)
    })
    @PatchMapping("/{id}")
    public ResponseEntity<AppointmentTypeResponse> updateAppointmentType(
            @Parameter(description = "Appointment type ID") @PathVariable Long id,
            @Parameter(description = "Fields to update") @Valid @RequestBody AppointmentTypePatchRequest request) {
        log.debug("PATCH /api/appointment-types/{}", id);
        AppointmentTypeResponse type = appointmentTypeService.updateAppointmentType(id, request);
        return ResponseEntity.ok(type);
    }

    @Operation(summary = "Delete appointment type", description = "Delete an appointment type by ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Appointment type deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Appointment type not found", content = @Content)
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointmentType(
            @Parameter(description = "Appointment type ID") @PathVariable Long id) {
        log.debug("DELETE /api/appointment-types/{}", id);
        appointmentTypeService.deleteAppointmentType(id);
        return ResponseEntity.noContent().build();
    }
}
