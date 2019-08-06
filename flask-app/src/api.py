import os

from flask import abort, jsonify, request
from flask.views import MethodView

from src import const

import requests

ZAICO_TOKEN = os.environ.get(const.ZAICO_TOKEN, '')
ZAICO_HEADER = {
    'Authorization': f'Bearer {ZAICO_TOKEN}',
    'Content-Type': 'application/json'
}
SHIPMENTAPI_ENDPOINT = os.environ[const.SHIPMENTAPI_ENDPOINT]

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


class ZaikoAPI(MethodView):
    NAME = 'stockapi'

    def get(self, stock_id):
        if stock_id is None:
            return self._list()
        else:
            return self._detail(stock_id)

    def _list(self):
        result = requests.get(const.ZAICO_ENDPOINT, headers=ZAICO_HEADER)
        # FIXME: check 'Total-Count' header and pagenation
        if result.status_code != 200:
            code = result.status_code if result.status_code in (404, ) else 500
            abort(code, {
                'message': 'can not get stock list from zaico',
                'root_cause': result.json(),
            })
        else:
            return result.text

    def _detail(self, stock_id):
        result = requests.get(const.ZAICO_ENDPOINT + f'{stock_id}/', headers=ZAICO_HEADER)
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

    def get(self, destination_id):
        if destination_id is None:
            return self._list()
        else:
            return self._detail(destination_id)

    def _list(self):
        return jsonify(DESTINATIONS)

    def _detail(self, destination_id):
        try:
            return jsonify(next(e for e in DESTINATIONS if e['id'] == int(destination_id)))
        except StopIteration:
            abort(404, {
                'message': f'destination(id={destination_id}) does not found',
            })
        except (TypeError, ValueError) as e:
            abort(404, {
                'message': 'can not get destination detail',
                'root_cause': str(e)
            })


class ShipmentAPI(MethodView):
    NAME = 'shipmentapi'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._shipmentapi_header = {
            'Content-Type': 'application/json'
        }
        if const.SHIPMENTAPI_TOKEN in os.environ:
            self._shipmentapi_header['Authorization'] = f'Bearer {os.environ[const.SHIPMENTAPI_TOKEN]}'

    def post(self):
        payload = request.json

        if not isinstance(payload, dict):
            abort(400, {
                'message': 'invalid payload',
            })

        # FIXME: transaction control
        res = self._update_zaico(payload)
        self._notify_shipment(res)

        return jsonify(res), 201

    def _update_zaico(self, payload):
        res = {
            'result': None,
            'destination': {},
            'updated': [],
        }

        # FIXME: exclusion control
        for elem in payload['items']:
            reservation = int(float(elem.get('reservation', '0')))
            id = elem.get('id', '0')
            url = const.ZAICO_ENDPOINT + f'{id}/'

            result = requests.get(url, headers=ZAICO_HEADER)
            if result.status_code != 200:
                code = result.status_code if result.status_code in (404, ) else 500
                abort(code, {
                    'message': 'can not get stock detail from zaico',
                    'root_cause': result.json(),
                })
            current_item = result.json()
            current_quantity = int(float(current_item['quantity']))

            new_quantity = current_quantity - reservation
            if new_quantity < 0:
                abort(400, {
                    'message': f'current quantity ({current_quantity}) is less than the reservation ({reservation})'
                })

            result = requests.put(url, headers=ZAICO_HEADER, json={'quantity': new_quantity})
            if result.status_code not in (200, 201, ):
                code = result.status_code if result.status_code in (404, ) else 500
                abort(code, {
                    'message': 'can not put stock detail to zaico',
                    'root_cause': result.json(),
                })

            res['updated'].append({
                'id': id,
                'prev_quantity': current_quantity,
                'new_quantity': new_quantity,
                'reservation': reservation,
                'title': current_item['title'],
                'unit': current_item['unit'],
                'category': current_item['category'],
                'place': current_item['place'],
                'code': current_item['code'],
            })
        destination = next(e for e in DESTINATIONS if e['id'] == int(payload['destination_id']))

        res['result'] = 'success'
        res['destination'] = destination

        return res

    def _notify_shipment(self, res):
        result = requests.post(SHIPMENTAPI_ENDPOINT, headers=self._shipmentapi_header, json=res)
        return result
