import os
from logging import getLogger

from flask import abort, jsonify, request
from flask.views import MethodView

from src import const
from src.errors import RobotBusyError, RBError

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
        'name': '会議室1中',
    },
    {
        'id': 2,
        'name': '会議室2中',
    },
    {
        'id': 3,
        'name': '会議室3中',
    }

]

logger = getLogger(__name__)


class ZaikoAPI(MethodView):
    NAME = 'stockapi'

    def get(self, stock_id):
        if stock_id is None:
            return self._list()
        else:
            return self._detail(stock_id)

    def _list(self):
        logger.debug(f'ZaikoAPI._list')
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
        logger.debug(f'ZaikoAPI._detail, stock_id={stock_id}')
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
        logger.debug(f'DestinationAPI._list')
        return jsonify(DESTINATIONS)

    def _detail(self, destination_id):
        logger.debug(f'DestinationAPI._detail, destination_id={destination_id}')
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


class RBMixin:
    def __init__(self, *args, **kwargs):
        self._rb_headers = None

    @property
    def rb_headers(self):
        if not self._rb_headers:
            self._rb_headers = {
                'Content-Type': 'application/json'
            }
            if const.SHIPMENTAPI_TOKEN in os.environ:
                self._rb_headers['Authorization'] = f'Bearer {os.environ[const.SHIPMENTAPI_TOKEN]}'
        return self._rb_headers


class ShipmentAPI(RBMixin, MethodView):
    NAME = 'shipmentapi'

    def post(self):
        logger.debug(f'ShipmentAPI.post')
        payload = request.json

        if not isinstance(payload, dict):
            abort(400, {
                'message': 'invalid payload',
            })

        try:
            zaico_res = self._update_zaico(payload)
            logger.info(f'zaico_result {zaico_res}')

            rb_res = self._notify_shipment(zaico_res)
            logger.info(f'rb_result {rb_res}')

            zaico_res.update(rb_res)
            logger.info(f'shipment success, result={zaico_res}')
            return jsonify(zaico_res), 201
        except RobotBusyError as e:
            is_compensated, compensated = self._compensate_zaico(zaico_res)
            if is_compensated:
                logger.warn(f'shipment failure bacause robot is busy, but compensated successfully compensated={compensated}')
                return jsonify({'result': 'robot_busy', 'message': str(e), 'robot_id': e.robot_id}), e.status_code
            else:
                logger.error(f'compensatation of Zaico is failed in RobotBusyError, {compensated}')
                abort(500, {
                    'message': 'can not get destination detail',
                    'root_cause': str(e)
                })
        except Exception as e:
            is_compensated, compensated = self._compensate_zaico(zaico_res)
            if is_compensated:
                logger.warn(f'shipment failure, but compensated successfully compensated={compensated}')
            else:
                logger.error(f'compensatation of Zaico is failed, {compensated}')
            abort(500, {
                'message': 'exception occured when notify shipment',
                'root_cause': str(e)
            })

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
                'item_image': current_item['item_image'],
            })
        destination = next(e for e in DESTINATIONS if e['id'] == int(payload['destination_id']))

        res['result'] = 'success'
        res['destination'] = destination

        return res

    def _compensate_zaico(self, zaico_res):
        is_compensated = True
        compensated = {
            'automatically_compensated': [],
            'need_to_manual_compensate': [],
        }

        for elem in zaico_res['updated']:
            id = elem['id']
            prev_quantity = elem['prev_quantity']
            url = const.ZAICO_ENDPOINT + f'{id}/'

            result = requests.put(url, headers=ZAICO_HEADER, json={'quantity': prev_quantity})

            if result.status_code not in (200, 201, ):
                is_compensated = False
                compensated['need_to_manual_compensate'].append(elem)
            else:
                compensated['automatically_compensated'].append(elem)

        logger.info(f'compensate zaico result: is_compensated={is_compensated}, compensated={compensated}')
        return is_compensated, compensated

    def _notify_shipment(self, res):
        res['caller'] = const.CALLER_NAME
        result = requests.post(SHIPMENTAPI_ENDPOINT, headers=self.rb_headers, json=res)
        if 200 <= result.status_code < 300:
            return result.json()
        elif result.status_code in [422, 423]:
            j = result.json()
            raise RobotBusyError(j['message'], status_code=result.status_code, robot_id=j.get('id', None))
        else:
            raise RBError(result.text, status_code=result.status_code)
