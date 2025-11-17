package com.calendar.backend.repository;

import com.calendar.backend.model.AppointmentTitle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentTitleRepository extends JpaRepository<AppointmentTitle, Long> {

    Optional<AppointmentTitle> findByTitle(String title);

    @Query("SELECT at FROM AppointmentTitle at WHERE LOWER(at.title) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY at.usageCount DESC, at.lastUsedAt DESC")
    List<AppointmentTitle> findByTitleContainingOrderByUsageCount(@Param("query") String query);
}
