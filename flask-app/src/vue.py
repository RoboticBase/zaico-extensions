from flask import Blueprint, render_template

app = Blueprint('vue', __name__)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def index(path):
    return render_template('index.html')
