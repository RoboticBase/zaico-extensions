import os

from flask import abort, jsonify
from flask.views import MethodView

import requests

ZAICO_ENDPOINT = 'https://web.zaico.co.jp/api/v1/inventories/'
TOKEN = os.environ.get('TOKEN', '')


class ZaikoAPI(MethodView):
    NAME = 'stockapi'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.headers = {
            'Authorization': f'Bearer {TOKEN}',
            'Content-Type': 'application/json'
        }

    def get(self, stock_id):
        if stock_id is None:
            return self._list()
        else:
            return self._detail(stock_id)

    def _list(self):
        result = requests.get(ZAICO_ENDPOINT, headers=self.headers)
        # FIX ME check 'Total-Count' header and pagenation
        if result.status_code != 200:
            abort(500, {
                'message': 'can not get stock list from zaico',
                'root_cause': result.json(),
            })
        else:
            return result.text

    def _detail(self, stock_id):
        result = requests.get(ZAICO_ENDPOINT + f'{stock_id}/', headers=self.headers)
        if result.status_code != 200:
            abort(500, {
                'message': 'can not get stock detail from zaico',
                'root_cause': result.json(),
            })
        else:
            return result.text
