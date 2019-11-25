package com.csci4060.app.model.calendar;

import java.util.List;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.validation.constraints.NotEmpty;
import com.csci4060.app.model.User;
import com.csci4060.app.model.event.Event;
import lombok.Data;

@Data
@Entity
public class Calendar {

	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	long id;
	
	@NotEmpty(message= "Calendar name must not be empty!")
	String name;
	
	String color;
	
	@ManyToMany(targetEntity = Event.class)
	List<Event> events;
	
	@ManyToMany(targetEntity = User.class)
	List<User> shareduser;
	
	@ManyToOne(targetEntity = User.class)
	User createdBy;
	
	boolean shown;
	
	boolean isDefaultCalendar;
	
	public void addEvent(Event event) {
		events.add(event);
		//event.getCalendars().add(this);
	}
	
	public void removeEvent(Event event) {
        events.remove(event);
        //event.getCalendars().remove(this);
    }
	
	public Calendar(String name, String color, List<Event> events, List<User> shareduser, User createdBy, boolean shown, boolean isDefaultCalendar) {
		this.name = name;
		this.color = color;
		this.events = events;
		this.shareduser = shareduser;
		this.createdBy = createdBy;
		this.shown = shown;
		this.isDefaultCalendar = isDefaultCalendar;
	}

	public Calendar() {
		super();
	}
}