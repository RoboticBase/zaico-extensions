install:
	@cd flask-app && pipenv install --dev --system
	@cd vue-app && npm install

lint:
	@cd flask-app && pipenv run lint
	@cd vue-app && npm run lint

unittest:
	@cd flask-app && pipenv run unittest
	@cd vue-app && npm run test:unit
