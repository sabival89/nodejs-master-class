const _data = require('../lib/data');
const _helpers = require('../lib/helpers');
const handlers = require('../lib/handlers');

/**
 * *************************
 * Handler for Orders 
 * Process all orders routes
 * *************************
 */
// Handler to process orders items
handlers.orders = (data, callback) => {
    let acceptableMethods = ['post', 'get'];

    if ( acceptableMethods.indexOf(data.method) > -1 ) {
        handlers._orders[data.method](data, callback);
    } else {
        callback(405); // Method not allowed
    }
};

// Container for orders methods
handlers._orders = {};

// Orders - POST
handlers._orders.post = (data, callback) => {
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    
    // Validate user payload
    if ( phone ) {
        // Get the token from the headers
        let token  = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // Verify that the given token is valid for the phone number
        handlers._tokens.verfiyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                // Retrieve users cart items
                _data.read('carts', phone, (err, cartData) => {
                    if (!err && cartData) {
                        // Retrieve user's info
                        _data.read('users', phone, (err, data) => {

                            // Get the total price of items in the cart
                            let totalPrice = cartData.reduce(_helpers.sumValues, 0);

                            // Get timestamp
                            let timestamp = _helpers.getTimestamp();

                            // Generate random order ID
                            let randomId = _helpers.createRandomString(20);

                            // Destructure id
                            const [id] = [randomId];
                            
                            // Create order paylaod object
                            let orderPayload = {};

                            // Create orders array to hold multiple orders for user
                            orderPayload.orders = [];

                            // Prepare order data
                            let order = {
                                [id]:{
                                    orderId: id,
                                    customerId: phone,
                                    customerName: data.firstName + " " + data.lastName, 
                                    customerEmail: data.email,
                                    hasPaid: false,
                                    emailSent: false,
                                    items: cartData,
                                    totalPrice: totalPrice,
                                    createdAt: timestamp,
                                    updatedAt: timestamp
                                }
                            };
                            
                            // Add order data to orders array
                            orderPayload.orders.push(order);

                            // Check if customer's order table already exists and if it is empty
                            _data.read('orders', phone, (err, orderData) => {

                                if(!err) {
                                    let len = orderData.orders.length;
                                    let lastIndex = len - 1;
                                    let lastObjKey = Object.keys(orderData.orders[lastIndex]);
                                    
                                    // Check if the last order was fulfilled, If the last order wasn't fulifilled,
                                    // it is possible theuser is submitting the same order twice
                                    if( orderData.orders[lastIndex][lastObjKey].hasPaid ){
                                        // Order table already exists for the user; Update users order table
                                        orderData.orders.push(order);

                                        _data.update('orders', phone, orderData, (err) => {
                                            if(!err){
                                                callback(200, {'id':`${order[id].orderId}`});
                                            } else {
                                                callback(500, {'Error': 'Could not add order to DB'});
                                            }
                                        });
                                    } else {
                                        // If last order wasn't fulfilled, overwite it with the new order
                                        delete orderData.orders[lastIndex];
                                        orderData.orders[lastIndex] = order;
                                        _data.update('orders', phone, orderData, (err) => {
                                            if(!err){
                                                callback(200, {'id':`${order[id].orderId}`});
                                            } else {
                                                callback(500, {'Error': 'Could not add order to DB'});
                                            }
                                        });
                                    }
                                } else {
                                    // Order table does not exist for this user therefore, create user's order table
                                    _data.create('orders', phone, orderPayload, (err) => {
                                        if (!err) {
                                            callback(200, {'id':`${order[id].orderId}`});
                                        } else {
                                            callback(500, {'Error': 'Could not create your order'});
                                        }
                                    });
                                }
                            });
                        });
                    } else {
                        callback(500, {'Error': 'You have no items in your cart. Could not create order'});
                    }
                });
            } else {
                callback(403, {'Error': 'Authentication token is not provided or is invalid'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required field(s)'});
    }
};

// Orders - GET
handlers._orders.get = (data, callback) => {
    
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    let id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id !== null ? data.queryStringObject.id.trim() : false;
    
    // Get the token from the headers
    let token  = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    if( data.queryStringObject['id'] == undefined ){
        if(phone){
            // Verify that the given token is valid for the phone number
            handlers._tokens.verfiyToken(token, phone, (tokenIsValid) => {
                if (tokenIsValid) {
                    // Get all orders
                    _data.read('orders', phone, (err, orderData) => {
                        if (!err && orderData) {
                            callback(200, orderData);
                        } else {
                            callback(400, {'Error': 'You have no existing orders'});
                        }
                    });
                } else {
                    callback(403, {'Error': 'Authentication token is not provided or is invalid'});
                }
            });
        } else {
            callback(400, {'Error': 'Missing required field(s)'});
        }       
    } else {
        // Get order by id
        if ( phone && id ) {
            // Verify that the given token is valid for the phone number
            handlers._tokens.verfiyToken(token, phone, (tokenIsValid) => {
                if (tokenIsValid) {
                    _data.read('orders', phone, (err, orderData) => {
                        if (!err && orderData) {
                            // Search for the order id
                            _helpers.getOrderById(orderData, id, (err, result) => {
                                if (!err) {
                                    callback(200, result);
                                } else {
                                    callback(err, {'Error': 'The order id does not exist'});
                                }
                            });
                        } else {
                            callback(400, {'Error': 'Order table for user not found'});
                        }
                    });
                } else {
                    callback(403, {'Error': 'Authentication token is not provided or is invalid'});
                }
            });
        } 
        else {
            callback(400, {'Error': 'Missing required field(s)'});
        }
    }
};

module.exports = handlers;