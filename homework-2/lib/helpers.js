/* Helpers for various tasks */

// Dependencies
const fs = require('fs');
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');
const lib = require('./data');

// Container for all the helpers
let helpers = {};

helpers.lib = lib;

// Create a SHA256 hash
helpers.hash = (str) => {
    if (typeof(str) == 'string' && str.length > 0) {
        let hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
        return hash;
    } else {
        return false;
    }
};

// Parse a JSON string to an object in all cases, without throwing
helpers.parseJsonToObject = (str) => {
    try{
        let obj = JSON.parse(str);
        return obj;
    } catch(e){
        return {};
    }
};

// Create a string of alphanumeric characters, of a given length
helpers.createRandomString = (strLength) => {
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
    if (strLength) {
        // Define all the possible characters that could go into a string
        let possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

        // Start the final string
        let str = '';

        for (let index = 1; index <= strLength; index++) {
            // Get the random character from the possibleCharacters string
            let randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));

            // Append this character to the final string
            str += randomCharacter;
        }

        // Return the final string
        return str;
    } else {
        return false;
    }
};

// Query and return selected menu items
helpers.getUserInfo = (object, id, lib, callback) => {
    lib.read(object, id, (err, data) => {
        if (!err) {
            callback(data)
        } else {
            callback(405, {"Error: ": "User not found"});
        }
    });
}

helpers.fetchFilename = (dir, filename, moduleInstance, callback) => {
    return moduleInstance.list(dir, (err, files) => {

        if (!err && files && files.length > 0 ) {
            let file = '';
            files.forEach(element => {
                if( element === filename ){
                    file = filename;
                    return file;
                }
            });

            if( file.length > 0 ){
                callback(false, file);
            } else {
                callback(true);
            }
            
        } else {
            return callback(true);
        }
    });  
}

// Sum up the total cost of items in the cart
helpers.sumValues = (total, num ) => {
    let quantity = num.quantity;
    let price = num.itemPrice;

    if(quantity > 1 ){
        price *= quantity;
    } 

    return total + parseFloat(price);
};

// Get current date and time
helpers.getTimestamp = () => {
    let now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return createdAt = now.toISOString().slice(0,19).replace('T', ' ');
}

// Search for the order ID in the user's order table
helpers.getOrderById = (data, orderId, callback) => {
    let result = data.orders.find( id => id.hasOwnProperty(orderId));
    if( result !== undefined ){
        callback(false, result);
    } else {
        callback(true, {"Error": "Could not find the order id"})
    }
};

// Search for the cart item's ID in the user's cart table
helpers.getCartItemsById = (data, cartId, callback) => {
    let result = data.find( id => id.itemId === cartId);
    
    if( result !== undefined ){
        callback(false, result);
    } else {
        callback(true, {"Error": "Could not find the order id"})
    }
};

// Do equality match (used by the getCartItemsById method)
helpers.checkIdMatch = (elem, search) => {
    return (elem.itemId === search);
};

// Search for the index of the cart item in the user's cart table
helpers.getCartItemsPositionById = (data, cartId, callback) => {
    let result = {};
    data.find((val, index) => {
        if(helpers.checkIdMatch(val, cartId)){
            let payload = {
                "result":val,
                "position":index
            };
            result = payload;
            return result;
        }
    });

    if( JSON.stringify(result).length > 2 ){
        callback(false, result);
    } else {
        callback(true, {"Error": "Could not find the item id"});
    }
};

// API request handler for Stripe and Mailgun
helpers.sendRequest = (orderPayload, requestPayload, stringPayload, callback) => {
     
    if ( JSON.stringify(orderPayload).length > 2 ) {
         
        // Instantiate the request object
        let req = https.request(requestPayload, (res) => {
            //  Grab the status of the sent request
            let status = res.statusCode;
            let statusMessage = res.statusMessage;
            let chunks = [];

            res.on("data", chunk => {
                chunks.push(chunk);
            });

            res.on("end", (chunk) => {
                let body = Buffer.concat(chunks);
                if (status == 200 || status == 201) {
                    callback(false, body.toString());
                } else {
                    callback(status, {"Error" : statusMessage});
                }
            });
 
            // Bind to the error event so it doesn't get thrown
            res.on('error', (e) => {
                callback(e);
            });
        });

       req.write(stringPayload);

       req.end();

    } else {
        callback('Given parameters were missing or invalid');
    }
 };



// Export the module
module.exports = helpers;