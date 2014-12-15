# Simple node server that forwards all requests to the same host using HTTPS
#
# Usage: docker run --link=<logging_container>:es_logging_instance -e PORT=<port_number> -e LOGGING_LEVEL=<debug/info/warn/error> --name <container_name> <image_name>
#
# Version 1.0

FROM dockerfile/nodejs
MAINTAINER Wouter Dullaert, wouter.dullaert@gmail.com

# Get our dependencies
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /opt/server && \
    cp -a /tmp/node_modules /opt/server

# Copy our application program from the context
WORKDIR /opt/server
ADD server.js /opt/server/

# Expose the webserver port
EXPOSE 80

# Run the application when the container starts
CMD ["node", "server.js"]
