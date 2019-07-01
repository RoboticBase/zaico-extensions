#!/usr/bin/env python

import os
from flask import Flask

from src import vue

VUE_DIR = '../vue-app/dist'
DEBUG = True

app = Flask(__name__,
            static_folder=os.path.join(VUE_DIR, 'static'),
            template_folder=VUE_DIR
            )
app.config.from_object(__name__)

app.register_blueprint(vue.app)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
