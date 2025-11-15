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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AppointmentTypeService Tests")
class AppointmentTypeServiceTest {

    @Mock
    private AppointmentTypeRepository appointmentTypeRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @InjectMocks
    private AppointmentTypeService appointmentTypeService;

    private LocalDateTime now;
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
    }

    @Nested
    @DisplayName("getAllAppointmentTypes Tests")
    class GetAllAppointmentTypesTests {

        @Test
        @DisplayName("Should return all appointment types")
        void shouldReturnAllAppointmentTypes() {
            // Arrange
            AppointmentType type2 = AppointmentType.builder()
                    .id(2L)
                    .name("Call")
                    .color("#3498DB")
                    .createdAt(now)
                    .build();

            when(appointmentTypeRepository.findAll()).thenReturn(Arrays.asList(testAppointmentType, type2));

            // Act
            List<AppointmentTypeResponse> result = appointmentTypeService.getAllAppointmentTypes();

            // Assert
            assertThat(result).hasSize(2);
            assertThat(result.get(0).id()).isEqualTo(1L);
            assertThat(result.get(0).name()).isEqualTo("Meeting");
            assertThat(result.get(0).color()).isEqualTo("#FF5733");
            assertThat(result.get(1).id()).isEqualTo(2L);
            assertThat(result.get(1).name()).isEqualTo("Call");
            verify(appointmentTypeRepository, times(1)).findAll();
        }

        @Test
        @DisplayName("Should return empty list when no appointment types exist")
        void shouldReturnEmptyListWhenNoAppointmentTypes() {
            // Arrange
            when(appointmentTypeRepository.findAll()).thenReturn(List.of());

            // Act
            List<AppointmentTypeResponse> result = appointmentTypeService.getAllAppointmentTypes();

            // Assert
            assertThat(result).isEmpty();
            verify(appointmentTypeRepository, times(1)).findAll();
        }
    }

    @Nested
    @DisplayName("getAppointmentTypeById Tests")
    class GetAppointmentTypeByIdTests {

        @Test
        @DisplayName("Should return appointment type when found")
        void shouldReturnAppointmentTypeWhenFound() {
            // Arrange
            when(appointmentTypeRepository.findById(1L)).thenReturn(Optional.of(testAppointmentType));

            // Act
            AppointmentTypeResponse result = appointmentTypeService.getAppointmentTypeById(1L);

            // Assert
            assertThat(result.id()).isEqualTo(1L);
            assertThat(result.name()).isEqualTo("Meeting");
            assertThat(result.color()).isEqualTo("#FF5733");
            assertThat(result.createdAt()).isEqualTo(now);
            verify(appointmentTypeRepository, times(1)).findById(1L);
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when appointment type not found")
        void shouldThrowExceptionWhenAppointmentTypeNotFound() {
            // Arrange
            when(appointmentTypeRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> appointmentTypeService.getAppointmentTypeById(999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Appointment type not found with id: 999");
            verify(appointmentTypeRepository, times(1)).findById(999L);
        }
    }

    @Nested
    @DisplayName("createAppointmentType Tests")
    class CreateAppointmentTypeTests {

        @Test
        @DisplayName("Should create appointment type successfully")
        void shouldCreateAppointmentTypeSuccessfully() {
            // Arrange
            AppointmentTypeRequest request = new AppointmentTypeRequest(
                    "Conference",
                    "#2ECC71"
            );

            AppointmentType savedType = AppointmentType.builder()
                    .id(1L)
                    .name("Conference")
                    .color("#2ECC71")
                    .createdAt(now)
                    .build();

            when(appointmentTypeRepository.existsByName("Conference")).thenReturn(false);
            when(appointmentTypeRepository.save(any(AppointmentType.class))).thenReturn(savedType);

            // Act
            AppointmentTypeResponse result = appointmentTypeService.createAppointmentType(request);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(1L);
            assertThat(result.name()).isEqualTo("Conference");
            assertThat(result.color()).isEqualTo("#2ECC71");
            verify(appointmentTypeRepository, times(1)).existsByName("Conference");
            verify(appointmentTypeRepository, times(1)).save(any(AppointmentType.class));
        }

        @Test
        @DisplayName("Should throw ValidationException when name already exists")
        void shouldThrowExceptionWhenNameAlreadyExists() {
            // Arrange
            AppointmentTypeRequest request = new AppointmentTypeRequest(
                    "Meeting",
                    "#FF5733"
            );

            when(appointmentTypeRepository.existsByName("Meeting")).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> appointmentTypeService.createAppointmentType(request))
                    .isInstanceOf(ValidationException.class)
                    .hasMessage("Appointment type with name 'Meeting' already exists");
            verify(appointmentTypeRepository, times(1)).existsByName("Meeting");
            verify(appointmentTypeRepository, never()).save(any(AppointmentType.class));
        }

        @Test
        @DisplayName("Should create appointment type with different color for same name check")
        void shouldCreateAppointmentTypeWithDifferentName() {
            // Arrange
            AppointmentTypeRequest request = new AppointmentTypeRequest(
                    "Personal",
                    "#9B59B6"
            );

            AppointmentType savedType = AppointmentType.builder()
                    .id(2L)
                    .name("Personal")
                    .color("#9B59B6")
                    .createdAt(now)
                    .build();

            when(appointmentTypeRepository.existsByName("Personal")).thenReturn(false);
            when(appointmentTypeRepository.save(any(AppointmentType.class))).thenReturn(savedType);

            // Act
            AppointmentTypeResponse result = appointmentTypeService.createAppointmentType(request);

            // Assert
            assertThat(result).isNotNull();
            assertThat(result.name()).isEqualTo("Personal");
            verify(appointmentTypeRepository, times(1)).save(any(AppointmentType.class));
        }
    }

    @Nested
    @DisplayName("updateAppointmentType Tests")
    class UpdateAppointmentTypeTests {

        @Test
        @DisplayName("Should update appointment type name")
        void shouldUpdateAppointmentTypeName() {
            // Arrange
            AppointmentTypePatchRequest request = new AppointmentTypePatchRequest(
                    "Updated Meeting",
                    null
            );

            when(appointmentTypeRepository.findById(1L)).thenReturn(Optional.of(testAppointmentType));
            when(appointmentTypeRepository.existsByName("Updated Meeting")).thenReturn(false);
            when(appointmentTypeRepository.save(any(AppointmentType.class))).thenReturn(testAppointmentType);

            // Act
            AppointmentTypeResponse result = appointmentTypeService.updateAppointmentType(1L, request);

            // Assert
            assertThat(result).isNotNull();
            verify(appointmentTypeRepository, times(1)).findById(1L);
            verify(appointmentTypeRepository, times(1)).existsByName("Updated Meeting");
            verify(appointmentTypeRepository, times(1)).save(any(AppointmentType.class));
        }

        @Test
        @DisplayName("Should update appointment type color")
        void shouldUpdateAppointmentTypeColor() {
            // Arrange
            AppointmentTypePatchRequest request = new AppointmentTypePatchRequest(
                    null,
                    "#1ABC9C"
            );

            when(appointmentTypeRepository.findById(1L)).thenReturn(Optional.of(testAppointmentType));
            when(appointmentTypeRepository.save(any(AppointmentType.class))).thenReturn(testAppointmentType);

            // Act
            AppointmentTypeResponse result = appointmentTypeService.updateAppointmentType(1L, request);

            // Assert
            assertThat(result).isNotNull();
            verify(appointmentTypeRepository, times(1)).findById(1L);
            verify(appointmentTypeRepository, times(1)).save(any(AppointmentType.class));
        }

        @Test
        @DisplayName("Should update both name and color")
        void shouldUpdateBothNameAndColor() {
            // Arrange
            AppointmentTypePatchRequest request = new AppointmentTypePatchRequest(
                    "Workshop",
                    "#E74C3C"
            );

            when(appointmentTypeRepository.findById(1L)).thenReturn(Optional.of(testAppointmentType));
            when(appointmentTypeRepository.existsByName("Workshop")).thenReturn(false);
            when(appointmentTypeRepository.save(any(AppointmentType.class))).thenReturn(testAppointmentType);

            // Act
            AppointmentTypeResponse result = appointmentTypeService.updateAppointmentType(1L, request);

            // Assert
            assertThat(result).isNotNull();
            verify(appointmentTypeRepository, times(1)).save(any(AppointmentType.class));
        }

        @Test
        @DisplayName("Should allow updating to same name")
        void shouldAllowUpdatingToSameName() {
            // Arrange
            AppointmentTypePatchRequest request = new AppointmentTypePatchRequest(
                    "Meeting",
                    null
            );

            when(appointmentTypeRepository.findById(1L)).thenReturn(Optional.of(testAppointmentType));
            when(appointmentTypeRepository.save(any(AppointmentType.class))).thenReturn(testAppointmentType);

            // Act
            AppointmentTypeResponse result = appointmentTypeService.updateAppointmentType(1L, request);

            // Assert
            assertThat(result).isNotNull();
            verify(appointmentTypeRepository, times(1)).findById(1L);
            verify(appointmentTypeRepository, never()).existsByName(any());
            verify(appointmentTypeRepository, times(1)).save(any(AppointmentType.class));
        }

        @Test
        @DisplayName("Should throw ValidationException when new name already exists")
        void shouldThrowExceptionWhenNewNameAlreadyExists() {
            // Arrange
            AppointmentTypePatchRequest request = new AppointmentTypePatchRequest(
                    "Conference",
                    null
            );

            when(appointmentTypeRepository.findById(1L)).thenReturn(Optional.of(testAppointmentType));
            when(appointmentTypeRepository.existsByName("Conference")).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> appointmentTypeService.updateAppointmentType(1L, request))
                    .isInstanceOf(ValidationException.class)
                    .hasMessage("Appointment type with name 'Conference' already exists");
            verify(appointmentTypeRepository, times(1)).findById(1L);
            verify(appointmentTypeRepository, times(1)).existsByName("Conference");
            verify(appointmentTypeRepository, never()).save(any(AppointmentType.class));
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when appointment type not found")
        void shouldThrowExceptionWhenAppointmentTypeNotFoundForUpdate() {
            // Arrange
            AppointmentTypePatchRequest request = new AppointmentTypePatchRequest(
                    "Updated Name",
                    null
            );

            when(appointmentTypeRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> appointmentTypeService.updateAppointmentType(999L, request))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Appointment type not found with id: 999");
            verify(appointmentTypeRepository, times(1)).findById(999L);
            verify(appointmentTypeRepository, never()).save(any(AppointmentType.class));
        }

        @Test
        @DisplayName("Should not update when all fields are null")
        void shouldNotUpdateWhenAllFieldsAreNull() {
            // Arrange
            AppointmentTypePatchRequest request = new AppointmentTypePatchRequest(
                    null,
                    null
            );

            when(appointmentTypeRepository.findById(1L)).thenReturn(Optional.of(testAppointmentType));
            when(appointmentTypeRepository.save(any(AppointmentType.class))).thenReturn(testAppointmentType);

            // Act
            AppointmentTypeResponse result = appointmentTypeService.updateAppointmentType(1L, request);

            // Assert
            assertThat(result).isNotNull();
            verify(appointmentTypeRepository, times(1)).findById(1L);
            verify(appointmentTypeRepository, times(1)).save(any(AppointmentType.class));
        }
    }

    @Nested
    @DisplayName("deleteAppointmentType Tests")
    class DeleteAppointmentTypeTests {

        @Test
        @DisplayName("Should delete appointment type successfully")
        void shouldDeleteAppointmentTypeSuccessfully() {
            // Arrange
            when(appointmentTypeRepository.existsById(1L)).thenReturn(true);
            when(appointmentRepository.existsByAppointmentTypeId(1L)).thenReturn(false);
            doNothing().when(appointmentTypeRepository).deleteById(1L);

            // Act
            appointmentTypeService.deleteAppointmentType(1L);

            // Assert
            verify(appointmentTypeRepository, times(1)).existsById(1L);
            verify(appointmentRepository, times(1)).existsByAppointmentTypeId(1L);
            verify(appointmentTypeRepository, times(1)).deleteById(1L);
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when appointment type not found for delete")
        void shouldThrowExceptionWhenAppointmentTypeNotFoundForDelete() {
            // Arrange
            when(appointmentTypeRepository.existsById(999L)).thenReturn(false);

            // Act & Assert
            assertThatThrownBy(() -> appointmentTypeService.deleteAppointmentType(999L))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessage("Appointment type not found with id: 999");
            verify(appointmentTypeRepository, times(1)).existsById(999L);
            verify(appointmentRepository, never()).existsByAppointmentTypeId(any());
            verify(appointmentTypeRepository, never()).deleteById(any());
        }

        @Test
        @DisplayName("Should throw BusinessException when appointments exist with this type")
        void shouldThrowExceptionWhenAppointmentsExistWithType() {
            // Arrange
            when(appointmentTypeRepository.existsById(1L)).thenReturn(true);
            when(appointmentRepository.existsByAppointmentTypeId(1L)).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> appointmentTypeService.deleteAppointmentType(1L))
                    .isInstanceOf(BusinessException.class)
                    .hasMessage("Cannot delete appointment type with existing appointments");
            verify(appointmentTypeRepository, times(1)).existsById(1L);
            verify(appointmentRepository, times(1)).existsByAppointmentTypeId(1L);
            verify(appointmentTypeRepository, never()).deleteById(any());
        }

        @Test
        @DisplayName("Should check existence before checking for appointments")
        void shouldCheckExistenceBeforeCheckingForAppointments() {
            // Arrange
            when(appointmentTypeRepository.existsById(1L)).thenReturn(false);

            // Act & Assert
            assertThatThrownBy(() -> appointmentTypeService.deleteAppointmentType(1L))
                    .isInstanceOf(ResourceNotFoundException.class);
            verify(appointmentTypeRepository, times(1)).existsById(1L);
            verify(appointmentRepository, never()).existsByAppointmentTypeId(any());
        }
    }

    @Nested
    @DisplayName("Edge Cases and Business Logic Tests")
    class EdgeCasesTests {

        @Test
        @DisplayName("Should handle multiple appointment types with different names")
        void shouldHandleMultipleAppointmentTypesWithDifferentNames() {
            // Arrange
            AppointmentType type1 = AppointmentType.builder()
                    .id(1L)
                    .name("Meeting")
                    .color("#FF5733")
                    .createdAt(now)
                    .build();

            AppointmentType type2 = AppointmentType.builder()
                    .id(2L)
                    .name("Call")
                    .color("#3498DB")
                    .createdAt(now)
                    .build();

            AppointmentType type3 = AppointmentType.builder()
                    .id(3L)
                    .name("Conference")
                    .color("#2ECC71")
                    .createdAt(now)
                    .build();

            when(appointmentTypeRepository.findAll()).thenReturn(Arrays.asList(type1, type2, type3));

            // Act
            List<AppointmentTypeResponse> result = appointmentTypeService.getAllAppointmentTypes();

            // Assert
            assertThat(result).hasSize(3);
            assertThat(result.get(0).name()).isEqualTo("Meeting");
            assertThat(result.get(1).name()).isEqualTo("Call");
            assertThat(result.get(2).name()).isEqualTo("Conference");
        }

        @Test
        @DisplayName("Should preserve color case when creating appointment type")
        void shouldPreserveColorCaseWhenCreating() {
            // Arrange
            AppointmentTypeRequest request = new AppointmentTypeRequest(
                    "Test",
                    "#AbCdEf"
            );

            AppointmentType savedType = AppointmentType.builder()
                    .id(1L)
                    .name("Test")
                    .color("#AbCdEf")
                    .createdAt(now)
                    .build();

            when(appointmentTypeRepository.existsByName("Test")).thenReturn(false);
            when(appointmentTypeRepository.save(any(AppointmentType.class))).thenReturn(savedType);

            // Act
            AppointmentTypeResponse result = appointmentTypeService.createAppointmentType(request);

            // Assert
            assertThat(result.color()).isEqualTo("#AbCdEf");
        }

        @Test
        @DisplayName("Should handle update with only name change")
        void shouldHandleUpdateWithOnlyNameChange() {
            // Arrange
            AppointmentTypePatchRequest request = new AppointmentTypePatchRequest(
                    "New Name",
                    null
            );

            when(appointmentTypeRepository.findById(1L)).thenReturn(Optional.of(testAppointmentType));
            when(appointmentTypeRepository.existsByName("New Name")).thenReturn(false);
            when(appointmentTypeRepository.save(any(AppointmentType.class))).thenReturn(testAppointmentType);

            // Act
            AppointmentTypeResponse result = appointmentTypeService.updateAppointmentType(1L, request);

            // Assert
            assertThat(result).isNotNull();
            verify(appointmentTypeRepository, times(1)).existsByName("New Name");
        }

        @Test
        @DisplayName("Should handle update with only color change")
        void shouldHandleUpdateWithOnlyColorChange() {
            // Arrange
            AppointmentTypePatchRequest request = new AppointmentTypePatchRequest(
                    null,
                    "#000000"
            );

            when(appointmentTypeRepository.findById(1L)).thenReturn(Optional.of(testAppointmentType));
            when(appointmentTypeRepository.save(any(AppointmentType.class))).thenReturn(testAppointmentType);

            // Act
            AppointmentTypeResponse result = appointmentTypeService.updateAppointmentType(1L, request);

            // Assert
            assertThat(result).isNotNull();
            verify(appointmentTypeRepository, never()).existsByName(any());
        }
    }
}
