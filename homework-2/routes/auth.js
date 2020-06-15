const _data = require('../lib/data');
const _helpers = require('../lib/helpers');
const handlers = require('../lib/handlers');

/**
 * ************************
 * Handler for Auth 
 * Process all AUTH routes
 * ***********************
 */

// Handler to process logout routes
handlers.logout = (data, callback) => {
    let acceptableMethods = ['post'];

    if ( acceptableMethods.indexOf(data.method) > -1 ) {
        handlers._logout[data.method](data, callback);
    } else {
        callback(405); // Method not allowed
    }
};

// Container for the tokens methods
handlers._logout = {};

// Logout - POST
handlers._logout.post = (data, callback) => {
    // Get the token from the headers
    let token  = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    if(token){
        _data.read('tokens', token, (err, data) => {
            if(!err) {
                // Verify that the given token is valid for the retrieved phone number
                handlers._tokens.verfiyToken(token, data.phone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        
                        // delete the token
                        _data.delete('tokens', token, (err) => {
                            if(!err){
                                callback(200, {'Message': 'You successfulty logged out'});
                            } else {
                                callback(500, {'Error': 'An error occurred while trying to log you out'});
                            }
                        });
                    } else {
                        callback(403, {'Error': 'Authentication token is invalid'});
                    }
                });
            } else {
                callback(400, {'Error': 'Token does not exist'});
            }
        });
    } else {
        callback(400, {'Error': 'Token not provided'});
    }
};

// Handler to process Login routes
handlers.login = (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put', 'delete'];

    if ( acceptableMethods.indexOf(data.method) > -1 ) {
        handlers._tokens[data.method](data, callback);
    } else {
        callback(405); // Method not allowed
    }
};

// Container for the tokens methods
handlers._tokens = {};

// Tokens - POST
handlers._tokens.post = (data, callback) => {
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    let password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0? data.payload.password.trim() : false;

    if (phone && password) {
        // Look up the user that matches the email address
        _data.read('users', phone, (err, userData) => {
           if (!err) {
               if(_helpers.hash(password) === userData.hashedPassword){
                    let tokenId = _helpers.createRandomString(20);
                    let expires = Date.now() + 1000 * 60 * 60;
                    let tokenObject = {
                        'phone': phone,
                        'id': tokenId,
                        'expires': expires
                    };

                    // Store the token
                    _data.create('tokens', tokenId, tokenObject, (err) => {
                        if (!err) {
                            callback(200, tokenObject);
                        } else {
                            callback(500, {'Error': 'Could not create the new token'});
                        }  
                    });
                } else {
                    callback(400, {'Error': 'Invalid password'});
                } 
           } else {
                callback(400, {'Error': 'Could not find the specified user'});
           }  
        });
    } else {
        callback(400, {'Error': 'Missing required field(s)'});
    }
};

// Tokens - GET
// Required data: id
handlers._tokens.get = (data, callback) => {
    //  Check that the ID is valid
    let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

    if (id) {
        // Lookup the token
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                callback(200, tokenData);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
};

// Tokens - PUT
// Required data: id, extend
handlers._tokens.put = (data, callback) => {
    let id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    let extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;
    
    if (id && extend) {
        // Lookup the token
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData) {
                // Check to make sure that the token isn't expired
                if (tokenData.expires > Date.now()) {
                    // Set the expiration an hour from now
                    tokenData.expires = Date.now() + 1000 * 60 * 60;

                    // Store the new updates
                    _data.update('tokens', id, tokenData, (err) => {
                        if (!err) {
                            callback(200);
                        } else {
                            callback(500, {'Error': 'Could not update the token\'s expiration'});
                        }
                    });
                } else {
                    callback(400, {'Error': 'The token has expired and cannot be extended'});
                }
            } else {
                callback(400, {'Error': 'Specified token doesn\'t exist'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field(s) or fields are invalid'});
    }
};

// Tokens - DELETE
handlers._tokens.delete = (data, callback) => {
    //  Check that the id is valid
    let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

    if (id) {
        // Lookup the token
        _data.read('tokens', id, (err, data) => {
            if (!err && data) {
                _data.delete('tokens', id, (err) => {
                    if (!err) {
                        callback(200);
                    } else {
                        callback(500, {'Error': 'Could not delete the specified token'});
                    }
                });
            } else {
                callback(400, {'Error': 'Could not find the specified token'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
};


// Verify if a given token id is currently valid for a given user
handlers._tokens.verfiyToken = (id, phone, callback) => {
    // Lookup the token
    _data.read('tokens', id, (err, tokenData) => {
        if (!err && tokenData) {
            // Check that the token is for the given user and has not exoired
            if (tokenData.phone == phone && tokenData.expires > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

module.exports = handlers;