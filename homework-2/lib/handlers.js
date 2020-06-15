// Handler object
let handlers = {};

// Return 404 for non existing routes
handlers.notFound = (data, callback) => {
   callback(404);
};

// Export the hanlers module
module.exports = handlers;