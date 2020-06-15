const _data = require('../lib/data');
const _helpers = require('../lib/helpers');
const handlers = require('../lib/handlers');
const config = require('../lib/config');
const querystring = require('querystring');
/**
 * ***************************
 * Handler for Checkout 
 * Process all checkout routes
 * ***************************
 */
// Handler to process checkout items
handlers.checkout = (data, callback) => {
    let acceptableMethods = ['post'];

    if ( acceptableMethods.indexOf(data.method) > -1 ) {
        handlers._checkout[data.method](data, callback);
    } else {
        callback(405); // Method not allowed
    }
};

// Container for checkout methods
handlers._checkout = {};

// Checkout - POST
handlers._checkout.post = (data, callback) => {
    let phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    let orderId = typeof(data.payload.orderId) == 'string' && data.payload.orderId.trim() ? data.payload.orderId.trim() : false;
    
    // Validate user payload
    if ( phone && orderId) {
        // Get the token from the headers
        let token  = typeof(data.headers.token) == 'string' ? data.headers.token : false;

        // Verify that the given token is valid for the phone number
        handlers._tokens.verfiyToken(token, phone, (tokenIsValid) => {
            if (tokenIsValid) {
                // Get items from orders table
                _data.read('orders', phone, (err, orderData) => {
                
                    if (!err && orderData) {
                        // Search for the specified order id in the DB
                        _helpers.getOrderById(orderData, orderId, (err, order) => {
                            
                            if (!err) {
                                // Retrieve the valuse of the specified order ID
                                let orderObj = order[orderId];

                                // Check if the order has been settled/fulfilled
                                if(!orderObj.hasPaid){
                                    // Configure the request payload
                                    let paymentPayload = {
                                        amount: Math.round(orderObj.totalPrice * 100),
                                        currency: 'usd',
                                        source: 'tok_visa',
                                        description: `Pizza charges to ${orderObj.customerName}`
                                    };

                                    // Stringify the payload
                                    let paymentStringPayload = querystring.stringify(paymentPayload);

                                    // Configure the request details
                                    let requestDetails = {
                                        'hostname': 'api.stripe.com',
                                        'method': 'POST',
                                        'path': '/v1/charges',
                                        'headers': {
                                            'Authorization': `Bearer ${config.stripeKey}`,
                                            'Content-Type': 'application/x-www-form-urlencoded',
                                            'Content-Length': Buffer.byteLength(paymentStringPayload)
                                        },
                                    };
                                    // If order has not been fulfilled, pay for the order 
                                    _helpers.sendRequest(paymentPayload, requestDetails, paymentStringPayload, (err, res) => {
                                        if(!err) {

                                            // Retrieve success response from Stripe Api
                                            let stripeResponse = JSON.parse(res);

                                            // Prepare Customer's order data for update in database
                                            orderObj.hasPaid = true;
                                            orderObj.stripe = {
                                                stripeStatus: stripeResponse.status,
                                                connectionInfo: stripeResponse.outcome
                                            };

                                            // Configure the request payload
                                            let emailPayload = {
                                                "from": `Vals Pizza <postmaster@${config.mailgunDomain}>`,
                                                "to": `${orderObj.customerEmail}`,
                                                "subject": `Order Confirmation - ${orderObj.orderId}`,
                                                "text": `Dear ${orderObj.customerName}, \n Your order has been processed successfully.\nKind regards\nVals Pizza. Inc`
                                            };

                                            // Stringify the payload
                                            let emailStringPayload = querystring.stringify(emailPayload);

                                            // Configure the request details
                                            let emailRquestDetails = {
                                                'method': 'POST',
                                                'hostname': 'api.mailgun.net',
                                                'path': `/v3/${config.mailgunDomain}/messages`,
                                                'headers':{
                                                    'Authorization': 'Basic ' + Buffer.from((`api:${config.mailgunKey}`)).toString('base64'),
                                                    'Content-Type': 'application/x-www-form-urlencoded',
                                                    'Content-Length': Buffer.byteLength(emailStringPayload)
                                                }
                                            };

                                            // Send email upon successful payment
                                            _helpers.sendRequest(emailPayload, emailRquestDetails, emailStringPayload, (err, res) => {
                                                if(!err) {
                                                    // Prepare Customer's order data for update in database
                                                    orderObj.emailSent = true;
                                                    orderObj.updatedAt = _helpers.getTimestamp();
                                                    
                                                    // Append new payload to order object
                                                    orderData.orders[orderId] = orderObj;

                                                    // Update the order DB
                                                    _data.update('orders', phone, orderData, (err, res) => {
                                                        if (!err) {
                                                            // Delete users's cart data
                                                            _data.delete('carts', phone, (err) => {
                                                                if(!err){
                                                                    // Return success message
                                                                    callback(200, {'Message': 'Your order was successful'});
                                                                } else {
                                                                    callback(500, {'Error': 'Failed to delete cart data'});
                                                                }
                                                            });
                                                        } else {
                                                            callback(500, {'Error': 'Failed to update order database'});
                                                        }
                                                    });
                                                } else{
                                                    callback(err, {"Error: ": "Could not send email", "Message": res});
                                                }
                                            });
                                        } else{
                                            callback(err, {"Error: ": "Could not process payment", "Message": res});
                                        }
                                    });
                                } else {
                                    callback(400, {'Error': "This order has already been fulfilled. Please contact support."});
                                }
                            } else {
                                callback(500, {'Error': 'Order Id not found'});
                            }
                        });
                    } else {
                        callback(400, {'Error': 'You have no items in your cart'});
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

module.exports = handlers;