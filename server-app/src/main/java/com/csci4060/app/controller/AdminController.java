package com.csci4060.app.controller;

import java.util.ArrayList;
import java.util.List;
import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.csci4060.app.ExceptionResolver;
import com.csci4060.app.model.APIresponse;
import com.csci4060.app.model.EmailWrapper;
import com.csci4060.app.model.Role;
import com.csci4060.app.model.User;
import com.csci4060.app.model.UserDetailDummy;
import com.csci4060.app.services.EmailSenderService;
import com.csci4060.app.services.RoleService;
import com.csci4060.app.services.UserService;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(path = "/api/admin", produces = "application/json")
public class AdminController extends ExceptionResolver {

	@Autowired
	UserService userService;

	@Autowired
	RoleService roleService;

	@Autowired
	EmailSenderService emailSenderService;

	@PutMapping(path = "/changeRole")
	@PreAuthorize("hasRole('ADMIN')")
	public APIresponse changeRoles(@Valid @RequestBody List<UserDetailDummy> userDetail) {
		List<UserDetailDummy> userWithChangedRoles = new ArrayList<UserDetailDummy>();
		for (UserDetailDummy details : userDetail) {
			User user = userService.findByEmail(details.getEmail());

			Role userRole = roleService.findByName(details.getRoles());

			user.getRoles().clear();
			user.getRoles().add(userRole);

			userService.save(user);

			userWithChangedRoles.add(
					new UserDetailDummy(user.getName(), user.getEmail(), user.getRoles().iterator().next().getName()));

		}
		return new APIresponse(HttpStatus.OK.value(),
				"The privileges allowed by chosen roles has been given to the User", userWithChangedRoles);

	}

	@GetMapping(path = "/getAllUsers")
	@PreAuthorize("hasRole('ADMIN')")
	public APIresponse getAllUsers() {
		Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

		String username = "";

		if (principal instanceof UserDetails) {
			username = ((UserDetails) principal).getUsername();
		}

		User loggedIn = userService.findByUsername(username);
		List<User> allUsers = userService.findAllUserExcept(loggedIn.getEmail());

		List<UserDetailDummy> response = new ArrayList<UserDetailDummy>();
//	    RoleName rolename = "ROLE_USER";

		for (User users : allUsers) {

			response.add(new UserDetailDummy(users.getName(), users.getEmail(),
					users.getRoles().iterator().next().getName()));
		}

		return new APIresponse(HttpStatus.OK.value(), "All users in the system are provided", response);
	}

	@DeleteMapping(path = "/deleteUser")
	@PreAuthorize("hasRole('ADMIN')")
	public APIresponse deleteUser(@RequestBody EmailWrapper emailWrapper) {

		List<String> emails = emailWrapper.getEmails();
		
		for (String email : emails) {
			User user = userService.findByEmail(email);

			if (user != null) {
				userService.delete(user);

				SimpleMailMessage mailMessage = new SimpleMailMessage();

				mailMessage.setTo(user.getEmail());
				mailMessage.setSubject("User Removed");
				mailMessage.setFrom("ulmautoemail@gmail.com");
				mailMessage.setText("You have been removed from the ulm communication app. " + "Thank you!");

				emailSenderService.sendEmail(mailMessage);
			}

		}

		return new APIresponse(HttpStatus.OK.value(), "User was successfully deleted.", emails);
	}
}
