import os
import json
import importlib
from unittest.mock import call

import requests

import pytest
import lazy_import

api = lazy_import.lazy_module('src.api')
const = lazy_import.lazy_module('src.const')
errors = lazy_import.lazy_module('src.errors')


@pytest.fixture(scope='function')
def inject_mock(mocker):
    api.requests = mocker.MagicMock()
    yield


@pytest.fixture(scope='function')
def reset_destinations():
    api.DESTINATIONS = json.loads(os.environ[const.DESTINATIONS])
    yield


@pytest.fixture(scope='function')
def set_shipment_token():
    api.SHIPMENTAPI_TOKEN = os.environ.get(const.SHIPMENTAPI_TOKEN, None)
    yield


@pytest.mark.usefixtures('inject_mock', 'reset_destinations')
class TestZaikoAPI:

    @pytest.mark.parametrize('stock_id', [
        None, 'stock_01',
    ])
    def test_success(self, mocker, app, stock_id):
        path = '/api/v1/stocks/'
        text = 'respone text'
        mocked_response = requests.Response()
        mocked_response.status_code = 200
        mocked_response._content = text.encode('utf-8')

        api.requests.get.return_value = mocked_response

        if stock_id is not None:
            path = f'{path}{stock_id}/'

        response = app.test_client().get(path)
        assert response.status_code == 200
        assert response.data.decode('utf-8') == text
        assert api.requests.get.call_count == 1
        if stock_id is not None:
            assert api.requests.get.call_args == call(const.ZAICO_ENDPOINT + f'{stock_id}/', headers=api.ZAICO_HEADER)
        else:
            assert api.requests.get.call_args == call(const.ZAICO_ENDPOINT, headers=api.ZAICO_HEADER)

    @pytest.mark.parametrize('requests_status, result_status, content', [
        (400, 500, {'result': 'error', 'status_code': 400}),
        (404, 404, {'result': 'error', 'status_code': 404}),
        (500, 500, {'result': 'error', 'status_code': 500}),
    ])
    @pytest.mark.parametrize('stock_id', [
        None, 'stock_01',
    ])
    def test_error(self, mocker, app, stock_id, requests_status, result_status, content):
        path = '/api/v1/stocks/'
        mocked_response = requests.Response()
        mocked_response.status_code = requests_status
        mocked_response._content = json.dumps(content).encode('utf-8')

        api.requests.get.return_value = mocked_response

        if stock_id is not None:
            path = f'{path}{stock_id}/'
            message = 'can not get stock detail from zaico'
        else:
            message = 'can not get stock list from zaico'

        response = app.test_client().get(path)

        assert response.status_code == result_status
        assert response.json == {'message': message, 'root_cause': content}
        assert api.requests.get.call_count == 1
        if stock_id is not None:
            assert api.requests.get.call_args == call(const.ZAICO_ENDPOINT + f'{stock_id}/', headers=api.ZAICO_HEADER)
        else:
            assert api.requests.get.call_args == call(const.ZAICO_ENDPOINT, headers=api.ZAICO_HEADER)


class TestDestinationAPI:

    @pytest.mark.parametrize('destinations', [
        '[]',
        '[{"id": 1, "name": "dest_01"}, {"id": 2, "name": "dest_02"}]',
    ])
    def test_list_success(self, app, destinations):
        os.environ[const.DESTINATIONS] = destinations
        importlib.reload(api)
        path = '/api/v1/destinations/'

        response = app.test_client().get(path)
        assert response.status_code == 200
        assert response.json == json.loads(destinations)

    @pytest.mark.parametrize('destinations', [
        '{}',
        '{"id": 1, "name": "dest_01"}',
        '1e-1',
        '-100',
    ])
    def test_list_server_error(self, app, destinations):
        os.environ[const.DESTINATIONS] = destinations
        importlib.reload(api)
        path = '/api/v1/destinations/'

        response = app.test_client().get(path)
        assert response.status_code == 500
        assert response.json == {'message': 'invalid DESTINATIONS'}

    @pytest.mark.parametrize('destinations', [
        'abcde',
        'None',
        'True',
    ])
    def test_list_exception(self, destinations):
        os.environ[const.DESTINATIONS] = destinations
        with pytest.raises(json.decoder.JSONDecodeError):
            importlib.reload(api)
            api.DESTINATIONS

    @pytest.mark.parametrize('destinations', [
        '[{"id": 1, "name": "dest_01"}]',
        '[{"id": 1, "name": "dest_01"}, {"id": 2, "name": "dest_02"}]',
        '[{"id": 2, "name": "dest_02"}, {"id": 1, "name": "dest_01"}]',
    ])
    @pytest.mark.parametrize('d_id, status_code, expected', [
        ('1', 200, {'id': 1, 'name': 'dest_01'}),
        (1, 200, {'id': 1, 'name': 'dest_01'}),
        (999, 404, {'message': 'destination(id=999) does not found'}),
        ('abc', 404, {
            'message': 'can not get destination detail',
            'root_cause': "invalid literal for int() with base 10: 'abc'",
        }),
        (True, 404, {
            'message': 'can not get destination detail',
            'root_cause': "invalid literal for int() with base 10: 'True'",
        }),
        (None, 404, {
            'message': 'can not get destination detail',
            'root_cause': "invalid literal for int() with base 10: 'None'",
        }),
        ([], 404, {
            'message': 'can not get destination detail',
            'root_cause': "invalid literal for int() with base 10: '[]'",
        }),
        ({}, 404, {
            'message': 'can not get destination detail',
            'root_cause': "invalid literal for int() with base 10: '{}'",
        }),
    ])
    def test_detail_success(self, app, destinations, d_id, status_code, expected):
        os.environ[const.DESTINATIONS] = destinations
        importlib.reload(api)
        path = f'/api/v1/destinations/{d_id}/'

        response = app.test_client().get(path)
        assert response.status_code == status_code
        assert response.json == expected

    @pytest.mark.parametrize('destinations', [
        '{}',
        '{"id": 1, "name": "dest_01"}',
        '[1, 2, 3]',
        '[{"id": 1, "name": "dest_01"}, {}]',
        '1e-1',
        '-100',
    ])
    def test_detail_server_error(self, app, destinations):
        os.environ[const.DESTINATIONS] = destinations
        importlib.reload(api)
        path = f'/api/v1/destinations/1/'

        response = app.test_client().get(path)
        assert response.status_code == 500
        assert response.json == {'message': 'invalid DESTINATIONS'}


@pytest.mark.usefixtures('inject_mock', 'reset_destinations')
class TestShipmentAPI:
    PATH = '/api/v1/shipments/'
    HEADERS = {'content-type': 'application/json'}

    def _test_success_one_item(self, mocker, app, quantity, reservation):
        mocked_get_zaico_response = requests.Response()
        mocked_get_zaico_response.status_code = 200
        mocked_get_zaico_response._content = json.dumps({
            'quantity': quantity,
            'title': 'item 01',
            'unit': 'unit',
            'category': 'category',
            'place': 'place 01',
            'code': 'code 01',
            'item_image': 'item_image',
        }).encode('utf-8')
        api.requests.get.return_value = mocked_get_zaico_response

        mocked_update_zaico_response = requests.Response()
        mocked_update_zaico_response.status_code = 200
        mocked_update_zaico_response._content = json.dumps({}).encode('utf-8')
        api.requests.put.return_value = mocked_update_zaico_response

        mocked_post_shipment_response = requests.Response()
        mocked_post_shipment_response.status_code = 200
        mocked_post_shipment_response._content = json.dumps({
            'notify_shipment': 'success'
        }).encode('utf-8')
        api.requests.post.return_value = mocked_post_shipment_response

        payload = {
            'destination_id': '1',
            'items': [
                {
                    'id': 10,
                    'reservation': reservation,
                },
            ],
        }

        response = app.test_client().post(self.PATH, headers=self.HEADERS, json=payload)
        assert response.status_code == 201
        assert response.json == {
            'result': 'success',
            'destination': {
                'id': 1,
                'name': 'dest_01'
            },
            'updated': [
                {
                    'id': 10,
                    'prev_quantity': quantity,
                    'new_quantity': quantity - reservation,
                    'reservation': reservation,
                    'title': 'item 01',
                    'unit': 'unit',
                    'category': 'category',
                    'place': 'place 01',
                    'code': 'code 01',
                    'item_image': 'item_image'
                }
            ],
            'caller': const.CALLER_NAME,
            'notify_shipment': 'success',
        }
        assert api.requests.get.call_count == 1
        assert api.requests.get.call_args == call(
            f'{const.ZAICO_ENDPOINT}10/',
            headers={
                'Authorization': f'Bearer {const.ZAICO_TOKEN}',
                'Content-Type': 'application/json'
            }
        )
        assert api.requests.put.call_count == 1
        assert api.requests.put.call_args == call(
            f'{const.ZAICO_ENDPOINT}10/',
            headers={
                'Authorization': f'Bearer {const.ZAICO_TOKEN}',
                'Content-Type': 'application/json'
            },
            json={
                'quantity': quantity - reservation,
            }
        )
        assert api.requests.post.call_count == 1

    @pytest.mark.parametrize('quantity, reservation', [
        (10, 1),
        (10, 10),
    ])
    def test_success_one_item(self, mocker, app, quantity, reservation):
        self._test_success_one_item(mocker, app, quantity, reservation)
        assert api.requests.post.call_args == call(
            const.SHIPMENTAPI_ENDPOINT,
            headers={
                'Content-Type': 'application/json'
            },
            json={
                'result': 'success',
                'destination': {
                    'id': 1,
                    'name': 'dest_01'
                },
                'updated': [
                    {
                        'id': 10,
                        'prev_quantity': quantity,
                        'new_quantity': quantity - reservation,
                        'reservation': reservation,
                        'title': 'item 01',
                        'unit': 'unit',
                        'category': 'category',
                        'place': 'place 01',
                        'code': 'code 01',
                        'item_image': 'item_image'
                    }
                ],
                'caller': const.CALLER_NAME,
            }
        )

    @pytest.mark.parametrize('quantity, reservation', [
        (10, 1),
        (10, 10),
    ])
    def test_success_with_shipment_token(self, mocker, app, quantity, reservation):
        os.environ[const.SHIPMENTAPI_TOKEN] = 'SHIPMENTAPI_TOKEN'
        api.SHIPMENTAPI_TOKEN = os.environ.get(const.SHIPMENTAPI_TOKEN, None)
        self._test_success_one_item(mocker, app, quantity, reservation)
        assert api.requests.post.call_args == call(
            const.SHIPMENTAPI_ENDPOINT,
            headers={
                'Authorization': f'Bearer SHIPMENTAPI_TOKEN',
                'Content-Type': 'application/json'
            },
            json={
                'result': 'success',
                'destination': {
                    'id': 1,
                    'name': 'dest_01'
                },
                'updated': [
                    {
                        'id': 10,
                        'prev_quantity': quantity,
                        'new_quantity': quantity - reservation,
                        'reservation': reservation,
                        'title': 'item 01',
                        'unit': 'unit',
                        'category': 'category',
                        'place': 'place 01',
                        'code': 'code 01',
                        'item_image': 'item_image'
                    }
                ],
                'caller': const.CALLER_NAME,
            }
        )
        del os.environ[const.SHIPMENTAPI_TOKEN]
        api.SHIPMENTAPI_TOKEN = os.environ.get(const.SHIPMENTAPI_TOKEN, None)

    def test_success_two_items(self, mocker, app):
        mocked_get_zaico_response_1 = requests.Response()
        mocked_get_zaico_response_1.status_code = 200
        mocked_get_zaico_response_1._content = json.dumps({
            'quantity': 10,
            'title': 'item 01',
            'unit': 'unit',
            'category': 'category',
            'place': 'place 01',
            'code': 'code 01',
            'item_image': 'item_image_1',
        }).encode('utf-8')

        mocked_get_zaico_response_2 = requests.Response()
        mocked_get_zaico_response_2.status_code = 200
        mocked_get_zaico_response_2._content = json.dumps({
            'quantity': 20,
            'title': 'item 02',
            'unit': 'unit',
            'category': 'category',
            'place': 'place 02',
            'code': 'code 02',
            'item_image': 'item_image_2',
        }).encode('utf-8')

        def get_return_value():
            cnt = 0

            def _result(*args, **kwargs):
                nonlocal cnt
                cnt += 1
                if cnt == 1:
                    return mocked_get_zaico_response_1
                else:
                    return mocked_get_zaico_response_2
            return _result

        api.requests.get.side_effect = get_return_value()

        mocked_update_zaico_response = requests.Response()
        mocked_update_zaico_response.status_code = 200
        mocked_update_zaico_response._content = json.dumps({}).encode('utf-8')
        api.requests.put.return_value = mocked_update_zaico_response

        mocked_post_shipment_response = requests.Response()
        mocked_post_shipment_response.status_code = 200
        mocked_post_shipment_response._content = json.dumps({
            'notify_shipment': 'success'
        }).encode('utf-8')
        api.requests.post.return_value = mocked_post_shipment_response

        payload = {
            'destination_id': '1',
            'items': [
                {
                    'id': 1,
                    'reservation': 2,
                },
                {
                    'id': 2,
                    'reservation': 3,
                },
            ],
        }

        response = app.test_client().post(self.PATH, headers=self.HEADERS, json=payload)
        assert response.status_code == 201
        assert response.json == {
            'result': 'success',
            'destination': {
                'id': 1,
                'name': 'dest_01'
            },
            'updated': [
                {
                    'id': 1,
                    'prev_quantity': 10,
                    'new_quantity': 8,
                    'reservation': 2,
                    'title': 'item 01',
                    'unit': 'unit',
                    'category': 'category',
                    'place': 'place 01',
                    'code': 'code 01',
                    'item_image': 'item_image_1'
                },
                {
                    'id': 2,
                    'prev_quantity': 20,
                    'new_quantity': 17,
                    'reservation': 3,
                    'title': 'item 02',
                    'unit': 'unit',
                    'category': 'category',
                    'place': 'place 02',
                    'code': 'code 02',
                    'item_image': 'item_image_2'
                },
            ],
            'caller': const.CALLER_NAME,
            'notify_shipment': 'success',
        }
        assert api.requests.get.call_count == 2
        assert api.requests.get.call_args_list[0] == call(
            f'{const.ZAICO_ENDPOINT}1/',
            headers={
                'Authorization': f'Bearer {const.ZAICO_TOKEN}',
                'Content-Type': 'application/json'
            }
        )
        assert api.requests.get.call_args_list[1] == call(
            f'{const.ZAICO_ENDPOINT}2/',
            headers={
                'Authorization': f'Bearer {const.ZAICO_TOKEN}',
                'Content-Type': 'application/json'
            }
        )

        assert api.requests.put.call_count == 2
        assert api.requests.put.call_args_list[0] == call(
            f'{const.ZAICO_ENDPOINT}1/',
            headers={
                'Authorization': f'Bearer {const.ZAICO_TOKEN}',
                'Content-Type': 'application/json'
            },
            json={
                'quantity': 8,
            }
        )
        assert api.requests.put.call_args_list[1] == call(
            f'{const.ZAICO_ENDPOINT}2/',
            headers={
                'Authorization': f'Bearer {const.ZAICO_TOKEN}',
                'Content-Type': 'application/json'
            },
            json={
                'quantity': 17,
            }
        )

        assert api.requests.post.call_count == 1
        assert api.requests.post.call_args == call(
            const.SHIPMENTAPI_ENDPOINT,
            headers={
                'Content-Type': 'application/json'
            },
            json={
                'result': 'success',
                'destination': {
                    'id': 1,
                    'name': 'dest_01'
                },
                'updated': [
                    {
                        'id': 1,
                        'prev_quantity': 10,
                        'new_quantity': 8,
                        'reservation': 2,
                        'title': 'item 01',
                        'unit': 'unit',
                        'category': 'category',
                        'place': 'place 01',
                        'code': 'code 01',
                        'item_image': 'item_image_1'
                    },
                    {
                        'id': 2,
                        'prev_quantity': 20,
                        'new_quantity': 17,
                        'reservation': 3,
                        'title': 'item 02',
                        'unit': 'unit',
                        'category': 'category',
                        'place': 'place 02',
                        'code': 'code 02',
                        'item_image': 'item_image_2'
                    },
                ],
                'caller': const.CALLER_NAME,
            }
        )

    def test_success_no_item(self, mocker, app):
        mocked_post_shipment_response = requests.Response()
        mocked_post_shipment_response.status_code = 200
        mocked_post_shipment_response._content = json.dumps({
            'notify_shipment': 'success'
        }).encode('utf-8')
        api.requests.post.return_value = mocked_post_shipment_response

        payload = {
            'destination_id': '1',
            'items': [],
        }

        response = app.test_client().post(self.PATH, headers=self.HEADERS, json=payload)
        assert response.status_code == 201
        assert response.json == {
            'result': 'success',
            'destination': {
                'id': 1,
                'name': 'dest_01'
            },
            'updated': [],
            'caller': const.CALLER_NAME,
            'notify_shipment': 'success',
        }
        assert api.requests.get.call_count == 0
        assert api.requests.put.call_count == 0
        assert api.requests.post.call_count == 1
        assert api.requests.post.call_args == call(
            const.SHIPMENTAPI_ENDPOINT,
            headers={
                'Content-Type': 'application/json'
            },
            json={
                'result': 'success',
                'destination': {
                    'id': 1,
                    'name': 'dest_01'
                },
                'updated': [],
                'caller': const.CALLER_NAME,
            }
        )

    @pytest.mark.parametrize('quantity, reservation', [
        (10, 11),
        (0, 1),
    ])
    def test_less_quantity(self, mocker, app, quantity, reservation):
        mocked_get_zaico_response = requests.Response()
        mocked_get_zaico_response.status_code = 200
        mocked_get_zaico_response._content = json.dumps({
            'quantity': quantity,
            'title': 'item 01',
            'unit': 'unit',
            'category': 'category',
            'place': 'place 01',
            'code': 'code 01',
            'item_image': 'item_image',
        }).encode('utf-8')
        api.requests.get.return_value = mocked_get_zaico_response

        payload = {
            'destination_id': '1',
            'items': [
                {
                    'id': 10,
                    'reservation': reservation,
                },
            ],
        }

        response = app.test_client().post(self.PATH, headers=self.HEADERS, json=payload)
        assert response.status_code == 400
        assert response.json == {
            'message': f'LessQuantityError',
            'root_cause': f'current quantity({quantity}) is less than the reservation({reservation})'
        }
        assert api.requests.get.call_count == 1
        assert api.requests.get.call_args == call(
            f'{const.ZAICO_ENDPOINT}10/',
            headers={
                'Authorization': f'Bearer {const.ZAICO_TOKEN}',
                'Content-Type': 'application/json'
            }
        )
        assert api.requests.put.call_count == 0
        assert api.requests.post.call_count == 0

    @pytest.mark.parametrize('shipment_error_code', [
        422,
        423,
        500,
    ])
    @pytest.mark.parametrize('shipment_error_body', [
        {'id': 1, 'message': 'shipment error'},
        {},
    ])
    def test_fail_notify_shipment(self, mocker, app, shipment_error_code, shipment_error_body):
        quantity = 10
        reservation = 1
        mocked_get_zaico_response = requests.Response()
        mocked_get_zaico_response.status_code = 200
        mocked_get_zaico_response._content = json.dumps({
            'quantity': quantity,
            'title': 'item 01',
            'unit': 'unit',
            'category': 'category',
            'place': 'place 01',
            'code': 'code 01',
            'item_image': 'item_image',
        }).encode('utf-8')
        api.requests.get.return_value = mocked_get_zaico_response

        mocked_update_zaico_response = requests.Response()
        mocked_update_zaico_response.status_code = 200
        mocked_update_zaico_response._content = json.dumps({}).encode('utf-8')
        api.requests.put.return_value = mocked_update_zaico_response

        mocked_post_shipment_response = requests.Response()
        mocked_post_shipment_response.status_code = shipment_error_code
        mocked_post_shipment_response._content = json.dumps(shipment_error_body).encode('utf-8')
        api.requests.post.return_value = mocked_post_shipment_response

        payload = {
            'destination_id': '1',
            'items': [
                {
                    'id': 10,
                    'reservation': reservation,
                },
            ],
        }

        response = app.test_client().post(self.PATH, headers=self.HEADERS, json=payload)
        assert response.status_code == shipment_error_code
        if shipment_error_code in (422, 423,):
            rid = 1 if 'id' in shipment_error_body else None
            emsg = shipment_error_body['message'] if 'message' in shipment_error_body else ''
            assert response.json == {
                'result': 'robot_busy',
                'message': f"('RobotBusyError, status_code={shipment_error_code}, robot_id={rid}', '{emsg}')",
                'robot_id': rid
            }
        else:
            assert response.json == {
                'message': 'exception occured when notify shipment',
                'root_cause': 'RBError, status_code=500',
            }
        assert api.requests.get.call_count == 1
        assert api.requests.get.call_args == call(
            f'{const.ZAICO_ENDPOINT}10/',
            headers={
                'Authorization': f'Bearer {const.ZAICO_TOKEN}',
                'Content-Type': 'application/json'
            }
        )
        assert api.requests.put.call_count == 2
        assert api.requests.put.call_args_list[0] == call(
            f'{const.ZAICO_ENDPOINT}10/',
            headers={
                'Authorization': f'Bearer {const.ZAICO_TOKEN}',
                'Content-Type': 'application/json'
            },
            json={
                'quantity': quantity - reservation,
            }
        )
        assert api.requests.put.call_args_list[1] == call(
            f'{const.ZAICO_ENDPOINT}10/',
            headers={
                'Authorization': f'Bearer {const.ZAICO_TOKEN}',
                'Content-Type': 'application/json'
            },
            json={
                'quantity': quantity
            }
        )

        assert api.requests.post.call_count == 1
        assert api.requests.post.call_args == call(
            const.SHIPMENTAPI_ENDPOINT,
            headers={
                'Content-Type': 'application/json'
            },
            json={
                'result': 'success',
                'destination': {
                    'id': 1,
                    'name': 'dest_01'
                },
                'updated': [
                    {
                        'id': 10,
                        'prev_quantity': quantity,
                        'new_quantity': quantity - reservation,
                        'reservation': reservation,
                        'title': 'item 01',
                        'unit': 'unit',
                        'category': 'category',
                        'place': 'place 01',
                        'code': 'code 01',
                        'item_image': 'item_image'
                    }
                ],
                'caller': const.CALLER_NAME,
            }
        )

    @pytest.mark.parametrize('shipment_error_code', [
        422,
        423,
        500,
    ])
    @pytest.mark.parametrize('shipment_error_body', [
        {'id': 1, 'message': 'shipment error'},
        {},
    ])
    def test_fail_compensate(self, mocker, app, shipment_error_code, shipment_error_body):
        quantity = 10
        reservation = 1
        mocked_get_zaico_response = requests.Response()
        mocked_get_zaico_response.status_code = 200
        mocked_get_zaico_response._content = json.dumps({
            'quantity': quantity,
            'title': 'item 01',
            'unit': 'unit',
            'category': 'category',
            'place': 'place 01',
            'code': 'code 01',
            'item_image': 'item_image',
        }).encode('utf-8')
        api.requests.get.return_value = mocked_get_zaico_response

        mocked_update_zaico_response = requests.Response()
        mocked_update_zaico_response.status_code = 200
        mocked_update_zaico_response._content = json.dumps({}).encode('utf-8')
        mocked_compensate_zaico_response = requests.Response()
        mocked_compensate_zaico_response.status_code = 500
        mocked_compensate_zaico_response._content = json.dumps({}).encode('utf-8')

        def put_return_value():
            cnt = 0

            def _result(*args, **kwargs):
                nonlocal cnt
                cnt += 1
                if cnt == 1:
                    return mocked_update_zaico_response
                else:
                    return mocked_compensate_zaico_response
            return _result

        api.requests.put.side_effect = put_return_value()

        mocked_post_shipment_response = requests.Response()
        mocked_post_shipment_response.status_code = shipment_error_code
        mocked_post_shipment_response._content = json.dumps(shipment_error_body).encode('utf-8')
        api.requests.post.return_value = mocked_post_shipment_response

        payload = {
            'destination_id': '1',
            'items': [
                {
                    'id': 10,
                    'reservation': reservation,
                },
            ],
        }

        response = app.test_client().post(self.PATH, headers=self.HEADERS, json=payload)
        assert response.status_code == 500
        if shipment_error_code in (422, 423,):
            rid = 1 if 'id' in shipment_error_body else None
            emsg = shipment_error_body['message'] if 'message' in shipment_error_body else ''
            assert response.json == {
                'message': 'compensatation of Zaico is failed in RobotBusyError',
                'root_cause': f"('RobotBusyError, status_code={shipment_error_code}, robot_id={rid}', '{emsg}')",
                'compensated': {
                    'automatically_compensated': [],
                    'need_to_manual_compensate': [
                        {
                            'id': 10,
                            'prev_quantity': quantity,
                            'new_quantity': quantity - reservation,
                            'reservation': reservation,
                            'title': 'item 01',
                            'unit': 'unit',
                            'category': 'category',
                            'place': 'place 01',
                            'code': 'code 01',
                            'item_image': 'item_image'
                        }
                    ],
                },
            }
        else:
            assert response.json == {
                'message': 'exception occured when notify shipment',
                'root_cause': 'RBError, status_code=500',
            }
        assert api.requests.get.call_count == 1
        assert api.requests.get.call_args == call(
            f'{const.ZAICO_ENDPOINT}10/',
            headers={
                'Authorization': f'Bearer {const.ZAICO_TOKEN}',
                'Content-Type': 'application/json'
            }
        )
        assert api.requests.put.call_count == 2
        assert api.requests.put.call_args_list[0] == call(
            f'{const.ZAICO_ENDPOINT}10/',
            headers={
                'Authorization': f'Bearer {const.ZAICO_TOKEN}',
                'Content-Type': 'application/json'
            },
            json={
                'quantity': quantity - reservation,
            }
        )
        assert api.requests.put.call_args_list[1] == call(
            f'{const.ZAICO_ENDPOINT}10/',
            headers={
                'Authorization': f'Bearer {const.ZAICO_TOKEN}',
                'Content-Type': 'application/json'
            },
            json={
                'quantity': quantity
            }
        )

        assert api.requests.post.call_count == 1
        assert api.requests.post.call_args == call(
            const.SHIPMENTAPI_ENDPOINT,
            headers={
                'Content-Type': 'application/json'
            },
            json={
                'result': 'success',
                'destination': {
                    'id': 1,
                    'name': 'dest_01'
                },
                'updated': [
                    {
                        'id': 10,
                        'prev_quantity': quantity,
                        'new_quantity': quantity - reservation,
                        'reservation': reservation,
                        'title': 'item 01',
                        'unit': 'unit',
                        'category': 'category',
                        'place': 'place 01',
                        'code': 'code 01',
                        'item_image': 'item_image'
                    }
                ],
                'caller': const.CALLER_NAME,
            }
        )

    @pytest.mark.parametrize('payload', [
        'dummy', 1, 1e-1, True, [], None,
        {}, {'items': []}, {'destination_id': 1}, {'items': None, 'destination_id': 1}
    ])
    def test_invalid_payload(self, app, payload):
        response = app.test_client().post(self.PATH, headers=self.HEADERS, json=payload)
        assert response.status_code == 400
        assert response.json == {'message': 'invalid payload'}

    def test_invalid_contenttype(self, app):
        headers = {'content-type': 'application/x-www-form-urlencoded'}
        response = app.test_client().post(self.PATH, headers=headers, data={})
        assert response.status_code == 400
        assert response.json == {'message': 'invalid payload'}

    @pytest.mark.parametrize('destination_id, expected_json', [
        (999, {
            'message': 'destination(id=999) does not found',
        }),
        ('999', {
            'message': 'destination(id=999) does not found',
        }),
        (1e-1, {
            'message': 'destination(id=0.1) does not found',
        }),
        (False, {
            'message': 'destination(id=False) does not found',
        }),
        ('dummy', {
            'message': 'can not get destination detail',
            'root_cause': "invalid literal for int() with base 10: 'dummy'",
        }),
        ([], {
            'message': 'can not get destination detail',
            'root_cause': "int() argument must be a string, a bytes-like object or a number, not 'list'",
        }),
        ({}, {
            'message': 'can not get destination detail',
            'root_cause': "int() argument must be a string, a bytes-like object or a number, not 'dict'",
        }),
        (None, {
            'message': 'can not get destination detail',
            'root_cause': "int() argument must be a string, a bytes-like object or a number, not 'NoneType'",
        }),
    ])
    def test_destination_not_found(self, mocker, app, destination_id, expected_json):
        payload = {
            'destination_id': destination_id,
            'items': [
                {
                    'id': 10,
                    'reservation': 1,
                },
            ],
        }

        response = app.test_client().post(self.PATH, headers=self.HEADERS, json=payload)
        assert response.status_code == 404
        assert response.json == expected_json
        assert api.requests.get.call_count == 0
        assert api.requests.put.call_count == 0
        assert api.requests.post.call_count == 0

    @pytest.mark.parametrize('zaico_get_error_code, zaico_get_error_body', [
        (404, {'message': 'zaico_get_error, status_code=404'}),
        (400, {'message': 'zaico_get_error, status_code=400'}),
    ])
    def test_get_zaico_error(self, mocker, app, zaico_get_error_code, zaico_get_error_body):
        mocked_get_zaico_response = requests.Response()
        mocked_get_zaico_response.status_code = zaico_get_error_code
        mocked_get_zaico_response._content = json.dumps(zaico_get_error_body).encode('utf-8')
        api.requests.get.return_value = mocked_get_zaico_response

        payload = {
            'destination_id': '1',
            'items': [
                {
                    'id': 10,
                    'reservation': 1,
                },
            ],
        }

        response = app.test_client().post(self.PATH, headers=self.HEADERS, json=payload)
        assert response.status_code == 404 if zaico_get_error_code == 404 else 500
        assert response.json == {
            'message': 'can not get stock detail from zaico',
            'root_cause': zaico_get_error_body,
        }
        assert api.requests.get.call_count == 1
        assert api.requests.get.call_args == call(
            f'{const.ZAICO_ENDPOINT}10/',
            headers={
                'Authorization': f'Bearer {const.ZAICO_TOKEN}',
                'Content-Type': 'application/json'
            }
        )
        assert api.requests.put.call_count == 0
        assert api.requests.post.call_count == 0

    @pytest.mark.parametrize('zaico_put_error_code, zaico_put_error_body', [
        (404, {'message': 'zaico_put_error, status_code=404'}),
        (400, {'message': 'zaico_put_error, status_code=400'}),
    ])
    def test_put_zaico_error(self, mocker, app, zaico_put_error_code, zaico_put_error_body):
        mocked_get_zaico_response = requests.Response()
        mocked_get_zaico_response.status_code = 200
        mocked_get_zaico_response._content = json.dumps({
            'quantity': 10,
            'title': 'item 01',
            'unit': 'unit',
            'category': 'category',
            'place': 'place 01',
            'code': 'code 01',
            'item_image': 'item_image',
        }).encode('utf-8')
        api.requests.get.return_value = mocked_get_zaico_response

        mocked_update_zaico_response = requests.Response()
        mocked_update_zaico_response.status_code = zaico_put_error_code
        mocked_update_zaico_response._content = json.dumps(zaico_put_error_body).encode('utf-8')
        api.requests.put.return_value = mocked_update_zaico_response

        payload = {
            'destination_id': '1',
            'items': [
                {
                    'id': 10,
                    'reservation': 1,
                },
            ],
        }

        response = app.test_client().post(self.PATH, headers=self.HEADERS, json=payload)
        assert response.status_code == 404 if zaico_put_error_code == 404 else 500
        assert response.json == {
            'message': 'can not put stock detail to zaico',
            'root_cause': zaico_put_error_body,
        }
        assert api.requests.get.call_count == 1
        assert api.requests.get.call_args == call(
            f'{const.ZAICO_ENDPOINT}10/',
            headers={
                'Authorization': f'Bearer {const.ZAICO_TOKEN}',
                'Content-Type': 'application/json'
            }
        )
        assert api.requests.put.call_count == 1
        assert api.requests.put.call_args == call(
            f'{const.ZAICO_ENDPOINT}10/',
            headers={
                'Authorization': f'Bearer {const.ZAICO_TOKEN}',
                'Content-Type': 'application/json'
            },
            json={
                'quantity': 9,
            }
        )
        assert api.requests.post.call_count == 0
