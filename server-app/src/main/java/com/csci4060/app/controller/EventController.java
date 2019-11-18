package com.csci4060.app.controller;

import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.List;

import javax.security.sasl.AuthenticationException;
import javax.validation.Valid;

import javax.validation.Valid;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.csci4060.app.ExceptionResolver;

import com.csci4060.app.model.APIresponse;
import com.csci4060.app.model.User;
import com.csci4060.app.model.calendar.Calendar;
import com.csci4060.app.model.event.Event;
import com.csci4060.app.model.event.EventDummy;
import com.csci4060.app.model.event.EventShare;
import com.csci4060.app.services.CalendarService;
import com.csci4060.app.services.EmailSenderService;
import com.csci4060.app.services.EventService;
import com.csci4060.app.services.UserService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(path = "/api/event", produces = "application/json")

public class EventController extends ExceptionResolver {


	@Autowired
	UserService userService;

	@Autowired
	EventService eventService;

	@Autowired
	private EmailSenderService emailSenderService;

	@Autowired
	CalendarService calendarService;

	@PostMapping(path = "/set", consumes = "application/json")
	@PreAuthorize("hasRole('PM') or hasRole('ADMIN') or hasRole('MODERATOR') or hasRole('USER')")
	public APIresponse setEvent(@Valid @RequestBody EventDummy eventDummy)

			throws FileNotFoundException, AuthenticationException {

		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

		String creatorUsername = "";

		if (principal instanceof UserDetails) {
			creatorUsername = ((UserDetails) principal).getUsername();
		}

		User createdBy = userService.findByUsername(creatorUsername);

		List<User> recipientList = new ArrayList<User>();

		List<String> recepientsEmailList = eventDummy.getRecipients();

		List<String> actualRecipients = new ArrayList<>();

		String backgroundColor = eventDummy.getBackgroundColor();

		if (backgroundColor == null) {
			backgroundColor = "";
		}
		for (String each : recepientsEmailList) {

			User recipient = userService.findByEmail(each);

			if (recipient != null) {
				recipientList.add(recipient);
				actualRecipients.add(each);
			}
		}

		Calendar calendar = calendarService.findById(eventDummy.getCalendarId());

		if (calendar == null) {
			throw new FileNotFoundException("Calendar with given id is not present in the database");
		}

		Event event = new Event(eventDummy.getTitle(), eventDummy.getDescription(), eventDummy.getLocation(),
				recipientList, eventDummy.getStart(), eventDummy.getEnd(), createdBy, eventDummy.getAllDay(),
				calendar.getColor(), backgroundColor);

		eventService.save(event);

		Long newEventId = event.getId();


		if (calendar.getCreatedBy() == createdBy) {
			calendar.getEvents().add(event);
			calendarService.save(calendar);
		} else {
			throw new AuthenticationException("You are not allowed to create an event for this calendar");
		}

		if (!recipientList.isEmpty()) {

			for (User sharedToPerson : recipientList) {

				Calendar recipientCalendar = null;

				if (!calendar.getShareduser().contains(sharedToPerson)) {
					recipientCalendar = calendarService.findByNameAndCreatedBy("Shared Event", sharedToPerson);
					recipientCalendar.addEvent(event);
					calendarService.save(recipientCalendar);
				}
			}
		}

		if (!actualRecipients.isEmpty()) {

			SimpleMailMessage mailMessage = new SimpleMailMessage();

			String[] emails = actualRecipients.toArray(new String[actualRecipients.size()]);

			mailMessage.setTo(emails);
			mailMessage.setSubject("Event Information");
			mailMessage.setFrom("ulmautoemail@gmail.com");
			mailMessage.setText(
					"A faculty has set an event for you. Please log in to you ULM communication app and register for the event. "
							+ "Thank you!");

			emailSenderService.sendEmail(mailMessage);
		}

		return new APIresponse(HttpStatus.CREATED.value(), "event created successfully", event);
	}

	@PostMapping(path = "/confirm/{id}", consumes = "application/json")
	@PreAuthorize("hasRole('USER') or hasRole('PM') or hasRole('ADMIN')")
	public APIresponse confirmEvent(@PathVariable("id") Long eventId) {

		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

		String creatorUsername = "";

		if (principal instanceof UserDetails) {
			creatorUsername = ((UserDetails) principal).getUsername();
		}

		User loggedInUser = userService.findByUsername(creatorUsername);

		Event event = eventService.findById(eventId);

		if (event == null) {
			return new APIresponse(HttpStatus.NOT_FOUND.value(), "event does not exist in the database", null);
		}

		if (!event.getRecipients().contains(loggedInUser)) {
			return new APIresponse(HttpStatus.BAD_REQUEST.value(), "You are not the recipient of this event", null);
		}
		
		if(event.getConfirmedBy().contains(loggedInUser)) {
			return new APIresponse(HttpStatus.BAD_REQUEST.value(), "You have already confirmed this event", null);
		}

		event.getConfirmedBy().add(loggedInUser);
		eventService.save(event);

		return new APIresponse(HttpStatus.CREATED.value(), "event confirmed successfully by "+loggedInUser.getName(), event);
	}

	@PostMapping(path = "/share")
	@PreAuthorize("hasRole('USER') or hasRole('PM') or hasRole('ADMIN')")
	public APIresponse shareGroup(@Valid @RequestBody EventShare eventShare) {

		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

		String username = "";

		if (principal instanceof UserDetails) {
			username = ((UserDetails) principal).getUsername();
		}

		User user = userService.findByUsername(username);

		Long eventId = eventShare.getEventId();

		Event event = eventService.findById(eventId);

		if (event == null) {
			return new APIresponse(HttpStatus.BAD_REQUEST.value(), "Event with id " + eventId + " does not exist",
					null);
		}

		if (event.getCreatedBy() != user) {
			return new APIresponse(HttpStatus.FORBIDDEN.value(), "You did not create the event. Authorization denied!",
					null);
		}

		List<String> emailsFromJson = eventShare.getRecipients();
		List<String> sharedWithList = new ArrayList<String>();

		for (String email : emailsFromJson) {

			User personToShare = userService.findByEmail(email);
			if (personToShare != null) {
				if (!event.getRecipients().contains(personToShare)) {

					sharedWithList.add(email);
					event.getRecipients().add(personToShare);
					eventService.save(event);

					Calendar recipientCalendar = calendarService.findByNameAndCreatedBy("Shared Event", personToShare);
					recipientCalendar.addEvent(event);
					calendarService.save(recipientCalendar);
				}

			}

		}

		return new APIresponse(HttpStatus.OK.value(),
				"Event " + event.getTitle() + " has been shared to users: " + sharedWithList, event);
	}
}
