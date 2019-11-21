package com.csci4060.app.services;

import java.util.List;

import com.csci4060.app.model.User;
import com.csci4060.app.model.calendar.Calendar;
import com.csci4060.app.model.event.Event;

public interface CalendarService {

	Calendar save(Calendar calendar);
	
	Calendar findById(Long id);
	
	List<Calendar> findAllByCreatedBy(User user);
	
	List<Calendar> findAllByShareduser(User user); 
	
	Calendar findByNameAndCreatedBy(String name, User user);
	
	List<Calendar> findAllByEvents(Event event);
	
	void delete(Calendar calendar);
}
