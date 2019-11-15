package com.csci4060.app.services;

import com.csci4060.app.model.User;
import com.csci4060.app.model.authentication.ConfirmationToken;

public interface ConfirmationTokenService {

	ConfirmationToken findByConfirmationToken(String confirmationToken);
	ConfirmationToken save(ConfirmationToken token);
<<<<<<< HEAD

=======
>>>>>>> fe9437d1d7ad3890fd7a6028eecafe8c96cc2c09
	ConfirmationToken findByUser(User user);
	void delete(ConfirmationToken token);
}
