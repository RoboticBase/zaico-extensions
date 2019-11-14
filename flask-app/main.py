#!/usr/bin/env python
import json
import os
import logging.config
from logging import getLogger

from flask import Flask

from src import api, const, vue, errors

try:
    with open(const.LOGGING_JSON, "r") as f:
        logging.config.dictConfig(json.load(f))
        if (const.LOG_LEVEL in os.environ and
                os.environ[const.LOG_LEVEL].upper() in ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL']):
            for handler in getLogger().handlers:
                if handler.get_name() in const.TARGET_HANDLERS:
                    handler.setLevel(getattr(logging, os.environ[const.LOG_LEVEL].upper()))
except FileNotFoundError:
    print(f'can not open {const.LOGGING_JSON}')
    pass

app = Flask(__name__,
            static_folder=const.VUE_STATIC_FOLDER,
            template_folder=const.VUE_TEMPLATE_FOLDER
            )
app.config.from_pyfile('config.cfg')

zaiko_api_view = api.ZaikoAPI.as_view(api.ZaikoAPI.NAME)
app.add_url_rule('/api/v1/stocks/', defaults={'stock_id': None}, view_func=zaiko_api_view, methods=['GET', ])
app.add_url_rule('/api/v1/stocks/<stock_id>/', view_func=zaiko_api_view, methods=['GET', ])

destination_api_view = api.DestinationAPI.as_view(api.DestinationAPI.NAME)
app.add_url_rule('/api/v1/destinations/', defaults={'destination_id': None}, view_func=destination_api_view, methods=['GET', ])
app.add_url_rule('/api/v1/destinations/<destination_id>/', view_func=destination_api_view, methods=['GET', ])

shipment_api_view = api.ShipmentAPI.as_view(api.ShipmentAPI.NAME)
app.add_url_rule('/api/v1/shipments/', view_func=shipment_api_view, methods=['POST', ])

app.register_blueprint(vue.app)
app.register_blueprint(errors.app)


if __name__ == '__main__':
    default_port = app.config['DEFAULT_PORT']
    try:
        port = int(os.environ.get(const.LISTEN_PORT, str(default_port)))
        if port < 1 or 65535 < port:
            port = default_port
    except ValueError:
        port = default_port

    app.run(host="0.0.0.0", port=port)
