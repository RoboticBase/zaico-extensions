import flask

import pytest
import lazy_import

from src import vue

main = lazy_import.lazy_module('main')

TEST_TEMPLATE = '<html><head></head><body>test</body></html>'


@pytest.fixture(scope='function')
def tmp_template_folder(tmpdir):
    fh = tmpdir.join('index.html')
    fh.write(TEST_TEMPLATE)
    yield str(tmpdir)


class TestIndex:

    @pytest.mark.parametrize('path', [
        '/',
        '/dummy',
        '/dummy/',
        '/dummy/dummy',
    ])
    def test_success(self, tmp_template_folder, path):
        app = main.app
        app.template_folder = tmp_template_folder

        app.register_blueprint(vue.app)

        with app.test_client() as client:
            response = client.get(path)
            assert response.status_code == 200
            assert response.data.decode('utf-8') == TEST_TEMPLATE
            assert flask.request.path == path
