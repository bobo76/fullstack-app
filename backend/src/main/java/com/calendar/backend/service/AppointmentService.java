package com.calendar.backend.service;

import com.calendar.backend.dto.AppointmentPatchRequest;
import com.calendar.backend.dto.AppointmentRequest;
import com.calendar.backend.dto.AppointmentResponse;
import com.calendar.backend.exception.ResourceNotFoundException;
import com.calendar.backend.exception.ValidationException;
import com.calendar.backend.model.Appointment;
import com.calendar.backend.model.AppointmentType;
import com.calendar.backend.repository.AppointmentRepository;
import com.calendar.backend.repository.AppointmentTypeRepository;
import com.calendar.backend.websocket.AppointmentWebSocketController;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service layer for managing appointments.
 * Handles business logic, validation, and WebSocket broadcasting for appointment operations.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentTypeRepository appointmentTypeRepository;
    private final AppointmentWebSocketController webSocketController;

    private static final Set<Integer> VALID_REMINDER_MINUTES = Set.of(0, 5, 10, 15, 30);
    private static final Integer DEFAULT_REMINDER_MINUTES = 15;

    /**
     * Retrieves all appointments in the system.
     *
     * @return list of all appointments
     */
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAllAppointments() {
        log.debug("Fetching all appointments");
        return appointmentRepository.findAll()
                .stream()
                .map(AppointmentResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves appointments within a specified date range.
     *
     * @param start start of the date range (inclusive)
     * @param end end of the date range (inclusive)
     * @return list of appointments in the specified range
     */
    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByDateRange(LocalDateTime start, LocalDateTime end) {
        log.debug("Fetching appointments between {} and {}", start, end);
        return appointmentRepository.findByDateRange(start, end)
                .stream()
                .map(AppointmentResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single appointment by its ID.
     *
     * @param id the appointment ID
     * @return the appointment
     * @throws ResourceNotFoundException if appointment not found
     */
    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(Long id) {
        log.debug("Fetching appointment with id: {}", id);
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        return AppointmentResponse.from(appointment);
    }

    /**
     * Creates a new appointment and broadcasts the change via WebSocket.
     *
     * @param request the appointment creation request
     * @return the created appointment
     * @throws ValidationException if validation fails (time range, reminder minutes)
     * @throws ResourceNotFoundException if appointment type not found
     */
    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        log.debug("Creating appointment with title: {}", request.title());

        validateAppointmentTimes(request.startTime(), request.endTime());

        Integer reminderMinutes = request.reminderMinutes() != null ? request.reminderMinutes() : DEFAULT_REMINDER_MINUTES;
        validateReminderMinutes(reminderMinutes);

        AppointmentType appointmentType = null;
        if (request.appointmentTypeId() != null) {
            appointmentType = appointmentTypeRepository.findById(request.appointmentTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment type not found with id: " + request.appointmentTypeId()));
        }

        Appointment appointment = Appointment.builder()
                .title(request.title())
                .description(request.description())
                .startTime(request.startTime())
                .endTime(request.endTime())
                .appointmentType(appointmentType)
                .reminderMinutes(reminderMinutes)
                .build();

        Appointment savedAppointment = appointmentRepository.save(appointment);
        log.info("Created appointment with id: {}", savedAppointment.getId());

        AppointmentResponse response = AppointmentResponse.from(savedAppointment);
        webSocketController.broadcastAppointmentCreated(response);

        return response;
    }

    /**
     * Partially updates an appointment and broadcasts the change via WebSocket.
     * Only non-null fields in the request will be updated.
     *
     * @param id the appointment ID
     * @param request the partial update request
     * @return the updated appointment
     * @throws ResourceNotFoundException if appointment not found
     * @throws ValidationException if validation fails
     */
    @Transactional
    public AppointmentResponse updateAppointment(Long id, AppointmentPatchRequest request) {
        log.debug("Updating appointment with id: {}", id);

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));

        if (request.title() != null) {
            if (request.title().isBlank()) {
                throw new ValidationException("Title cannot be blank");
            }
            appointment.setTitle(request.title());
        }

        if (request.description() != null) {
            appointment.setDescription(request.description());
        }

        LocalDateTime newStartTime = request.startTime() != null ? request.startTime() : appointment.getStartTime();
        LocalDateTime newEndTime = request.endTime() != null ? request.endTime() : appointment.getEndTime();

        if (request.startTime() != null || request.endTime() != null) {
            validateAppointmentTimes(newStartTime, newEndTime);
            appointment.setStartTime(newStartTime);
            appointment.setEndTime(newEndTime);
        }

        if (request.appointmentTypeId() != null) {
            AppointmentType appointmentType = appointmentTypeRepository.findById(request.appointmentTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Appointment type not found with id: " + request.appointmentTypeId()));
            appointment.setAppointmentType(appointmentType);
        }

        if (request.reminderMinutes() != null) {
            validateReminderMinutes(request.reminderMinutes());
            appointment.setReminderMinutes(request.reminderMinutes());
        }

        Appointment updatedAppointment = appointmentRepository.save(appointment);
        log.info("Updated appointment with id: {}", updatedAppointment.getId());

        AppointmentResponse response = AppointmentResponse.from(updatedAppointment);
        webSocketController.broadcastAppointmentUpdated(response);

        return response;
    }

    /**
     * Deletes an appointment by ID and broadcasts the change via WebSocket.
     *
     * @param id the appointment ID
     * @throws ResourceNotFoundException if appointment not found
     */
    @Transactional
    public void deleteAppointment(Long id) {
        log.debug("Deleting appointment with id: {}", id);

        if (!appointmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Appointment not found with id: " + id);
        }

        appointmentRepository.deleteById(id);
        log.info("Deleted appointment with id: {}", id);

        webSocketController.broadcastAppointmentDeleted(id);
    }

    private void validateAppointmentTimes(LocalDateTime startTime, LocalDateTime endTime) {
        if (endTime.isBefore(startTime) || endTime.isEqual(startTime)) {
            throw new ValidationException("End time must be after start time");
        }
    }

    private void validateReminderMinutes(Integer reminderMinutes) {
        if (!VALID_REMINDER_MINUTES.contains(reminderMinutes)) {
            throw new ValidationException("Reminder minutes must be one of: 0, 5, 10, 15, 30");
        }
    }
}
