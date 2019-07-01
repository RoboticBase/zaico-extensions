#!/usr/bin/env python

import os
from flask import Flask

from src import api, vue, errors

VUE_DIR = '../vue-app/dist'
DEBUG = True

app = Flask(__name__,
            static_folder=os.path.join(VUE_DIR, 'static'),
            template_folder=VUE_DIR
            )
app.config.from_object(__name__)

zaiko_api_view = api.ZaikoAPI.as_view(api.ZaikoAPI.NAME)
app.add_url_rule('/api/v1/stocks/', defaults={'stock_id': None}, view_func=zaiko_api_view, methods=['GET', ])
app.add_url_rule('/api/v1/stocks/', view_func=zaiko_api_view, methods=['POST', ])
app.add_url_rule('/api/v1/stocks/<int:stock_id>/', view_func=zaiko_api_view, methods=['GET', 'PUT', 'DELETE'])

app.register_blueprint(vue.app)
app.register_blueprint(errors.app)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
