package com.calendar.backend.service;

import com.calendar.backend.dto.AppointmentTypePatchRequest;
import com.calendar.backend.dto.AppointmentTypeRequest;
import com.calendar.backend.dto.AppointmentTypeResponse;
import com.calendar.backend.exception.BusinessException;
import com.calendar.backend.exception.ResourceNotFoundException;
import com.calendar.backend.exception.ValidationException;
import com.calendar.backend.model.AppointmentType;
import com.calendar.backend.repository.AppointmentRepository;
import com.calendar.backend.repository.AppointmentTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service layer for managing appointment types.
 * Handles business logic, validation, and prevents deletion of types with existing appointments.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentTypeService {

    private final AppointmentTypeRepository appointmentTypeRepository;
    private final AppointmentRepository appointmentRepository;

    /**
     * Retrieves all appointment types in the system.
     *
     * @return list of all appointment types
     */
    @Transactional(readOnly = true)
    public List<AppointmentTypeResponse> getAllAppointmentTypes() {
        log.debug("Fetching all appointment types");
        return appointmentTypeRepository.findAll()
                .stream()
                .map(AppointmentTypeResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single appointment type by its ID.
     *
     * @param id the appointment type ID
     * @return the appointment type
     * @throws ResourceNotFoundException if appointment type not found
     */
    @Transactional(readOnly = true)
    public AppointmentTypeResponse getAppointmentTypeById(Long id) {
        log.debug("Fetching appointment type with id: {}", id);
        AppointmentType type = appointmentTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment type not found with id: " + id));
        return AppointmentTypeResponse.from(type);
    }

    /**
     * Creates a new appointment type.
     *
     * @param request the appointment type creation request
     * @return the created appointment type
     * @throws ValidationException if a type with the same name already exists
     */
    @Transactional
    public AppointmentTypeResponse createAppointmentType(AppointmentTypeRequest request) {
        log.debug("Creating appointment type with name: {}", request.name());

        if (appointmentTypeRepository.existsByName(request.name())) {
            throw new ValidationException("Appointment type with name '" + request.name() + "' already exists");
        }

        AppointmentType type = AppointmentType.builder()
                .name(request.name())
                .color(request.color())
                .build();

        AppointmentType savedType = appointmentTypeRepository.save(type);
        log.info("Created appointment type with id: {}", savedType.getId());
        return AppointmentTypeResponse.from(savedType);
    }

    /**
     * Partially updates an appointment type.
     * Only non-null fields in the request will be updated.
     *
     * @param id the appointment type ID
     * @param request the partial update request
     * @return the updated appointment type
     * @throws ResourceNotFoundException if appointment type not found
     * @throws ValidationException if name already exists
     */
    @Transactional
    public AppointmentTypeResponse updateAppointmentType(Long id, AppointmentTypePatchRequest request) {
        log.debug("Updating appointment type with id: {}", id);

        AppointmentType type = appointmentTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment type not found with id: " + id));

        if (request.name() != null) {
            if (!request.name().equals(type.getName()) && appointmentTypeRepository.existsByName(request.name())) {
                throw new ValidationException("Appointment type with name '" + request.name() + "' already exists");
            }
            type.setName(request.name());
        }

        if (request.color() != null) {
            type.setColor(request.color());
        }

        AppointmentType updatedType = appointmentTypeRepository.save(type);
        log.info("Updated appointment type with id: {}", updatedType.getId());
        return AppointmentTypeResponse.from(updatedType);
    }

    /**
     * Deletes an appointment type by ID.
     * Prevents deletion if any appointments are associated with this type.
     *
     * @param id the appointment type ID
     * @throws ResourceNotFoundException if appointment type not found
     * @throws BusinessException if appointments exist with this type
     */
    @Transactional
    public void deleteAppointmentType(Long id) {
        log.debug("Deleting appointment type with id: {}", id);

        if (!appointmentTypeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Appointment type not found with id: " + id);
        }

        if (appointmentRepository.existsByAppointmentTypeId(id)) {
            throw new BusinessException("Cannot delete appointment type with existing appointments");
        }

        appointmentTypeRepository.deleteById(id);
        log.info("Deleted appointment type with id: {}", id);
    }
}
