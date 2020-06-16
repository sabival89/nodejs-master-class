const _data = require('../lib/data');
const _helpers = require('../lib/helpers');
const handlers = require('../lib/handlers');


/**
 * ***********************
 * Handler for menu 
 * Process all menu routes
 * ***********************
 */
// Handler to process menu items
handlers.menu = (data, callback) => {
    let acceptableMethods = ['post', 'get'];

    if ( acceptableMethods.indexOf(data.method) > -1 ) {
        handlers._menu[data.method](data, callback);
    } else {
        callback(405); // Method not allowed
    }
};

// Container for menu methods
handlers._menu = {};

// Menu - POST
handlers._menu.post = (data, callback) => {
    let itemName = typeof(data.payload.itemName) == 'string' && data.payload.itemName.trim().length > 0 ? data.payload.itemName.trim() : false;
    let itemPrice = typeof(data.payload.itemPrice) == 'string' && data.payload.itemPrice.trim().length > 0 && data.payload.itemPrice.trim().search(/^[0-9]+[.][0-9][0-9]$/g) > -1 ? data.payload.itemPrice.trim() : false;    
    
    if (itemName && itemPrice) {
        // Get menu items
        _data.read('pizzas', 'pizza', (err, data) => {
            if (!err && data) {

                let menuObject = {
                    itemId: data.items.length + 1,
                    itemName: itemName,
                    itemPrice: itemPrice
                };

                // Append new item to existing items
                data.items.push(menuObject);
                
                // Store the new item
                _data.update('pizzas', 'pizza', data, (err) => {
                    if (!err) {
                        callback(200, {'Message': 'Menu item was successfully created'});
                    } else {
                        callback(500, {'Error': 'Could not update the menu'});
                    }
                });
            } else {
                callback(400, {'Error': 'Could not open menu for reading'});
            }
        });
        
    } else {
        callback(400, {'Error': 'Missing required field(s)'});
    }
};

// Menu - GET
handlers._menu.get =  (data, callback) => {
    // Get the token from the headers
    let token  = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    if(token){
        _data.read('tokens', token, (err, data) => {
            if(!err) {
                // Verify that the given token is valid for the retrieved phone number
                handlers._tokens.verfiyToken(token, data.phone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        // Get menu items
                        _data.read('pizzas', 'pizza', (err, data) => {
                            if (!err && data) {
                                callback(200, data.items);
                            } else {
                                callback(400, {'Error': 'Could not read menu items'});
                            }
                        });
                    } else {
                        callback(403, {'Error': 'Authentication token is invalid for user'});
                    }
                });
            } else {
                callback(400, {'Error': 'Invalid token provided. Please login to access this page'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required fields. Token not provided'});
    }
};

module.exports = handlers;