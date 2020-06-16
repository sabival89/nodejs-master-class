const _data = require('../lib/data');
const _helpers = require('../lib/helpers');
const handlers = require('../lib/handlers');

/**
 * ************************
 * Handler for Users 
 * Process all users routes
 * ************************
 */
// Handler to process users routes
handlers.users = (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete'];

    if ( acceptableMethods.indexOf(data.method) > -1 ) {
        handlers._users[data.method](data, callback);
    } else {
        callback(405); // Method not allowed
    }
};

// Object for users methods
handlers._users = {};

// Users - POST
handlers._users.post = (data, callback) => {
    // Check that all required fields are filled out
    let firstName   = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    let lastName    = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let email       = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 && data.payload.email.search(/^[a-zA-z]+(@)[a-zA-Z]+[.][a-zA-Z]/g) > -1 ? data.payload.email.trim() : false;
    let address     = typeof(data.payload.address) == 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;
    let phone       = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    let password    = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if (firstName && lastName && email && address && phone && password) {
        // Make sure that the user doesn't already exist
        _data.read('users', email, (err, data) => {
            if (err) {          
                
                // Hash the password
                let hashedPassword = _helpers.hash(password);
                
                // Create the user object
                let userObject = {
                    'firstName': firstName,
                    'lastName': lastName,
                    'email': email,
                    'phone': phone,
                    'address': address,
                    'hashedPassword': hashedPassword
                };

                // Store the user
                _data.create('users', phone, userObject, (err) => {
                    if (!err) {
                        callback(200, {"Message":"User was successfully created"});
                    } else {
                        callback(500, {'Error': 'Could not create user'});
                    }
                });
            } else {
                // User already exists
                callback(400, {'Error': 'A user with that phone number already exists'});
            }
        });

    } else {
        callback(400, {'Error': 'Missing required fields'});
    }
};

// Users - GET
handlers._users.get = (data, callback) => {
    //  Check that the email address provided is valid
    // let email = typeof(data.queryStringObject.email) == 'string' && data.queryStringObject.email.trim().length > 0 && data.queryStringObject.email.search(/^[a-zA-z]+(@)[a-zA-Z]+[.][a-zA-Z]/g) > -1 ? data.queryStringObject.email.trim() : false;
    let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    
    if (phone) {
        // Get the token from the headers
        let token  = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // Verify that the given token is valid for the phone number
        handlers._tokens.verfiyToken(token, phone, (tokenIsValid) => {
           if (tokenIsValid) {
                // Lookup the user
                _data.read('users', phone, (err, data) => {
                    if (!err && data) {
                        //  Remove the hashed password from the user object before returning it to the requestor
                        callback(200, data);
                    } else {
                        callback(404, {'Error': 'User Doesn\'t exist'});
                    }
                });
           } else {
                callback(403, {'Error': 'Authentication token is not provided or is invalid'});
           }
        });
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
};

// Users - PUT
handlers._users.put = (data, callback) => {
    //  Required field for update validation// let email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 && data.payload.email.search(/^[a-zA-z]+(@)[a-zA-Z]+[.][a-zA-Z]/g) > -1 ? data.payload.email.trim() : false;
    let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

    // Check for other fields
    let firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    let lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    let address = typeof(data.payload.address) == 'string' && data.payload.address.trim().length > 0 ? data.payload.address.trim() : false;
    let email = typeof(data.payload.email) == 'string' && data.payload.email.trim().length > 0 && data.payload.email.search(/^[a-zA-z]+(@)[a-zA-Z]+[.][a-zA-Z]/g) > -1 ? data.payload.email.trim() : false;
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    
    // Throw an error if the email is invalid
    if (phone) {
        // Throw an error if there's nothing to update
        if (firstName || lastName || address || email || password) {

            // Get the token from the headers
            let token  = typeof(data.headers.token) == 'string' ? data.headers.token : false;

            // Verify that the given token is valid for the phone number
            handlers._tokens.verfiyToken(token, phone, (tokenIsValid) => {
                if (tokenIsValid) {

                    // Search for the user
                    _data.read('users', phone, (err, userData) => {
                        if (!err && userData) {
                            // Update the necessary fields
                            if (firstName) {
                                userData.firstName = firstName;
                            }
                            
                            if (lastName) {
                                userData.lastName = lastName;
                            }
                            
                            if (address) {
                                userData.address = address;
                            }

                            if (email) {
                                userData.email = email;
                            }

                            if(password){
                                userData.hashedPassword = _helpers.hash(password);
                            }

                            // Store the updated fields
                            _data.update('users', phone, userData, (err) => {
                                if (!err) {
                                    callback(200, {'Message': 'Your profile was successfully updated'});
                                } else {
                                    callback(500, {'Error': 'Could not update the user'});
                                }
                            });
                        } else {
                            callback(400, {'Error': 'The specified user does not exist'});
                        }
                    });
                } else {
                    callback(403, {'Error': 'Authentication token is not provided or is invalid'});
                }
            });
        } else {
            callback(400, {'Error': 'Missing fields to update'});
        }
    } else {
        callback(400, {'Error' : 'Missing field required'});
    }
};

// Users - DELETE
handlers._users.delete = (data, callback) => {
    // Check that the phone number is valid
    let phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

    if (phone) {

        // Get the token from the headers
        let token  = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // Verify that the given token is valid for the phone number
        handlers._tokens.verfiyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                // Lookup the user
                _data.read('users', phone, (err, userData) => {
                    if (!err && userData) {
                        // Delete the user
                        _data.delete('users', phone, (err) => {
                            if (!err) {
                                // Delete cart items associated with the user
                                _data.delete('carts', phone, (err) => {
                                   
                                    // Delete orders associated with the user
                                    _data.delete('orders', phone, (err) => {
                                        callback(200, {"Message":"User has been successfully deleted"});
                                    });
                                });
                            } else {
                                callback(500, {'Error': 'Could not delete the specified user'});
                            }
                        });
                    } else {
                        callback(404, {'Error': 'Could not find the specified user'});
                    }
                });
            } else {
                callback(403, {'Error': 'Authentication token is not provided or is invalid'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
};

module.exports = handlers;
