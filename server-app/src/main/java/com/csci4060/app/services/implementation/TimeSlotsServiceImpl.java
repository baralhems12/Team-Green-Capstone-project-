package com.csci4060.app.services.implementation;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.csci4060.app.model.User;
import com.csci4060.app.model.appointment.Appointment;
import com.csci4060.app.model.appointment.TimeSlots;
import com.csci4060.app.repository.appointmentRepo.TimeSlotsRepository;
import com.csci4060.app.services.TimeSlotsService;

@Service(value = "timeSlotsService")
public class TimeSlotsServiceImpl implements TimeSlotsService {

	@Autowired
	TimeSlotsRepository timeSlotsRepo;

	@Override
	public TimeSlots save(TimeSlots slots) {
		return timeSlotsRepo.save(slots);
	}

	@Override
	public List<TimeSlots> findAllByAppointment(Appointment appointment) {

		Optional<List<TimeSlots>> optTimeSlots = timeSlotsRepo.findAllByAppointment(appointment);

		if (optTimeSlots.isPresent()) {
			return optTimeSlots.get();
		}
		return null;
	}

	@Override
	public TimeSlots findById(Long id) {
		Optional<TimeSlots> optTimeSlot = timeSlotsRepo.findById(id);

		if (optTimeSlot.isPresent()) {
			return optTimeSlot.get();
		}
		return null;
	}

	@Override
	public List<TimeSlots> findAllBySelectedBy(User selectedBy) {

		Optional<List<TimeSlots>> optTimeSlots = timeSlotsRepo.findAllBySelectedBy(selectedBy);

		if (optTimeSlots.isPresent()) {
			return optTimeSlots.get();
		}
		return null;
	}

}
