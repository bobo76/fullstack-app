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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AppointmentService Tests")
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private AppointmentTypeRepository appointmentTypeRepository;

    @Mock
    private AppointmentWebSocketController webSocketController;

    @InjectMocks
    private AppointmentService appointmentService;

    private LocalDateTime now;
    private Appointment testAppointment;
    private AppointmentType testAppointmentType;

    @BeforeEach
    void setUp() {
        now = LocalDateTime.now();

        testAppointmentType = AppointmentType.builder()
                .id(1L)
                .name("Meeting")
                .color("#FF5733")
                .createdAt(now)
                .build();

        testAppointment = Appointment.builder()
                .id(1L)
                .title("Test Appointment")
                .description("Test Description")
                .startTime(now)
                .endTime(now.plusHours(1))
                .appointmentType(testAppointmentType)
                .reminderMinutes(15)
                .createdAt(now)
                .updatedAt(now)
                .build();
    }

    @Nested
    @DisplayName("getAllAppointments Tests")
    class GetAllAppointmentsTests {

        @Test
        @DisplayName("Should return all appointments")
        void shouldReturnAllAppointments() {
            // Arrange
            Appointment appointment2 = Appointment.builder()
                    .id(2L)
                    .title("Second Appointment")
                    .description("Second Description")
                    .startTime(now.plusDays(1))
                    .endTime(now.plusDays(1).plusHours(1))
                    .appointmentType(null)
                    .reminderMinutes(10)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();

            when(appointmentRepository.findAll()).thenReturn(Arrays.asList(testAppointment, appointment2));

            // Act
            List<AppointmentResponse> result = appointmentService.getAllAppointments();

            // Assert
            assertThat(result).hasSize(2);
            assertThat(result.get(0).id()).isEqualTo(1L);
            assertThat(result.get(0).title()).isEqualTo("Test Appointment");
            assertThat(result.get(1).id()).isEqualTo(2L);
            assertThat(result.get(1).appointmentType()).isNull();
            verify(appointmentRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Should return empty list when no appointments exist")
        void shouldReturnEmptyListWhenNoAppointments() {
            // Arrange
            when(appointmentRepository.findAll()).thenReturn(List.of());

            // Act
            List<AppointmentResponse> result = appointmentService.getAllAppointments();

            // Assert
            assertThat(result).isEmpty();
            verify(appointmentRepository, times(1)).findAll();
        }
    }

    @Nested
    @DisplayName("getAppointmentsByDateRange Tests")
    class GetAppointmentsByDateRangeTests {

        @Test
        @DisplayName("Should return appointments within date range")
        void shouldReturnAppointmentsWithinDateRange() {
            // Arrange
            LocalDateTime start = now.minusDays(1);
            LocalDateTime end = now.plusDays(1);

            when(appointmentRepository.findByDateRange(start, end))
                    .thenReturn(List.of(testAppointment));

            // Act
            List<AppointmentResponse> result = appointmentService.getAppointmentsByDateRange(start, end);

            // Assert
            assertThat(result).hasSize(1);
            assertThat(result.get(0).id()).isEqualTo(1L);
            verify(appointmentRepository, times(1)).findByDateRange(start, end);
        }

        @Test
        @DisplayName("Should return empty list when no appointments in range")
        void shouldReturnEmptyListWhenNoAppointmentsInRange() {
            // Arrange
            LocalDateTime start = now.plusDays(10);
            LocalDateTime end = now.plusDays(20);

            when(appointmentRepository.findByDateRange(start, end)).thenReturn(List.of());

            // Act
            List<AppointmentResponse> result = appointmentService.getAppointmentsByDateRange(start, end);

            // Assert
            assertThat(result).isEmpty();
            verify(appointmentRepository, times(1)).findByDateRange(start, end);
        }
    }

    @Nested
    @DisplayName("getAppointmentById Tests")
    class GetAppointmentByIdTests {

        @Test
        @DisplayName("Should return appointment when found")
        void shouldReturnAppointmentWhenFound() {
            // Arrange
            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));

            // Act
            AppointmentResponse result = appointmentService.getAppointmentById(1L);

            // Assert
            assertThat(result.id()).isEqualTo(1L);
            assertThat(result.title()).isEqualTo("Test Appointment");
            assertThat(result.description()).isEqualTo("Test Description");
            assertThat(result.startTime()).isEqualTo(now);
            assertThat(result.endTime()).isEqualTo(now.plusHours(1));
            assertThat(result.appointmentType()).isNotNull();
            assertThat(result.appointmentType().id()).isEqualTo(1L);
            assertThat(result.reminderMinutes()).isEqualTo(15);
            verify(appointmentRepository, times(1)).findById(1L);
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when appointment not found")
        void shouldThrowExceptionWhenAppointmentNotFound() {
            // Arrange
            when(appointmentRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> appointmentService.getAppointmentById(999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Appointment not found with id: 999");
            verify(appointmentRepository, times(1)).findById(999L);
        }
    }

    @Nested
    @DisplayName("createAppointment Tests")
    class CreateAppointmentTests {

        @Test
        @DisplayName("Should create appointment successfully with all fields")
        void shouldCreateAppointmentSuccessfully() {
            // Arrange
            AppointmentRequest request = new AppointmentRequest(
                    "New Appointment",
                    "New Description",
                    now,
                    now.plusHours(2),
                    1L,
                    10
            );

            when(appointmentTypeRepository.findById(1L)).thenReturn(Optional.of(testAppointmentType));
            when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

            // Act
            AppointmentResponse result = appointmentService.createAppointment(request);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(1L);
            verify(appointmentTypeRepository, times(1)).findById(1L);
            verify(appointmentRepository, times(1)).save(any(Appointment.class));
            verify(webSocketController, times(1)).broadcastAppointmentCreated(any(AppointmentResponse.class));
        }

        @Test
        @DisplayName("Should create appointment with default reminder minutes when not provided")
        void shouldCreateAppointmentWithDefaultReminderMinutes() {
            // Arrange
            AppointmentRequest request = new AppointmentRequest(
                    "New Appointment",
                    "New Description",
                    now,
                    now.plusHours(2),
                    null,
                    null
            );

            Appointment savedAppointment = Appointment.builder()
                    .id(1L)
                    .title("New Appointment")
                    .description("New Description")
                    .startTime(now)
                    .endTime(now.plusHours(2))
                    .appointmentType(null)
                    .reminderMinutes(15)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();

            when(appointmentRepository.save(any(Appointment.class))).thenReturn(savedAppointment);

            // Act
            AppointmentResponse result = appointmentService.createAppointment(request);

            // Assert
            assertThat(result.reminderMinutes()).isEqualTo(15);
            verify(appointmentRepository, times(1)).save(any(Appointment.class));
            verify(webSocketController, times(1)).broadcastAppointmentCreated(any(AppointmentResponse.class));
        }

        @Test
        @DisplayName("Should create appointment without appointment type")
        void shouldCreateAppointmentWithoutAppointmentType() {
            // Arrange
            AppointmentRequest request = new AppointmentRequest(
                    "New Appointment",
                    null,
                    now,
                    now.plusHours(1),
                    null,
                    15
            );

            Appointment savedAppointment = Appointment.builder()
                    .id(1L)
                    .title("New Appointment")
                    .description(null)
                    .startTime(now)
                    .endTime(now.plusHours(1))
                    .appointmentType(null)
                    .reminderMinutes(15)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();

            when(appointmentRepository.save(any(Appointment.class))).thenReturn(savedAppointment);

            // Act
            AppointmentResponse result = appointmentService.createAppointment(request);

            // Assert
            assertThat(result.appointmentType()).isNull();
            verify(appointmentTypeRepository, never()).findById(any());
            verify(appointmentRepository, times(1)).save(any(Appointment.class));
            verify(webSocketController, times(1)).broadcastAppointmentCreated(any(AppointmentResponse.class));
        }

        @Test
        @DisplayName("Should throw ValidationException when end time is before start time")
        void shouldThrowExceptionWhenEndTimeBeforeStartTime() {
            // Arrange
            AppointmentRequest request = new AppointmentRequest(
                    "New Appointment",
                    "Description",
                    now,
                    now.minusHours(1),
                    null,
                    15
            );

            // Act & Assert
            assertThatThrownBy(() -> appointmentService.createAppointment(request))
                    .isInstanceOf(ValidationException.class)
                    .hasMessage("End time must be after start time");
            verify(appointmentRepository, never()).save(any(Appointment.class));
            verify(webSocketController, never()).broadcastAppointmentCreated(any(AppointmentResponse.class));
        }

        @Test
        @DisplayName("Should throw ValidationException when end time equals start time")
        void shouldThrowExceptionWhenEndTimeEqualsStartTime() {
            // Arrange
            AppointmentRequest request = new AppointmentRequest(
                    "New Appointment",
                    "Description",
                    now,
                    now,
                    null,
                    15
            );

            // Act & Assert
            assertThatThrownBy(() -> appointmentService.createAppointment(request))
                    .isInstanceOf(ValidationException.class)
                    .hasMessage("End time must be after start time");
            verify(appointmentRepository, never()).save(any(Appointment.class));
            verify(webSocketController, never()).broadcastAppointmentCreated(any(AppointmentResponse.class));
        }

        @Test
        @DisplayName("Should throw ValidationException for invalid reminder minutes")
        void shouldThrowExceptionForInvalidReminderMinutes() {
            // Arrange
            AppointmentRequest request = new AppointmentRequest(
                    "New Appointment",
                    "Description",
                    now,
                    now.plusHours(1),
                    null,
                    20
            );

            // Act & Assert
            assertThatThrownBy(() -> appointmentService.createAppointment(request))
                    .isInstanceOf(ValidationException.class)
                    .hasMessage("Reminder minutes must be one of: 0, 5, 10, 15, 30");
            verify(appointmentRepository, never()).save(any(Appointment.class));
            verify(webSocketController, never()).broadcastAppointmentCreated(any(AppointmentResponse.class));
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when appointment type not found")
        void shouldThrowExceptionWhenAppointmentTypeNotFound() {
            // Arrange
            AppointmentRequest request = new AppointmentRequest(
                    "New Appointment",
                    "Description",
                    now,
                    now.plusHours(1),
                    999L,
                    15
            );

            when(appointmentTypeRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> appointmentService.createAppointment(request))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Appointment type not found with id: 999");
            verify(appointmentRepository, never()).save(any(Appointment.class));
            verify(webSocketController, never()).broadcastAppointmentCreated(any(AppointmentResponse.class));
        }

        @Test
        @DisplayName("Should accept all valid reminder minutes values")
        void shouldAcceptAllValidReminderMinutes() {
            // Arrange & Act & Assert
            List<Integer> validValues = Arrays.asList(0, 5, 10, 15, 30);

            for (Integer reminderMinutes : validValues) {
                AppointmentRequest request = new AppointmentRequest(
                        "New Appointment",
                        "Description",
                        now,
                        now.plusHours(1),
                        null,
                        reminderMinutes
                );

                Appointment savedAppointment = Appointment.builder()
                        .id(1L)
                        .title("New Appointment")
                        .description("Description")
                        .startTime(now)
                        .endTime(now.plusHours(1))
                        .appointmentType(null)
                        .reminderMinutes(reminderMinutes)
                        .createdAt(now)
                        .updatedAt(now)
                        .build();

                when(appointmentRepository.save(any(Appointment.class))).thenReturn(savedAppointment);

                AppointmentResponse result = appointmentService.createAppointment(request);
                assertThat(result.reminderMinutes()).isEqualTo(reminderMinutes);
            }
        }
    }

    @Nested
    @DisplayName("updateAppointment Tests")
    class UpdateAppointmentTests {

        @Test
        @DisplayName("Should update appointment title")
        void shouldUpdateAppointmentTitle() {
            // Arrange
            AppointmentPatchRequest request = new AppointmentPatchRequest(
                    "Updated Title",
                    null,
                    null,
                    null,
                    null,
                    null
            );

            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));
            when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

            // Act
            AppointmentResponse result = appointmentService.updateAppointment(1L, request);

            // Assert
            assertThat(result).isNotNull();
            verify(appointmentRepository, times(1)).findById(1L);
            verify(appointmentRepository, times(1)).save(any(Appointment.class));
            verify(webSocketController, times(1)).broadcastAppointmentUpdated(any(AppointmentResponse.class));
        }

        @Test
        @DisplayName("Should throw ValidationException when title is blank")
        void shouldThrowExceptionWhenTitleIsBlank() {
            // Arrange
            AppointmentPatchRequest request = new AppointmentPatchRequest(
                    "   ",
                    null,
                    null,
                    null,
                    null,
                    null
            );

            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));

            // Act & Assert
            assertThatThrownBy(() -> appointmentService.updateAppointment(1L, request))
                    .isInstanceOf(ValidationException.class)
                    .hasMessage("Title cannot be blank");
            verify(appointmentRepository, never()).save(any(Appointment.class));
            verify(webSocketController, never()).broadcastAppointmentUpdated(any(AppointmentResponse.class));
        }

        @Test
        @DisplayName("Should update appointment description")
        void shouldUpdateAppointmentDescription() {
            // Arrange
            AppointmentPatchRequest request = new AppointmentPatchRequest(
                    null,
                    "Updated Description",
                    null,
                    null,
                    null,
                    null
            );

            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));
            when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

            // Act
            AppointmentResponse result = appointmentService.updateAppointment(1L, request);

            // Assert
            assertThat(result).isNotNull();
            verify(appointmentRepository, times(1)).save(any(Appointment.class));
            verify(webSocketController, times(1)).broadcastAppointmentUpdated(any(AppointmentResponse.class));
        }

        @Test
        @DisplayName("Should update appointment start and end time")
        void shouldUpdateAppointmentTimes() {
            // Arrange
            LocalDateTime newStartTime = now.plusDays(1);
            LocalDateTime newEndTime = now.plusDays(1).plusHours(2);

            AppointmentPatchRequest request = new AppointmentPatchRequest(
                    null,
                    null,
                    newStartTime,
                    newEndTime,
                    null,
                    null
            );

            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));
            when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

            // Act
            AppointmentResponse result = appointmentService.updateAppointment(1L, request);

            // Assert
            assertThat(result).isNotNull();
            verify(appointmentRepository, times(1)).save(any(Appointment.class));
            verify(webSocketController, times(1)).broadcastAppointmentUpdated(any(AppointmentResponse.class));
        }

        @Test
        @DisplayName("Should update only start time and validate with existing end time")
        void shouldUpdateOnlyStartTime() {
            // Arrange
            LocalDateTime newStartTime = now.minusMinutes(30);

            AppointmentPatchRequest request = new AppointmentPatchRequest(
                    null,
                    null,
                    newStartTime,
                    null,
                    null,
                    null
            );

            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));
            when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

            // Act
            AppointmentResponse result = appointmentService.updateAppointment(1L, request);

            // Assert
            assertThat(result).isNotNull();
            verify(appointmentRepository, times(1)).save(any(Appointment.class));
            verify(webSocketController, times(1)).broadcastAppointmentUpdated(any(AppointmentResponse.class));
        }

        @Test
        @DisplayName("Should update only end time and validate with existing start time")
        void shouldUpdateOnlyEndTime() {
            // Arrange
            LocalDateTime newEndTime = now.plusHours(3);

            AppointmentPatchRequest request = new AppointmentPatchRequest(
                    null,
                    null,
                    null,
                    newEndTime,
                    null,
                    null
            );

            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));
            when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

            // Act
            AppointmentResponse result = appointmentService.updateAppointment(1L, request);

            // Assert
            assertThat(result).isNotNull();
            verify(appointmentRepository, times(1)).save(any(Appointment.class));
            verify(webSocketController, times(1)).broadcastAppointmentUpdated(any(AppointmentResponse.class));
        }

        @Test
        @DisplayName("Should throw ValidationException when updated end time is before start time")
        void shouldThrowExceptionWhenUpdatedEndTimeBeforeStartTime() {
            // Arrange
            AppointmentPatchRequest request = new AppointmentPatchRequest(
                    null,
                    null,
                    null,
                    now.minusHours(1),
                    null,
                    null
            );

            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));

            // Act & Assert
            assertThatThrownBy(() -> appointmentService.updateAppointment(1L, request))
                    .isInstanceOf(ValidationException.class)
                    .hasMessage("End time must be after start time");
            verify(appointmentRepository, never()).save(any(Appointment.class));
            verify(webSocketController, never()).broadcastAppointmentUpdated(any(AppointmentResponse.class));
        }

        @Test
        @DisplayName("Should update appointment type")
        void shouldUpdateAppointmentType() {
            // Arrange
            AppointmentPatchRequest request = new AppointmentPatchRequest(
                    null,
                    null,
                    null,
                    null,
                    1L,
                    null
            );

            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));
            when(appointmentTypeRepository.findById(1L)).thenReturn(Optional.of(testAppointmentType));
            when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

            // Act
            AppointmentResponse result = appointmentService.updateAppointment(1L, request);

            // Assert
            assertThat(result).isNotNull();
            verify(appointmentTypeRepository, times(1)).findById(1L);
            verify(appointmentRepository, times(1)).save(any(Appointment.class));
            verify(webSocketController, times(1)).broadcastAppointmentUpdated(any(AppointmentResponse.class));
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when appointment type not found")
        void shouldThrowExceptionWhenAppointmentTypeNotFoundOnUpdate() {
            // Arrange
            AppointmentPatchRequest request = new AppointmentPatchRequest(
                    null,
                    null,
                    null,
                    null,
                    999L,
                    null
            );

            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));
            when(appointmentTypeRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> appointmentService.updateAppointment(1L, request))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Appointment type not found with id: 999");
            verify(appointmentRepository, never()).save(any(Appointment.class));
            verify(webSocketController, never()).broadcastAppointmentUpdated(any(AppointmentResponse.class));
        }

        @Test
        @DisplayName("Should update reminder minutes")
        void shouldUpdateReminderMinutes() {
            // Arrange
            AppointmentPatchRequest request = new AppointmentPatchRequest(
                    null,
                    null,
                    null,
                    null,
                    null,
                    30
            );

            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));
            when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

            // Act
            AppointmentResponse result = appointmentService.updateAppointment(1L, request);

            // Assert
            assertThat(result).isNotNull();
            verify(appointmentRepository, times(1)).save(any(Appointment.class));
            verify(webSocketController, times(1)).broadcastAppointmentUpdated(any(AppointmentResponse.class));
        }

        @Test
        @DisplayName("Should throw ValidationException for invalid reminder minutes on update")
        void shouldThrowExceptionForInvalidReminderMinutesOnUpdate() {
            // Arrange
            AppointmentPatchRequest request = new AppointmentPatchRequest(
                    null,
                    null,
                    null,
                    null,
                    null,
                    25
            );

            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));

            // Act & Assert
            assertThatThrownBy(() -> appointmentService.updateAppointment(1L, request))
                    .isInstanceOf(ValidationException.class)
                    .hasMessage("Reminder minutes must be one of: 0, 5, 10, 15, 30");
            verify(appointmentRepository, never()).save(any(Appointment.class));
            verify(webSocketController, never()).broadcastAppointmentUpdated(any(AppointmentResponse.class));
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when appointment not found for update")
        void shouldThrowExceptionWhenAppointmentNotFoundForUpdate() {
            // Arrange
            AppointmentPatchRequest request = new AppointmentPatchRequest(
                    "Updated Title",
                    null,
                    null,
                    null,
                    null,
                    null
            );

            when(appointmentRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> appointmentService.updateAppointment(999L, request))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Appointment not found with id: 999");
            verify(appointmentRepository, never()).save(any(Appointment.class));
            verify(webSocketController, never()).broadcastAppointmentUpdated(any(AppointmentResponse.class));
        }

        @Test
        @DisplayName("Should update multiple fields at once")
        void shouldUpdateMultipleFieldsAtOnce() {
            // Arrange
            AppointmentPatchRequest request = new AppointmentPatchRequest(
                    "Updated Title",
                    "Updated Description",
                    now.plusDays(1),
                    now.plusDays(1).plusHours(3),
                    1L,
                    30
            );

            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));
            when(appointmentTypeRepository.findById(1L)).thenReturn(Optional.of(testAppointmentType));
            when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

            // Act
            AppointmentResponse result = appointmentService.updateAppointment(1L, request);

            // Assert
            assertThat(result).isNotNull();
            verify(appointmentRepository, times(1)).save(any(Appointment.class));
            verify(webSocketController, times(1)).broadcastAppointmentUpdated(any(AppointmentResponse.class));
        }

        @Test
        @DisplayName("Should not update when all fields are null")
        void shouldNotUpdateWhenAllFieldsAreNull() {
            // Arrange
            AppointmentPatchRequest request = new AppointmentPatchRequest(
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
            );

            when(appointmentRepository.findById(1L)).thenReturn(Optional.of(testAppointment));
            when(appointmentRepository.save(any(Appointment.class))).thenReturn(testAppointment);

            // Act
            AppointmentResponse result = appointmentService.updateAppointment(1L, request);

            // Assert
            assertThat(result).isNotNull();
            verify(appointmentRepository, times(1)).save(any(Appointment.class));
            verify(webSocketController, times(1)).broadcastAppointmentUpdated(any(AppointmentResponse.class));
        }
    }

    @Nested
    @DisplayName("deleteAppointment Tests")
    class DeleteAppointmentTests {

        @Test
        @DisplayName("Should delete appointment successfully")
        void shouldDeleteAppointmentSuccessfully() {
            // Arrange
            when(appointmentRepository.existsById(1L)).thenReturn(true);
            doNothing().when(appointmentRepository).deleteById(1L);

            // Act
            appointmentService.deleteAppointment(1L);

            // Assert
            verify(appointmentRepository, times(1)).existsById(1L);
            verify(appointmentRepository, times(1)).deleteById(1L);
            verify(webSocketController, times(1)).broadcastAppointmentDeleted(1L);
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when appointment not found for delete")
        void shouldThrowExceptionWhenAppointmentNotFoundForDelete() {
            // Arrange
            when(appointmentRepository.existsById(999L)).thenReturn(false);

            // Act & Assert
            assertThatThrownBy(() -> appointmentService.deleteAppointment(999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Appointment not found with id: 999");
            verify(appointmentRepository, times(1)).existsById(999L);
            verify(appointmentRepository, never()).deleteById(any());
            verify(webSocketController, never()).broadcastAppointmentDeleted(any());
        }
    }
}
