from flask import Blueprint, make_response, jsonify

app = Blueprint('errors', __name__)


@app.app_errorhandler(400)
@app.app_errorhandler(401)
@app.app_errorhandler(403)
@app.app_errorhandler(404)
@app.app_errorhandler(405)
@app.app_errorhandler(500)
def error_handler(error):
    code = error.code if hasattr(error, 'code') else 500
    description = error.description if hasattr(error, 'description') else {}
    return make_response(jsonify(description), code)


class RobotBusyError(Exception):
    def __init__(self, *args, **kwargs):
        self.status_code = kwargs.pop('status_code')
        self.robot_id = kwargs.pop('robot_id')
        super().__init__(*args, **kwargs)


class RBError(Exception):
    def __init__(self, *args, **kwargs):
        self.status_code = kwargs.pop('status_code')
        super().__init__(*args, **kwargs)
