package com.calendar.backend.controller;

import com.calendar.backend.dto.AppointmentTypePatchRequest;
import com.calendar.backend.dto.AppointmentTypeRequest;
import com.calendar.backend.dto.AppointmentTypeResponse;
import com.calendar.backend.service.AppointmentTypeService;
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
public class AppointmentTypeController {

    private final AppointmentTypeService appointmentTypeService;

    @GetMapping
    public ResponseEntity<List<AppointmentTypeResponse>> getAllAppointmentTypes() {
        log.debug("GET /api/appointment-types");
        List<AppointmentTypeResponse> types = appointmentTypeService.getAllAppointmentTypes();
        return ResponseEntity.ok(types);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentTypeResponse> getAppointmentTypeById(@PathVariable Long id) {
        log.debug("GET /api/appointment-types/{}", id);
        AppointmentTypeResponse type = appointmentTypeService.getAppointmentTypeById(id);
        return ResponseEntity.ok(type);
    }

    @PostMapping
    public ResponseEntity<AppointmentTypeResponse> createAppointmentType(@Valid @RequestBody AppointmentTypeRequest request) {
        log.debug("POST /api/appointment-types");
        AppointmentTypeResponse type = appointmentTypeService.createAppointmentType(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(type);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<AppointmentTypeResponse> updateAppointmentType(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentTypePatchRequest request) {
        log.debug("PATCH /api/appointment-types/{}", id);
        AppointmentTypeResponse type = appointmentTypeService.updateAppointmentType(id, request);
        return ResponseEntity.ok(type);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointmentType(@PathVariable Long id) {
        log.debug("DELETE /api/appointment-types/{}", id);
        appointmentTypeService.deleteAppointmentType(id);
        return ResponseEntity.noContent().build();
    }
}
