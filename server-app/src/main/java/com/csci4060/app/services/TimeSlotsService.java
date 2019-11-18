package com.csci4060.app.services;

import java.util.List;
import com.csci4060.app.model.User;
import com.csci4060.app.model.appointment.Appointment;
import com.csci4060.app.model.appointment.TimeSlots;

public interface TimeSlotsService {

	TimeSlots save(TimeSlots slots);
	
	List<TimeSlots> findAllByAppointment(Appointment appointment);
	
	TimeSlots findById(Long id);
	List<TimeSlots> findAllBySelectedBy(User selectedBy);
	
	void delete(TimeSlots timeslots);
}
