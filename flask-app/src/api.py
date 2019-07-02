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
            code = result.status_code if result.status_code in (404, ) else 500
            abort(code, {
                'message': 'can not get stock list from zaico',
                'root_cause': result.json(),
            })
        else:
            return result.text

    def _detail(self, stock_id):
        result = requests.get(ZAICO_ENDPOINT + f'{stock_id}/', headers=self.headers)
        if result.status_code != 200:
            code = result.status_code if result.status_code in (404, ) else 500
            abort(code, {
                'message': 'can not get stock detail from zaico',
                'root_cause': result.json(),
            })
        else:
            return result.text


class DestinationAPI(MethodView):
    NAME = 'destinationapi'

    DESTINATIONS = [
        {
            'id': 0,
            'name': '',
        },
        {
            'id': 1,
            'name': 'LICTiA管理室',
        },
        {
            'id': 2,
            'name': 'オープンスペース',
        }
    ]

    def get(self, destination_id):
        if destination_id is None:
            return self._list()
        else:
            return self._detail(destination_id)

    def _list(self):
        return jsonify(DestinationAPI.DESTINATIONS)

    def _detail(self, destination_id):
        try:
            return jsonify(next(e for e in DestinationAPI.DESTINATIONS if e['id'] == int(destination_id)))
        except StopIteration:
            abort(404, {
                'message': f'destination(id={destination_id}) does not found',
            })
        except (TypeError, ValueError) as e:
            abort(404, {
                'message': 'can not get destination detail',
                'root_cause': str(e)
            })
