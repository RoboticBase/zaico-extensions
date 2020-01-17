import os
import importlib

import pytest
import lazy_import

from src import const


@pytest.fixture(scope='function', autouse=True)
def setup_environments():
    os.environ[const.ZAICO_TOKEN] = 'ZAICO_TOKEN'
    os.environ[const.SHIPMENTAPI_ENDPOINT] = 'SHIPMENTAPI_ENDPOINT'
    os.environ[const.SHIPMENTAPI_TOKEN] = 'SHIPMENTAPI_TOKEN'
    os.environ[const.DESTINATIONS] = '[]'
    yield


@pytest.fixture(scope='function', autouse=True)
def teardown_environments():
    yield
    if const.ZAICO_TOKEN in os.environ:
        del os.environ[const.ZAICO_TOKEN]
    if const.SHIPMENTAPI_ENDPOINT in os.environ:
        del os.environ[const.SHIPMENTAPI_ENDPOINT]
    if const.SHIPMENTAPI_TOKEN in os.environ:
        del os.environ[const.SHIPMENTAPI_TOKEN]
    if const.DESTINATIONS in os.environ:
        del os.environ[const.DESTINATIONS]


@pytest.fixture
def app():
    main = lazy_import.lazy_module('main')
    yield main.app
    importlib.reload(main)
