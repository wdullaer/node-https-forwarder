HTTPS Forwarder
===============

[![Greenkeeper badge](https://badges.greenkeeper.io/wdullaer/node-https-forwarder.svg)](https://greenkeeper.io/)
This Nodejs program will redirect all incoming http request to the same host
using HTTPS. The port where the HTTPS server is listening can optionally be
specified.

Usage
=====
### Use the pre-built docker image
```bash
docker run wdullaer/node-https-forwarder
```

### Build from source
```bash
git clone https://github.com/wdullaer/node-https-forwarder.git
cd node-https-forwarder
docker build -t node-https_forwarder-image .
docker run node-https-forwarder_image
```


Configuration Variables
=======================
### Generic Options
- *PORT* - The port on which the server will bind for http traffic (default: 80)
- *FORWARD_PORT* - The port where traffic should be forwarded to (default: 443)

### Logging Options
- *LOGGING_LEVEL* - Verbosity of the logging (debug, info, warn, error)
- *ES_LOGGING_INSTANCE_PORT_9200_TCP_ADDR*: optional IP of the logger ES
- *ES_LOGGING_INSTANCE_PORT_9200_TCP_PORT*: optional Port of the logger ES


TODO
====
### Add automated testing
