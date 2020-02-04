# zaico-extensions
A web application to bridge cloud inventory control service and RoboticBase

[![TravisCI Status](https://travis-ci.org/RoboticBase/zaico-extensions.svg?branch=master)](https://travis-ci.org/RoboticBase/zaico-extensions/)

## Description
This application bridges a cloud warehouse service and [RoboticBase](https://github.com/RoboticBase/).

This application was used in a PoC demonstrated by TIS and UoA in November 2019.

## Requirements

* python 3.7 or higher
* node 10.16 or higher

## Environment Variables
This application accepts some Environment Variables like below:

|Environment Variable|Summary|Mandatory|Default|
|:--|:--|:--|:--|
|`LOG_LEVEL`|log level(DEBUG, INFO, WARNING, ERRRO, CRITICAL)|||
|`LISTEN_PORT`|listen port of this service|YES|3000|
|`ZAICO_TOKEN`|bearer token of cloud warehouse service|YES||
|`SHIPMENTAPI_ENDPOINT`|the endpoint of shipment rest api on RoboticBase|YES||
|`SHIPMENTAPI_TOKEn`|the bearer token of shipment rest api on RoboticBase|||
|`DESTINATIONS`|the list of destinations like below (JSON format string):<br/>`[{"id": 1, "name": "destination1"}, {"id": 2, "name": "destination2"}]`|YES||

## License

[Apache License 2.0](/LICENSE)

## Copyright
Copyright (c) 2019 [TIS Inc.](https://www.tis.co.jp/)
