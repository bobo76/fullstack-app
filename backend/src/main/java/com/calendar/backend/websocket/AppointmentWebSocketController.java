package com.calendar.backend.websocket;

import com.calendar.backend.dto.AppointmentEvent;
import com.calendar.backend.dto.AppointmentResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 * WebSocket controller for broadcasting appointment changes to all connected clients.
 * Handles real-time synchronization of appointment create, update, and delete operations.
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class AppointmentWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/appointment/create")
    public void handleAppointmentCreate(@Payload AppointmentResponse appointment) {
        log.debug("Broadcasting appointment creation: {}", appointment.id());
        AppointmentEvent event = AppointmentEvent.created(appointment);
        messagingTemplate.convertAndSend("/topic/appointments", event);
    }

    @MessageMapping("/appointment/update")
    public void handleAppointmentUpdate(@Payload AppointmentResponse appointment) {
        log.debug("Broadcasting appointment update: {}", appointment.id());
        AppointmentEvent event = AppointmentEvent.updated(appointment);
        messagingTemplate.convertAndSend("/topic/appointments", event);
    }

    @MessageMapping("/appointment/delete")
    public void handleAppointmentDelete(@Payload Long id) {
        log.debug("Broadcasting appointment deletion: {}", id);
        // Create a minimal response with just the ID for deletion
        AppointmentResponse deletedAppointment = new AppointmentResponse(
                id, null, null, null, null, null, null, null, null
        );
        AppointmentEvent event = AppointmentEvent.deleted(deletedAppointment);
        messagingTemplate.convertAndSend("/topic/appointments", event);
    }

    public void broadcastAppointmentCreated(AppointmentResponse appointment) {
        log.debug("Broadcasting appointment created: {}", appointment.id());
        AppointmentEvent event = AppointmentEvent.created(appointment);
        messagingTemplate.convertAndSend("/topic/appointments", event);
    }

    public void broadcastAppointmentUpdated(AppointmentResponse appointment) {
        log.debug("Broadcasting appointment updated: {}", appointment.id());
        AppointmentEvent event = AppointmentEvent.updated(appointment);
        messagingTemplate.convertAndSend("/topic/appointments", event);
    }

    public void broadcastAppointmentDeleted(Long id) {
        log.debug("Broadcasting appointment deleted: {}", id);
        AppointmentResponse deletedAppointment = new AppointmentResponse(
                id, null, null, null, null, null, null, null, null
        );
        AppointmentEvent event = AppointmentEvent.deleted(deletedAppointment);
        messagingTemplate.convertAndSend("/topic/appointments", event);
    }
}
