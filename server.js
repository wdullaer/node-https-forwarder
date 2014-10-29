// server.js
// Author: Wouter Dullaert (wouter.dullaert@toyota-europe.com)

// Forwards all requests to the same host using HTTPS
//The port where the https client is listening can be specified

// Environment Variables
// PORT: port number on which the server will bind
// FORWARD_PORT: port to which all requests will be forwarded
// LOGGING_LEVEL: Verbosity of log messages to be shown
// ES_LOGGING_INSTANCE_PORT_9200_TCP_ADDR: optional IP of the logger ES
// ES_LOGGING_INSTANCE_PORT_9200_TCP_PORT: optional Port of the logger ES
// =============================================================================

// Import the packages we are going to use
var express = require('express'); // Express Webserver library
var logger = require('winston'); // Logger library
var Elasticsearch = require('winston-elasticsearch').Elasticsearch; // ES output for winston

// Configure the winston logger
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    level : process.env.LOGGING_LEVEL || 'info',
    timestamp : true
});
if(process.env.ES_LOGGING_INSTANCE_PORT_9200_TCP_ADDR !== undefined) {
    var logIndexName = "node-logs";
    logger.add(logger.transports.Elasticsearch, {
        level : process.env.ES_LOGGING_LEVEL || process.env.LOGGING_LEVEL || 'info',
        fireAndForget : true,
        indexName : logIndexName,
        typeName : 'log',
        disable_fields : true,
        curlDebug : false,
        host : process.env.ES_LOGGING_INSTANCE_PORT_9200_TCP_ADDR,
        port : process.env.ES_LOGGING_INSTANCE_PORT_9200_TCP_PORT
    });
}

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
    var target = 'https' + '://' + req.get('host') + req.originalUrl + ':' + forwardPort;
    logger.debug('Redirect URL: '+target);
    res.statusCode = 303;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Location', target);
    res.end('Redirecting to <a href="'+encodeURI(target)+'">'+encodeURI(target)+'</a>\n');
});

// Make sure the app doesn't die when an error occurs
app.use(function(err, req, res, next) {
    if(!err) return next();
    logger.warn(err.stack);
    res.status(500).send("An unexpected error occured.\n");
});

// Start the server
var server = app.listen(app.get('port'), function() {
    logger.info("Server started listening on port "+ app.get('port'));
});

// Handle SIGTERM gracefully
process.on('SIGTERM', function(){
    // Serve existing requests, but refuse new ones
    logger.warn("Received SIGTERM: wrapping up existing requests");
    server.close(function(){
        // Exit once all existing requests have been served
        logger.warn("Received SIGTERM: done serving existing requests. Exiting");
        process.exit(0);
    });
});
