package com.calendar.backend.config;

import com.calendar.backend.model.Appointment;
import com.calendar.backend.model.AppointmentType;
import com.calendar.backend.repository.AppointmentRepository;
import com.calendar.backend.repository.AppointmentTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final AppointmentTypeRepository appointmentTypeRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    public void run(String... args) {
        loadDefaultAppointmentTypes();
        loadSampleAppointments();
    }

    private void loadDefaultAppointmentTypes() {
        if (appointmentTypeRepository.count() == 0) {
            log.info("Loading default appointment types...");

            List<AppointmentType> defaultTypes = Arrays.asList(
                    AppointmentType.builder()
                            .name("Personal")
                            .color("#3B82F6")
                            .build(),
                    AppointmentType.builder()
                            .name("Professional")
                            .color("#8B5CF6")
                            .build(),
                    AppointmentType.builder()
                            .name("Vacation")
                            .color("#10B981")
                            .build(),
                    AppointmentType.builder()
                            .name("Medical")
                            .color("#EF4444")
                            .build(),
                    AppointmentType.builder()
                            .name("Meeting")
                            .color("#F59E0B")
                            .build(),
                    AppointmentType.builder()
                            .name("Other")
                            .color("#6B7280")
                            .build()
            );

            appointmentTypeRepository.saveAll(defaultTypes);
            log.info("Successfully loaded {} default appointment types", defaultTypes.size());
        } else {
            log.info("Appointment types already exist, skipping default data load");
        }
    }

    private void loadSampleAppointments() {
        if (appointmentRepository.count() == 0) {
            log.info("Loading sample appointments...");

            // Get appointment types for sample data
            AppointmentType personalType = appointmentTypeRepository.findAll().stream()
                    .filter(type -> "Personal".equals(type.getName()))
                    .findFirst()
                    .orElse(null);

            AppointmentType professionalType = appointmentTypeRepository.findAll().stream()
                    .filter(type -> "Professional".equals(type.getName()))
                    .findFirst()
                    .orElse(null);

            // Appointment 1: Today at 10:00 AM
            LocalDateTime todayAt10AM = LocalDateTime.of(LocalDate.now(), LocalTime.of(10, 0));
            Appointment appointment1 = Appointment.builder()
                    .title("Coffee with Sarah - Catch up on life adventures")
                    .description("Meeting at the cozy corner cafe downtown. Sarah promised to share stories from her recent trip to Iceland and I need to hear about those Northern Lights!")
                    .startTime(todayAt10AM)
                    .endTime(todayAt10AM.plusHours(1))
                    .appointmentType(personalType)
                    .reminderMinutes(15)
                    .build();

            // Appointment 2: Tomorrow at 14:00 (2:00 PM)
            LocalDateTime tomorrowAt2PM = LocalDateTime.of(LocalDate.now().plusDays(1), LocalTime.of(14, 0));
            Appointment appointment2 = Appointment.builder()
                    .title("Q4 Strategy Planning Session")
                    .description("Important team meeting to discuss upcoming product launches, market expansion, and resource allocation. Come prepared with your departmental goals and budget proposals.")
                    .startTime(tomorrowAt2PM)
                    .endTime(tomorrowAt2PM.plusHours(2))
                    .appointmentType(professionalType)
                    .reminderMinutes(30)
                    .build();

            appointmentRepository.saveAll(Arrays.asList(appointment1, appointment2));
            log.info("Successfully loaded 2 sample appointments");
        } else {
            log.info("Appointments already exist, skipping sample data load");
        }
    }
}
