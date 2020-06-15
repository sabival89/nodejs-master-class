/* CRUD mgt */
// Dependencies
const path  = require('path');
const fs  = require('fs');
const _helpers  = require('./helpers');

// Object for CRUD module
let lib = {};

// Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

// CREATE - Writing data to a file
lib.create = (dir, file, data, callback) => {
     fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fd) => {
        if (!err && fd) {
            let stringData = JSON.stringify(data);

            fs.writeFile(fd, stringData, (err) => {
                if (!err) {
                    fs.close(fd, (err) => {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing file');
                        }
                    });
                } else {
                    callback('Error writing data to file');
                }
            });
        } else {
            callback('Could not create new file, it may already exist!');
        }  
     });
};

// READ - Reading data from a file
lib.read = (dir, file, callback) => {
    fs.readFile(lib.baseDir + dir + '/' + file + '.json', 'utf8', (err, data) => {
        if (!err && data) {
            let parsedData = JSON.parse(data);
            callback(false, parsedData);
        } else {
            callback(err, data);
        } 
    });
};

// UPDATE - updating the file 
lib.update = (dir, file, data, callback) => {
    fs.open(lib.baseDir + dir + '/' + file +'.json', 'r+', (err, fd) => {
        if (!err && fd) {
            // Convert the data to string
            let stringData = JSON.stringify(data);

            // Truncate the file
            fs.ftruncate(fd, (err) => {
               if (!err) {
                // Write to the file and close
                fs.writeFile(fd, stringData, (err) => {
                    if (!err) {
                        fs.close(fd, (err) => {
                            if (!err) {
                                callback(false);
                            } else {
                                callback('Error closing the new file');
                            } 
                        });
                    } else {
                        callback('Error writing to existing file');
                    }
                });
               } else {
                   callback('Error truncating file');
               }  
            });
        } else {
            callback('Could not open the file for updating, it may not exist yet');
        }  
    });
};

// DELETE - delete the file
lib.delete = (dir, file, callback) => {
    //  Unlink the file
    fs.unlink(lib.baseDir + dir + '/' + file + '.json', (err) => {
        if (!err) {
            callback(false);
        } else {
            callback('Error deleting file');
        }  
    });
};

// List all the items in a directory
lib.list = (dir, callback) => {
    fs.readdir(lib.baseDir + dir + '/', (err, data) => {
        if (!err && data && data.length > 0) {
            let trimmedFileNames = [];
            data.forEach((fileName) => {
                trimmedFileNames.push(fileName.replace('.json', ''));
            });
            callback(false, trimmedFileNames);
        } else {
            callback(err, data);
        }
    });
};

// Export the library
module.exports = lib;