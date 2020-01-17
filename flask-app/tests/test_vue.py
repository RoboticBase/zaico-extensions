import flask

import pytest

from src import vue


TEST_TEMPLATE = '<html><head></head><body>test</body></html>'


@pytest.fixture
def inject_mock(mocker):
    flask.templating._render = mocker.MagicMock(return_value=TEST_TEMPLATE)
    yield


@pytest.mark.usefixtures('inject_mock')
class TestIndex:

    @pytest.mark.parametrize('path', [
        '/',
        '/dummy',
        '/dummy/',
        '/dummy/dummy',
    ])
    def test_success(self, app, path):
        app.register_blueprint(vue.app)

        with app.test_client() as client:
            response = client.get(path)
            assert response.status_code == 200
            assert response.data.decode('utf-8') == TEST_TEMPLATE
            assert flask.request.path == path
