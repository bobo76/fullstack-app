package com.calendar.backend.repository;

import com.calendar.backend.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query("SELECT a FROM Appointment a WHERE a.startTime < :end AND a.endTime > :start ORDER BY a.startTime")
    List<Appointment> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.appointmentType.id = :typeId")
    boolean existsByAppointmentTypeId(@Param("typeId") Long typeId);
}
