/* 
    These are server-related tasks 
*/

// Dependencies
const http          = require('http');
const https         = require('https');
const url           = require('url');
const stringDecoder = require('string_decoder').StringDecoder;
const config        = require('./config');
const fs            = require('fs');
const handlers      = require('./handlers');
const helpers       = require('./helpers');
const path          = require('path');
const util = require('util');
const debug = util.debuglog('server');
const queryString = require('querystring');

const menu = require('../routes/menu')
const carts = require('../routes/carts')
const orders = require('../routes/orders')
const auth = require('../routes/auth')
const users = require('../routes/users')
const checkout = require('../routes/checkout')


// Instantiate the server module object
let server = {};

// Instantiate the http server
server.httpServer = http.createServer((req, res) => {
    server.unifiedServer(req, res);
});

// Instantiate the HTTPS server
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};

server.httpsServer = https.createServer(server.httpsServerOptions, (req, res) => {
    server.unifiedServer(req, res);
});

// All the server logic for the http and https server
server.unifiedServer = (req, res) => {
     
    // Get the url and parse it
    let parsedUrl = url.parse(req.url, true);

    // Get the path
    let path = parsedUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get the HTTP method
    let method = req.method.toLowerCase();

    // Get the query string as an object
    let queryStringObject = parsedUrl.query;

    // Get the headers
    let headers = req.headers;

    // Get the payload if any
    let decoder = new stringDecoder('utf-8');
    let buffer = '';

    // Read in streams of data when the "on data" event is triggered
    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    // Calls for every request regardless of if it has a payload or not
    req.on('end', () => {
        buffer += decoder.end();

        // Choose the handler this request should go to. If one is not found, use the not found handler
        let chosenHandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;

        // Construct the data object to send to the handler
        let data = {
            'trimmedPath' : trimmedPath,
            'queryStringObject' : queryStringObject,
            'method' : method,
            'headers' : headers,
            'payload' : helpers.parseJsonToObject(buffer)
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, (statusCode, payload) => {
            // Use the status code called back by the handler or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            // Use th epayload calledback by the handler or default to an empty object
            payload = typeof(payload) == 'object' ? payload : {};

            // Convert the payload to a string
            let payloadString = JSON.stringify(payload);

            // How do we tell the user and the browser that we are sending a JSON object type
            res.setHeader('Content-type', 'application/json');

            // Return the response
            res.writeHead(statusCode); 

            res.end(payloadString);

            // if the response is 200 print fgreen, otherwise print red
            if (statusCode == 200) {
                debug('\x1b[32m%s\x1b[0m',method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
            } else {
                debug('\x1b[31m%s\x1b[0m',method.toUpperCase() + ' /' + trimmedPath + ' ' + statusCode);
            }
            // debug('Returning this response: ', statusCode, payloadString);
        });
    });
};

// Define a request router
server.router = {
    'users' : users.users,
    'login' : auth.login,
    'logout' : auth.logout,
    'menu' : menu.menu,
    'orders' : orders.orders,
    'carts' : carts.carts,
    'checkout' : checkout.checkout
};

// Init script
server.init = () => {
    
    // Start the server and have it listen on port 3000
    server.httpServer.listen(config.httpPort, ()=>{
        console.log('\x1b[36m%s\x1b[0m', `The server is listening on port ${config.httpPort} in ${config.envName} mode`);
    }); 

    // Start the HTTPS server
    server.httpsServer.listen(config.httpsPort, ()=>{
        console.log('\x1b[35m%s\x1b[0m', `The server is listening on port ${config.httpsPort} in ${config.envName} mode`);
    });
};

// Export the module
module.exports = server;