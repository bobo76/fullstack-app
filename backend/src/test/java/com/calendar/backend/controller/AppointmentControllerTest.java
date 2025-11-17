package com.calendar.backend.controller;

import com.calendar.backend.service.AppointmentTitleService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AppointmentController.class)
@DisplayName("AppointmentController Tests")
class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private com.calendar.backend.service.AppointmentService appointmentService;

    @MockBean
    private AppointmentTitleService appointmentTitleService;

    @Nested
    @DisplayName("titleAutoComplete Tests")
    class TitleAutoCompleteTests {

        @Test
        @DisplayName("Should return matching title suggestions")
        void shouldReturnMatchingTitleSuggestions() throws Exception {
            // Arrange
            String query = "meet";
            List<String> suggestions = Arrays.asList("Meeting with client", "Meeting with team", "Meet and greet");
            when(appointmentTitleService.autocomplete(query)).thenReturn(suggestions);

            // Act & Assert
            mockMvc.perform(get("/api/appointments/autocomplete")
                            .param("query", query))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(3))
                    .andExpect(jsonPath("$[0]").value("Meeting with client"))
                    .andExpect(jsonPath("$[1]").value("Meeting with team"))
                    .andExpect(jsonPath("$[2]").value("Meet and greet"));

            verify(appointmentTitleService, times(1)).autocomplete(query);
        }

        @Test
        @DisplayName("Should return empty list when no matches found")
        void shouldReturnEmptyListWhenNoMatchesFound() throws Exception {
            // Arrange
            String query = "xyz";
            when(appointmentTitleService.autocomplete(query)).thenReturn(List.of());

            // Act & Assert
            mockMvc.perform(get("/api/appointments/autocomplete")
                            .param("query", query))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));

            verify(appointmentTitleService, times(1)).autocomplete(query);
        }

        @Test
        @DisplayName("Should handle case-insensitive search")
        void shouldHandleCaseInsensitiveSearch() throws Exception {
            // Arrange
            String query = "DOCTOR";
            List<String> suggestions = Arrays.asList("Doctor appointment", "Doctor follow-up");
            when(appointmentTitleService.autocomplete(query)).thenReturn(suggestions);

            // Act & Assert
            mockMvc.perform(get("/api/appointments/autocomplete")
                            .param("query", query))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2))
                    .andExpect(jsonPath("$[0]").value("Doctor appointment"))
                    .andExpect(jsonPath("$[1]").value("Doctor follow-up"));

            verify(appointmentTitleService, times(1)).autocomplete(query);
        }

        @Test
        @DisplayName("Should handle single character query")
        void shouldHandleSingleCharacterQuery() throws Exception {
            // Arrange
            String query = "d";
            List<String> suggestions = Arrays.asList("Dentist", "Doctor", "Dinner");
            when(appointmentTitleService.autocomplete(query)).thenReturn(suggestions);

            // Act & Assert
            mockMvc.perform(get("/api/appointments/autocomplete")
                            .param("query", query))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(3));

            verify(appointmentTitleService, times(1)).autocomplete(query);
        }

        @Test
        @DisplayName("Should return suggestions ordered by usage frequency")
        void shouldReturnSuggestionsOrderedByFrequency() throws Exception {
            // Arrange
            String query = "lunch";
            // Assuming service returns results ordered by frequency
            List<String> suggestions = Arrays.asList("Lunch meeting", "Lunch with team", "Lunch break");
            when(appointmentTitleService.autocomplete(query)).thenReturn(suggestions);

            // Act & Assert
            mockMvc.perform(get("/api/appointments/autocomplete")
                            .param("query", query))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(3))
                    .andExpect(jsonPath("$[0]").value("Lunch meeting"))
                    .andExpect(jsonPath("$[1]").value("Lunch with team"))
                    .andExpect(jsonPath("$[2]").value("Lunch break"));

            verify(appointmentTitleService, times(1)).autocomplete(query);
        }
    }
}
