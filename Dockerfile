FROM python:3.7-alpine3.10
MAINTAINER Nobuyuki Matsui <nobuyuki.matsui@gmail.com>

ARG LISTEN_PORT
ENV LISTEN_PORT ${LISTEN_PORT:-3000}

COPY ./flask-app /opt/flask-app
COPY ./vue-app/babel.config.js /opt/vue-app/balel.config.js
COPY ./vue-app/package.json /opt/vue-app/package.json
COPY ./vue-app/package-lock.json /opt/vue-app/package-lock.json
COPY ./vue-app/postcss.config.js /opt/vue-app/postcss.config.js
COPY ./vue-app/vue.config.js /opt/vue-app/vue.config.js
COPY ./vue-app/public /opt/vue-app/public
COPY ./vue-app/src /opt/vue-app/src
COPY ./vue-app/.browserslistrc /opt/vue-app/.browserslistrc
COPY ./vue-app/.eslintrc.js /opt/vue-app/.eslintrc.js

WORKDIR /opt/flask-app

RUN apk update && \
    apk add --no-cache nginx supervisor && \
    apk add --no-cache --virtual .nodejs nodejs npm && \
    apk add --no-cache --virtual .build python3-dev build-base linux-headers pcre-dev && \
    cd ../vue-app && npm install && npm run build && cd ../flask-app && \
    pip install pipenv uwsgi~=2.0 && \
    pipenv install --system && \
    rm /etc/nginx/nginx.conf && \
    apk del --purge .nodejs && \
    apk del --purge .build && \
    rm -r /root/.cache

COPY docker-conf/nginx.conf /etc/nginx/nginx.conf
COPY docker-conf/flask-nginx.conf /etc/nginx/conf.d/flask-nginx.conf
COPY docker-conf/uwsgi.ini /etc/uwsgi/uwsgi.ini
COPY docker-conf/supervisord.conf /etc/supervisord.conf
COPY docker-conf/entrypoint.sh /opt

RUN chmod a+x /opt/entrypoint.sh

ENTRYPOINT /opt/entrypoint.sh
