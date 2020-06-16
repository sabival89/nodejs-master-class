const _data = require('../lib/data');
const _helpers = require('../lib/helpers');
const handlers = require('../lib/handlers');

/**
 * ************************
 * Handler for Carts 
 * Process all carts routes
 * ************************
 */
// Handler to process cart items
handlers.carts = (data, callback) => {
    let acceptableMethods = ['post', 'get', 'put'];

    if ( acceptableMethods.indexOf(data.method) > -1 ) {
        handlers._carts[data.method](data, callback);
    } else {
        callback(405); // Method not allowed
    }
};

// Container for cart methods
handlers._carts = {};

// Cart - POST
handlers._carts.post = (data, callback) => {
    let itemId = typeof(data.payload.itemId) == 'number' || typeof(data.payload.itemId) == 'object' && data.payload.itemId !== null ? data.payload.itemId : false;
    let quantity = typeof(data.payload.quantity) == 'number' && data.payload.quantity !== null ? data.payload.quantity : false;
    
    // Validate user payload
    if (itemId && quantity) {
        // Get the token from the headers
        let token  = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        _data.read('tokens', token, (err, data) => {
            if(!err) {
                let phone = data.phone;
                // Verify that the given token is valid for the phone number
                handlers._tokens.verfiyToken(token, phone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        // Get items in the pizza menu
                        _data.read('pizzas', 'pizza', (err, data) => {
                            if (!err && data) {

                                // Try to retrive the selected item from the menu
                                let item = data.items[itemId-1];
                                
                                // Check if selected item exists
                                if( item !== undefined ){

                                    // Add the new item quantity to the object
                                    item.quantity = quantity;

                                    // Container for new items
                                    let newItem = [];

                                    // Add new item to the container
                                    newItem.push(item);

                                    // Search if the user's cart already exists
                                    _helpers.fetchFilename('carts', phone, _data, (err, filename) => {
                                        
                                        // Read the items in the cart if no errors and append new items to the DB
                                        if( !err && filename !== null ){
                                            // Read the cart data
                                            _data.read('carts', filename, (err, data) => {
                                                if(!err){
                                                    // Check if the item already exists in the cart
                                                    _helpers.getCartItemsById(data, itemId, (err, res) => {
                                                        if (!err) {
                                                            // Refrain from adding item to the cart because it already exixts
                                                            // The specified item can be updated using the PUT HTTP verb
                                                            callback(409, {"Message": "Item already exists in cart"});
                                                        } else {
                                                            // Append the item to the object and update the DB if item doesn't already exist
                                                            data.push(item);
                                                            _data.update('carts', phone, data, (err) => {
                                                                if(!err){
                                                                    callback(200, {"message": "Item was successfully added to cart"});
                                                                } else {
                                                                    callback(500, {"Error": "Could not add item to the cart"});
                                                                }
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    callback(500, {"Error": "Could not read data from the cart"});
                                                }
                                            });
                                        } else {
                                            // Create the user's cart
                                            _data.create('carts', phone, newItem, (err) => {
                                                if(!err){
                                                    callback(200, {"message": "Item was added successfully to cart"});
                                                } else {
                                                    callback(500, {"Error": "Could not add item to the cart"});
                                                }
                                            });
                                        }
                                    });
                                } else {
                                    callback(400, {'Error': 'The item you specified doesn\'t exist in the menu'});
                                }
                            } else {
                                callback(400, {'Error': 'Could not open menu for reading'});
                            }
                        });
                    } else {
                        callback(403, {'Error': 'Authentication token is not provided or is invalid'});
                    }
                });
            } else {
                callback(400, {'Error': 'Invalid token provided. Please login to access this page'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field(s)'});
    }
};

// Cart - GET
handlers._carts.get = (data, callback) => {
    // Get the token from the headers
    let token  = typeof(data.headers.token) == 'string' ? data.headers.token : false;
    if (token) {
        _data.read('tokens', token, (err, data) => {
            if(!err) {
                let phone = data.phone;
                // Verify that the given token is valid for the phone number
                handlers._tokens.verfiyToken(token, phone, (tokenIsValid) => {
                    if (tokenIsValid) {
                        // Lookup the user
                        _data.read('carts', phone, (err, data) => {
                            if (!err && data) {
                                callback(200, data);
                            } else {
                                callback(404, {'Error': 'No items found in your cart'});
                            }
                        });
                    } else {
                        callback(403, {'Error': 'Authentication token is not provided or is invalid'});
                    }
                });
            } else {
                callback(400, {'Error': 'Invalid token provided. Please login to access this page'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field'});
    }
};

// Cart - PUT
handlers._carts.put = (data, callback) => {
    let itemId = typeof(data.payload.itemId) == 'number' || typeof(data.payload.itemId) == 'object' && data.payload.itemId !== null ? data.payload.itemId : false;
    let quantity = typeof(data.payload.quantity) == 'number' && data.payload.quantity !== null ? data.payload.quantity : false;
    
    if (itemId && quantity) {

        // Get the token from the headers
        let token  = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        if (token) {
            _data.read('tokens', token, (err, data) => {
                if(!err) {
                    let phone = data.phone;

                    // Verify that the given token is valid for the phone number
                    handlers._tokens.verfiyToken(token, phone, (tokenIsValid) => {
                        if (tokenIsValid) {
                            // Get menu items
                            _data.read('pizzas', 'pizza', (err, data) => {
                                if (!err && data) {
                                    // Try to retrive the selected item from the menu
                                    let item = data.items[itemId-1];

                                    // Check if object is empty
                                    if( JSON.stringify(item).length > 2 ){

                                        // Add the new item quantity to the object
                                        item.quantity = quantity;

                                        // Check if item exists in cart
                                        _data.read('carts', phone, (err, data) => {
                                            if (!err){
                                                // Find the item in the cart with the itemId
                                                _helpers.getCartItemsPositionById(data, itemId, (err, res) => {
                                                    if (!err) {
                                                        // Update the items position in the object/file using the returned index
                                                        data[res.position] = item;

                                                        // Update the user's cart items
                                                        _data.update('carts', phone, data, (err) => {
                                                            if(!err){
                                                                callback(200, {"message": "Item was successfully updated"});
                                                            } else {
                                                                callback(500, {"Error": "Could not update item in the cart"});
                                                            }
                                                        });
                                                    } else {
                                                        callback(500, {'Error': 'Item not found'});
                                                    }
                                                });
                                            } else {
                                                callback(500, {"Error" : "Could not read cart items"});
                                            }
                                        });
                                    } else {
                                        callback(500, {'Error': 'The item you specified doesn\'t exist'});
                                    }
                                } else {
                                    callback(500, {'Error': 'Could not retrieve pizza menu'});
                                }
                            });
                        } else {
                            callback(403, {'Error': 'Authentication token is not provided or is invalid'});
                        }
                    });
                } else {
                    callback(400, {'Error': 'Invalid token provided. Please login to access this page'});
                }
            });
        } else {
            callback(400, {'Error': 'Missing required field(s)'});
        }
    } else {
        callback(400, {'Error': 'Missing required field(s)'});
    }
};

module.exports = handlers;