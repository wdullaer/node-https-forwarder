// server.js
// Author: Wouter Dullaert (wouter.dullaert@gmail.com)

// Forwards all requests to the same host using HTTPS
//The port where the https client is listening can be specified

// Environment Variables
// PORT: port number on which the server will bind
// FORWARD_PORT: port to which all requests will be forwarded
// LOGGING_LEVEL: Verbosity of log messages to be shown
// ES_LOGGING_INSTANCE_PORT_9200_TCP_ADDR: optional IP of the logger ES
// ES_LOGGING_INSTANCE_PORT_9200_TCP_PORT: optional Port of the logger ES
// =============================================================================
'use strict';

// Import the packages we are going to use
var express = require('express'); // Express Webserver library
var logger = require('winston'); // Logger library

// Configure the winston logger
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    level : process.env.LOGGING_LEVEL || 'info',
    timestamp : true
});

// Default port to listen on
var defaultPort = 80;
var forwardPort = process.env.FORWARD_PORT || 443;

// Create the express app
var app = express();

// Configure our app
app.set('port', process.env.PORT || defaultPort);

// Main page route
app.all('/*', function(req,res) {
    logger.debug('Received a request');
    var target = 'https' + '://' + req.get('host') + ':' +forwardPort + req.originalUrl;
    logger.debug('Redirect URL: '+target);
    res.statusCode = 303;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Location', target);
    res.end('Redirecting to <a href="'+encodeURI(target)+'">'+encodeURI(target)+'</a>\n');
});

// Start the server
var server = app.listen(app.get('port'), function() {
    logger.info("Server started listening on port "+ app.get('port'));
});

// Handle SIGTERM gracefully
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('SIGHUP', gracefulShutdown);

function gracefulShutdown() {
  // Serve existing requests, but refuse new ones
  logger.warn('Received signal to terminate: wrapping up existing requests');
  server.close(function() {
    // Exit once all existing requests have been served
    logger.warn('Received signal to terminate: done serving existing requests. Exiting');
    process.exit(0);
  });
}
